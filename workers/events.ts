import { answerWithAgent } from "@/server/integrations/openai-agent";
import { sendCheckoutTemplate, sendWhatsAppText } from "@/server/integrations/meta";
import { applyAsaasPayment, asaasStatusEvent, type AsaasPaymentSnapshot } from "@/server/integrations/asaas-payment";
import type { RuntimeSecrets } from "@/server/secrets";

type EventBody = { type: string; externalId?: string; checkoutId?: string; providerPaymentId?: string; id?: string; leadId?: string };
type WorkerEnv = Env & RuntimeSecrets;

async function handleWhatsAppIncoming(env: WorkerEnv, externalId: string) {
  const stored = await env.DB.prepare("SELECT id,payload_json FROM webhook_events WHERE provider='meta' AND external_id=?").bind(externalId).first<{ id: string; payload_json: string }>();
  if (!stored) return;
  const payload = JSON.parse(stored.payload_json) as { event: { id: string; from: string; type: string; text?: { body?: string } } };
  const event = payload.event;
  const phone = event.from.replace(/\D/g, "");
  const lead = await env.DB.prepare("SELECT id FROM leads WHERE replace(normalized_phone,'+','')=?").bind(phone).first<{ id: string }>();
  const now = new Date().toISOString();
  await env.DB.prepare(`INSERT INTO conversations (id,lead_id,channel,external_id,human_active,created_at,updated_at)
    VALUES (?,?,'whatsapp',?,0,?,?) ON CONFLICT(channel,external_id) DO UPDATE SET lead_id=coalesce(conversations.lead_id,excluded.lead_id),updated_at=excluded.updated_at`)
    .bind(crypto.randomUUID(),lead?.id ?? null,phone,now,now).run();
  const conversation = await env.DB.prepare("SELECT id,human_active,opted_out_at FROM conversations WHERE channel='whatsapp' AND external_id=?").bind(phone)
    .first<{ id: string; human_active: number; opted_out_at: string | null }>();
  if (!conversation) throw new Error("Conversation upsert failed");
  const text = event.text?.body?.trim() ?? "";
  await env.DB.prepare("INSERT OR IGNORE INTO messages (id,conversation_id,external_id,direction,type,body,status,payload_json,created_at) VALUES (?,?,?,'IN',?,?,'RECEIVED',?,?)")
    .bind(crypto.randomUUID(),conversation.id,event.id,event.type,text || null,JSON.stringify(event),now).run();
  await env.DB.prepare("UPDATE webhook_events SET processed_at=? WHERE id=?").bind(now,stored.id).run();
  if (!text || conversation.opted_out_at) return;
  if (/^(sair|parar|cancelar mensagens|não quero receber)$/i.test(text)) {
    await env.DB.prepare("UPDATE conversations SET opted_out_at=?,human_active=1,updated_at=? WHERE id=?").bind(now,now,conversation.id).run();
    await sendWhatsAppText(env,phone,"Tudo certo. Você não receberá novas mensagens automáticas.");
    return;
  }
  const explicitHandoff = /(comprar|pagar|pix|cart[aã]o|fechar|reclama|atendente|humano|pessoa)/i.test(text);
  if (conversation.human_active || explicitHandoff) {
    await env.DB.prepare("UPDATE conversations SET human_active=1,updated_at=? WHERE id=?").bind(now,conversation.id).run();
    if (lead) await env.DB.prepare("INSERT INTO activities (id,lead_id,type,title,body,created_at) VALUES (?,?,'HANDOFF','Atendimento humano solicitado',?,?)").bind(crypto.randomUUID(),lead.id,text,now).run();
    await sendWhatsAppText(env,phone,"Entendi. Vou transferir seu atendimento para uma pessoa da equipe New Wed.");
    return;
  }
  const answer = await answerWithAgent(env,{ message: text, leadId: lead?.id });
  if (answer.handoff) {
    await env.DB.prepare("UPDATE conversations SET human_active=1,updated_at=? WHERE id=?").bind(now,conversation.id).run();
    if (lead) await env.DB.prepare("INSERT INTO activities (id,lead_id,type,title,body,created_at) VALUES (?,?,'HANDOFF','Agente solicitou apoio humano',?,?)").bind(crypto.randomUUID(),lead.id,text,now).run();
  }
  const sent = await sendWhatsAppText(env,phone,answer.reply);
  await env.DB.prepare("INSERT INTO messages (id,conversation_id,external_id,direction,type,body,status,payload_json,created_at) VALUES (?,?,?,'OUT','text',?,'SENT',?,?)")
    .bind(crypto.randomUUID(),conversation.id,sent.messages?.[0]?.id ?? null,answer.reply,JSON.stringify({ agent: true, confidence: answer.confidence }),new Date().toISOString()).run();
}

async function handleStatus(env: WorkerEnv, externalId: string) {
  const stored = await env.DB.prepare("SELECT id,payload_json FROM webhook_events WHERE provider='meta' AND external_id=?").bind(externalId).first<{ id: string; payload_json: string }>();
  if (!stored) return;
  const payload = JSON.parse(stored.payload_json) as { event: { id: string; status?: string } };
  await env.DB.batch([
    env.DB.prepare("UPDATE messages SET status=upper(?) WHERE external_id=?").bind(payload.event.status ?? "unknown",payload.event.id),
    env.DB.prepare("UPDATE webhook_events SET processed_at=? WHERE id=?").bind(new Date().toISOString(),stored.id),
  ]);
}

async function sendCheckout(env: WorkerEnv, checkoutId: string) {
  const row = await env.DB.prepare(`SELECT c.url,c.lead_id,l.normalized_phone FROM checkouts c JOIN leads l ON l.id=c.lead_id WHERE c.id=? AND c.status!='PAID'`)
    .bind(checkoutId).first<{ url: string; lead_id: string; normalized_phone: string }>();
  if (!row) return;
  await sendCheckoutTemplate(env,row.normalized_phone.replace(/\D/g,""),row.url);
  await env.DB.prepare("INSERT INTO activities (id,lead_id,type,title,body,created_at) VALUES (?,?,'CHECKOUT_SENT','Checkout enviado pelo WhatsApp',?,?)")
    .bind(crypto.randomUUID(),row.lead_id,row.url,new Date().toISOString()).run();
}

async function reconcileAsaas(env: WorkerEnv, providerPaymentId: string) {
  if (!env.ASAAS_API_KEY) throw new Error("ASAAS_API_KEY não configurada");
  const response = await fetch(`https://api.asaas.com/v3/payments/${encodeURIComponent(providerPaymentId)}`, {
    headers: { access_token: env.ASAAS_API_KEY, "user-agent": "NewWedPlatform/1.0" },
  });
  if (!response.ok) throw new Error(`Asaas reconciliation failed: ${response.status}`);
  const payment = await response.json() as AsaasPaymentSnapshot;
  await applyAsaasPayment(env,asaasStatusEvent(payment.status),payment,{ source: "scheduled_reconciliation", payment });
}

async function handleEvent(env: WorkerEnv, body: EventBody) {
  if (body.type === "whatsapp.incoming" && body.externalId) return handleWhatsAppIncoming(env,body.externalId);
  if (body.type === "whatsapp.status" && body.externalId) return handleStatus(env,body.externalId);
  if (body.type === "checkout.send" && body.checkoutId) return sendCheckout(env,body.checkoutId);
  if (body.type === "asaas.reconcile" && body.providerPaymentId) return reconcileAsaas(env,body.providerPaymentId);
  if (body.type === "lead.submitted" && body.leadId) {
    await env.DB.prepare("INSERT INTO activities (id,lead_id,type,title,created_at) VALUES (?,?,'LEAD_CREATED','Pré-inscrição recebida',?)")
      .bind(crypto.randomUUID(),body.leadId,new Date().toISOString()).run();
  }
}

export default {
  async queue(batch, env) {
    for (const message of batch.messages) {
      try { await handleEvent(env as WorkerEnv,message.body as EventBody); message.ack(); }
      catch (error) { console.error(JSON.stringify({ level: "error", event: "queue.failed", messageId: message.id, error: error instanceof Error ? error.message : String(error) })); message.retry(); }
    }
  },
  async scheduled(_controller, env) {
    const workerEnv = env as WorkerEnv;
    const pending = await workerEnv.DB.prepare("SELECT id,type,aggregate_id,payload_json FROM outbox_events WHERE published_at IS NULL AND attempts<10 ORDER BY created_at LIMIT 50").all<{ id: string; type: string; aggregate_id: string; payload_json: string }>();
    for (const event of pending.results) {
      try {
        await workerEnv.EVENTS_QUEUE.send({ id: event.id, type: event.type, ...JSON.parse(event.payload_json) });
        await workerEnv.DB.prepare("UPDATE outbox_events SET published_at=?,attempts=attempts+1,last_error=NULL WHERE id=?").bind(new Date().toISOString(),event.id).run();
      } catch (error) {
        await workerEnv.DB.prepare("UPDATE outbox_events SET attempts=attempts+1,last_error=? WHERE id=?").bind(error instanceof Error ? error.message : String(error),event.id).run();
      }
    }
    if (workerEnv.ASAAS_API_KEY) {
      const pendingPayments = await workerEnv.DB.prepare("SELECT provider_payment_id FROM checkouts WHERE provider='asaas' AND provider_payment_id IS NOT NULL AND status IN ('PENDING','OVERDUE') ORDER BY updated_at LIMIT 50")
        .all<{ provider_payment_id: string }>();
      await Promise.all(pendingPayments.results.map((payment) => workerEnv.EVENTS_QUEUE.send({
        type: "asaas.reconcile",
        providerPaymentId: payment.provider_payment_id,
      })));
    }
  },
} satisfies ExportedHandler<Env>;
