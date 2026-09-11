import { resolveCheckoutStatus } from "@/features/billing/payment-state";

export type AsaasPaymentSnapshot = {
  id: string;
  externalReference?: string;
  value: number;
  status: string;
  paymentDate?: string;
  confirmedDate?: string;
};

export function asaasStatusEvent(status: string): string {
  const normalized = status.toUpperCase();
  if (["RECEIVED", "CONFIRMED", "RECEIVED_IN_CASH"].includes(normalized)) return "PAYMENT_RECEIVED";
  if (["REFUNDED", "REFUND_REQUESTED", "REFUND_IN_PROGRESS"].includes(normalized)) return "PAYMENT_REFUNDED";
  if (normalized === "OVERDUE") return "PAYMENT_OVERDUE";
  if (["DELETED", "CANCELLED", "CREDIT_CARD_CAPTURE_REFUSED"].includes(normalized)) return "PAYMENT_DELETED";
  return `PAYMENT_${normalized}`;
}

export async function applyAsaasPayment(
  env: Pick<Env, "DB">,
  event: string,
  payment: AsaasPaymentSnapshot,
  rawPayload: unknown,
) {
  const checkout = await env.DB.prepare("SELECT id,lead_id,edition_id,amount_cents,status FROM checkouts WHERE provider_payment_id=? OR id=?")
    .bind(payment.id,payment.externalReference ?? "").first<{ id: string; lead_id: string; edition_id: string; amount_cents: number; status: string }>();
  if (!checkout) return { found: false as const };

  const status = resolveCheckoutStatus(checkout.status,event);
  const now = new Date().toISOString();
  const amountCents = Math.round(payment.value * 100);
  const statements: D1PreparedStatement[] = [
    env.DB.prepare(`INSERT INTO payments (id,checkout_id,provider_payment_id,status,amount_cents,paid_at,payload_json,created_at,updated_at)
      VALUES (?,?,?,?,?,?,?,?,?) ON CONFLICT(provider_payment_id) DO UPDATE SET status=excluded.status,paid_at=coalesce(excluded.paid_at,payments.paid_at),payload_json=excluded.payload_json,updated_at=excluded.updated_at`)
      .bind(crypto.randomUUID(),checkout.id,payment.id,status,amountCents,payment.paymentDate ?? payment.confirmedDate ?? null,JSON.stringify(rawPayload),now,now),
  ];

  if (status === "PAID") {
    statements.push(
      env.DB.prepare("UPDATE availability SET reserved=max(0,reserved-1),sold=sold+1,version=version+1,updated_at=? WHERE edition_id=? AND EXISTS (SELECT 1 FROM checkouts WHERE id=? AND status NOT IN ('PAID','REFUNDED'))").bind(now,checkout.edition_id,checkout.id),
      env.DB.prepare("INSERT INTO pipeline_history (id,lead_id,from_stage,to_stage,actor_id,reason,created_at) SELECT ?,id,stage,'PAGO',NULL,'Pagamento confirmado pelo Asaas',? FROM leads WHERE id=? AND stage!='PAGO'").bind(crypto.randomUUID(),now,checkout.lead_id),
      env.DB.prepare("UPDATE leads SET stage='PAGO',updated_at=? WHERE id=? AND stage!='PAGO'").bind(now,checkout.lead_id),
    );
  } else if (status === "CANCELLED") {
    statements.push(
      env.DB.prepare("UPDATE availability SET reserved=max(0,reserved-1),version=version+1,updated_at=? WHERE edition_id=? AND EXISTS (SELECT 1 FROM checkouts WHERE id=? AND status NOT IN ('CANCELLED','PAID','REFUNDED'))").bind(now,checkout.edition_id,checkout.id),
      env.DB.prepare("INSERT INTO pipeline_history (id,lead_id,from_stage,to_stage,actor_id,reason,created_at) SELECT ?,id,stage,'CANCELADO',NULL,'Cobrança cancelada pelo Asaas',? FROM leads WHERE id=? AND stage='AGUARDANDO_PAGAMENTO'").bind(crypto.randomUUID(),now,checkout.lead_id),
      env.DB.prepare("UPDATE leads SET stage='CANCELADO',updated_at=? WHERE id=? AND stage='AGUARDANDO_PAGAMENTO'").bind(now,checkout.lead_id),
    );
  } else if (status === "REFUNDED") {
    statements.push(
      env.DB.prepare("UPDATE availability SET sold=max(0,sold-1),version=version+1,updated_at=? WHERE edition_id=? AND EXISTS (SELECT 1 FROM checkouts WHERE id=? AND status='PAID')").bind(now,checkout.edition_id,checkout.id),
      env.DB.prepare("INSERT INTO pipeline_history (id,lead_id,from_stage,to_stage,actor_id,reason,created_at) SELECT ?,id,stage,'CANCELADO',NULL,'Pagamento estornado pelo Asaas',? FROM leads WHERE id=? AND stage='PAGO'").bind(crypto.randomUUID(),now,checkout.lead_id),
      env.DB.prepare("UPDATE leads SET stage='CANCELADO',updated_at=? WHERE id=? AND stage='PAGO'").bind(now,checkout.lead_id),
      env.DB.prepare("INSERT OR IGNORE INTO refunds (id,payment_id,provider_refund_id,amount_cents,status,created_at,updated_at) SELECT ?,id,?,?,?, ?, ? FROM payments WHERE provider_payment_id=?")
        .bind(crypto.randomUUID(),payment.id,amountCents,status,now,now,payment.id),
    );
  }

  statements.push(env.DB.prepare("UPDATE checkouts SET status=?,updated_at=? WHERE id=?").bind(status,now,checkout.id));
  await env.DB.batch(statements);
  return { found: true as const, checkoutId: checkout.id, status };
}
