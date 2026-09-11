import { env } from "cloudflare:workers";
import { timingSafeEqual } from "@/server/crypto";
import { errorResponse, HttpError, json } from "@/server/http";
import { applyAsaasPayment } from "@/server/integrations/asaas-payment";
import { getSecrets } from "@/server/secrets";

type AsaasWebhook = {
  id?: string;
  event: string;
  dateCreated?: string;
  payment: { id: string; externalReference?: string; value: number; status: string; paymentDate?: string; confirmedDate?: string };
};

export async function POST(request: Request) {
  try {
    const expected = getSecrets().ASAAS_WEBHOOK_TOKEN;
    const received = request.headers.get("asaas-access-token") ?? "";
    if (!expected || !timingSafeEqual(expected, received)) throw new HttpError(401, "INVALID_SIGNATURE", "Webhook não autorizado.");
    const input = await request.json() as AsaasWebhook;
    if (!input.event || !input.payment?.id) throw new HttpError(400, "INVALID_EVENT", "Evento inválido.");
    const externalId = input.id ?? `${input.event}:${input.payment.id}:${input.dateCreated ?? ""}`;
    const now = new Date().toISOString();
    const inserted = await env.DB.prepare("INSERT OR IGNORE INTO webhook_events (id,provider,external_id,event_type,payload_json,created_at) VALUES (?,'asaas',?,?,?,?)")
      .bind(crypto.randomUUID(),externalId,input.event,JSON.stringify(input),now).run();
    if (!inserted.meta.changes) return json({ received: true, duplicate: true });

    const result = await applyAsaasPayment(env,input.event,input.payment,input);
    if (!result.found) {
      await env.DB.prepare("UPDATE webhook_events SET error='Checkout não localizado' WHERE provider='asaas' AND external_id=?").bind(externalId).run();
      return json({ received: true, pendingReconciliation: true }, { status: 202 });
    }
    await env.DB.prepare("UPDATE webhook_events SET processed_at=? WHERE provider='asaas' AND external_id=?").bind(now,externalId).run();
    return json({ received: true });
  } catch (error) { return errorResponse(error); }
}
