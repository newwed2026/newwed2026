import { env } from "cloudflare:workers";
import { requireAccessUser } from "@/server/auth/access";
import { errorResponse,HttpError,json } from "@/server/http";

export async function GET(request: Request,{ params }:{ params:Promise<{ id:string }> }) {
  try {
    await requireAccessUser(request);
    const { id } = await params;
    const checkout = await env.DB.prepare(`SELECT c.id,c.lead_id,c.edition_id,c.price_batch_id,c.provider,c.provider_customer_id,c.provider_payment_id,c.provider_installment_id,
      c.method,c.installment_count,c.amount_cents,c.url,c.status,c.financial_status,c.send_status,c.authorized_by,c.expires_at,c.last_error_code,c.last_error,
      c.last_error_at,c.ready_at,c.send_requested_at,c.sent_at,c.delivered_at,c.pending_at,c.paid_at,c.cancelled_at,c.refunded_at,c.reservation_released_at,
      c.retry_count,c.next_retry_at,c.version,c.created_at,c.updated_at,l.name AS lead_name,l.stage AS lead_stage,e.name AS edition_name,p.name AS price_name
      FROM checkouts c JOIN leads l ON l.id=c.lead_id JOIN editions e ON e.id=c.edition_id JOIN price_batches p ON p.id=c.price_batch_id
      WHERE c.id=?`).bind(id).first<Record<string,unknown>>();
    if (!checkout) throw new HttpError(404,"CHECKOUT_NOT_FOUND","Checkout não encontrado.");

    const [payments,messages,unresolvedWebhooks] = await Promise.all([
      env.DB.prepare("SELECT provider_payment_id,provider_installment_id,installment_number,status,amount_cents,due_date,paid_at,created_at,updated_at FROM payments WHERE checkout_id=? ORDER BY coalesce(installment_number,1),created_at")
        .bind(id).all(),
      env.DB.prepare("SELECT id,external_id,status,template_name,created_at FROM messages WHERE checkout_id=? ORDER BY created_at DESC")
        .bind(id).all(),
      env.DB.prepare(`SELECT id,external_id,event_type,error,attempts,last_attempt_at,next_retry_at,created_at
        FROM webhook_events WHERE provider='asaas' AND processed_at IS NULL
        AND (json_extract(payload_json,'$.payment.externalReference')=? OR json_extract(payload_json,'$.payment.id') IN (SELECT provider_payment_id FROM payments WHERE checkout_id=?))
        ORDER BY created_at DESC`).bind(id,id).all(),
    ]);
    return json({ checkout,payments:payments.results,messages:messages.results,unresolvedWebhooks:unresolvedWebhooks.results });
  } catch (error) { return errorResponse(error); }
}
