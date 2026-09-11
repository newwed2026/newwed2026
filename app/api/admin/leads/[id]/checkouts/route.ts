import { env } from "cloudflare:workers";
import { checkoutSchema } from "@/features/leads/schemas";
import { requireAccessUser } from "@/server/auth/access";
import { createAsaasPayment, findOrCreateCustomer } from "@/server/integrations/asaas";
import { errorResponse, HttpError, json, requireIdempotencyKey } from "@/server/http";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireAccessUser(request, ["admin", "gestor"]);
    const idempotencyKey = requireIdempotencyKey(request);
    const prior = await env.DB.prepare("SELECT response_json FROM idempotency_keys WHERE key=? AND scope='checkout'").bind(idempotencyKey).first<{ response_json: string }>();
    if (prior) return json(JSON.parse(prior.response_json));
    const { id: leadId } = await params;
    const input = checkoutSchema.parse(await request.json());
    const lead = await env.DB.prepare("SELECT id,name,email,normalized_phone,stage,edition_id FROM leads WHERE id=?").bind(leadId)
      .first<{ id: string; name: string; email: string; normalized_phone: string; stage: string; edition_id: string | null }>();
    if (!lead) throw new HttpError(404, "LEAD_NOT_FOUND", "Lead não encontrado.");
    if (lead.stage !== "QUALIFICADO") throw new HttpError(409, "LEAD_NOT_QUALIFIED", "O checkout só pode ser criado para um lead qualificado.");
    if (lead.edition_id !== input.editionId) throw new HttpError(422, "EDITION_MISMATCH", "A edição não corresponde ao interesse do lead.");
    const offer = await env.DB.prepare(`SELECT p.id,p.amount_cents,p.name,e.name AS edition_name,e.capacity,a.reserved,a.sold
      FROM price_batches p JOIN editions e ON e.id=p.edition_id JOIN availability a ON a.edition_id=e.id
      WHERE p.id=? AND p.edition_id=? AND p.active=1 AND e.status='OPEN'`)
      .bind(input.priceBatchId,input.editionId).first<{ id: string; amount_cents: number; name: string; edition_name: string; capacity: number; reserved: number; sold: number }>();
    if (!offer) throw new HttpError(422, "PRICE_UNAVAILABLE", "Preço ou edição indisponível.");
    if (offer.reserved + offer.sold >= offer.capacity) throw new HttpError(409, "SOLD_OUT", "Não há vagas disponíveis.");

    const checkoutId = crypto.randomUUID();
    const customerId = await findOrCreateCustomer({ id: lead.id, name: lead.name, email: lead.email, normalizedPhone: lead.normalized_phone });
    const payment = await createAsaasPayment({ customerId, checkoutId, method: input.method, amountCents: offer.amount_cents, dueDate: input.dueDate, description: `${offer.edition_name} — ${offer.name}` });
    const now = new Date().toISOString();
    const responseBody = { checkoutId, url: payment.invoiceUrl, status: "PENDING", method: input.method, amountCents: offer.amount_cents };
    await env.DB.batch([
      env.DB.prepare(`INSERT INTO checkouts (id,lead_id,edition_id,price_batch_id,provider,provider_customer_id,provider_payment_id,method,amount_cents,url,status,idempotency_key,authorized_by,created_at,updated_at)
        VALUES (?,?,?,?,'asaas',?,?,?,?,?,'PENDING',?,?,?,?)`)
        .bind(checkoutId,leadId,input.editionId,input.priceBatchId,customerId,payment.id,input.method,offer.amount_cents,payment.invoiceUrl,idempotencyKey,actor.id,now,now),
      env.DB.prepare("UPDATE leads SET stage='AGUARDANDO_PAGAMENTO',updated_at=? WHERE id=? AND stage='QUALIFICADO'").bind(now,leadId),
      env.DB.prepare("INSERT INTO pipeline_history (id,lead_id,from_stage,to_stage,actor_id,reason,created_at) VALUES (?,?,'QUALIFICADO','CHECKOUT_ENVIADO',?,'Checkout autorizado e criado',?)")
        .bind(crypto.randomUUID(),leadId,actor.id,now),
      env.DB.prepare("INSERT INTO pipeline_history (id,lead_id,from_stage,to_stage,actor_id,reason,created_at) VALUES (?,?,'CHECKOUT_ENVIADO','AGUARDANDO_PAGAMENTO',?,'Cobrança pendente no Asaas',?)")
        .bind(crypto.randomUUID(),leadId,actor.id,now),
      env.DB.prepare("UPDATE availability SET reserved=reserved+1,version=version+1,updated_at=? WHERE edition_id=? AND reserved+sold< (SELECT capacity FROM editions WHERE id=?)")
        .bind(now,input.editionId,input.editionId),
      env.DB.prepare("INSERT INTO idempotency_keys (key,scope,resource_id,response_json,created_at) VALUES (?,'checkout',?,?,?)").bind(idempotencyKey,checkoutId,JSON.stringify(responseBody),now),
      env.DB.prepare("INSERT INTO audit_log (id,actor_id,action,entity_type,entity_id,after_json,ip,created_at) VALUES (?,?,'checkout.create','checkout',?,?,?,?)")
        .bind(crypto.randomUUID(),actor.id,checkoutId,JSON.stringify(responseBody),request.headers.get("cf-connecting-ip"),now),
    ]);
    return json(responseBody, { status: 201 });
  } catch (error) { return errorResponse(error); }
}
