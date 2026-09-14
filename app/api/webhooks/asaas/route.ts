import { env } from "cloudflare:workers";
import { timingSafeEqual } from "@/server/crypto";
import { errorResponse,HttpError,json } from "@/server/http";
import { asaasWebhookSchema,processStoredAsaasWebhook,type StoredAsaasWebhook } from "@/server/integrations/asaas-webhook";
import { getSecrets } from "@/server/secrets";

export async function POST(request: Request) {
  try {
    const expected = getSecrets().ASAAS_WEBHOOK_TOKEN;
    const received = request.headers.get("asaas-access-token") ?? "";
    if (!expected || !timingSafeEqual(expected,received)) throw new HttpError(401,"INVALID_SIGNATURE","Webhook não autorizado.");
    const input = asaasWebhookSchema.parse(await request.json());
    const externalId = input.id ?? `${input.event}:${input.payment.id}:${input.dateCreated ?? ""}`;
    const now = new Date().toISOString();
    await env.DB.prepare("INSERT OR IGNORE INTO webhook_events (id,provider,external_id,event_type,payload_json,attempts,created_at) VALUES (?,'asaas',?,?,?,0,?)")
      .bind(crypto.randomUUID(),externalId,input.event,JSON.stringify(input),now).run();
    const stored = await env.DB.prepare("SELECT id,external_id,payload_json,attempts,processed_at FROM webhook_events WHERE provider='asaas' AND external_id=?")
      .bind(externalId).first<StoredAsaasWebhook & { processed_at:string|null }>();
    if (!stored) throw new Error("Webhook upsert failed");
    if (stored.processed_at) return json({ received:true,duplicate:true });

    const result = await processStoredAsaasWebhook(env,stored);
    return result.processed
      ? json({ received:true })
      : json({ received:true,pendingReconciliation:true },{ status:202 });
  } catch (error) { return errorResponse(error); }
}
