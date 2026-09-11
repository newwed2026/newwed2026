import { env } from "cloudflare:workers";
import { requireAccessUser } from "@/server/auth/access";
import { errorResponse, HttpError, json, requireIdempotencyKey } from "@/server/http";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireAccessUser(request);
    const key = requireIdempotencyKey(request);
    const { id } = await params;
    const prior = await env.DB.prepare("SELECT response_json FROM idempotency_keys WHERE key=? AND scope='checkout_resend'").bind(key).first<{ response_json: string }>();
    if (prior) return json(JSON.parse(prior.response_json));
    const checkout = await env.DB.prepare("SELECT id,lead_id,url,status FROM checkouts WHERE id=?").bind(id).first<{ id: string; lead_id: string; url: string; status: string }>();
    if (!checkout) throw new HttpError(404, "CHECKOUT_NOT_FOUND", "Checkout não encontrado.");
    if (!checkout.url || checkout.status === "PAID") throw new HttpError(409, "CHECKOUT_NOT_SENDABLE", "Este checkout não pode ser reenviado.");
    const outboxId = crypto.randomUUID();
    const now = new Date().toISOString();
    const responseBody = { checkoutId: id, queued: true };
    await env.DB.batch([
      env.DB.prepare("INSERT INTO outbox_events (id,type,aggregate_id,payload_json,attempts,created_at) VALUES (?,'checkout.send',?,?,0,?)").bind(outboxId,id,JSON.stringify({ checkoutId: id, actorId: actor.id }),now),
      env.DB.prepare("INSERT INTO idempotency_keys (key,scope,resource_id,response_json,created_at) VALUES (?,'checkout_resend',?,?,?)").bind(key,id,JSON.stringify(responseBody),now),
    ]);
    await env.EVENTS_QUEUE.send({ id: outboxId, type: "checkout.send", checkoutId: id });
    await env.DB.prepare("UPDATE outbox_events SET published_at=? WHERE id=?").bind(new Date().toISOString(),outboxId).run();
    return json(responseBody, { status: 202 });
  } catch (error) { return errorResponse(error); }
}
