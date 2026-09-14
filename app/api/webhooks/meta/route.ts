import { env } from "cloudflare:workers";
import { hmacSha256Hex, timingSafeEqual } from "@/server/crypto";
import { errorResponse, HttpError, json } from "@/server/http";
import { publishOutbox } from "@/server/outbox";
import { getSecrets } from "@/server/secrets";
import { requestIdFrom,responseWithRequestId } from "@/server/request-context";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const expected = getSecrets().META_VERIFY_TOKEN;
  if (url.searchParams.get("hub.mode") === "subscribe" && expected && timingSafeEqual(expected, url.searchParams.get("hub.verify_token") ?? "")) {
    return new Response(url.searchParams.get("hub.challenge") ?? "", { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

export async function POST(request: Request) {
  const requestId = requestIdFrom(request);
  try {
    const secret = getSecrets().META_APP_SECRET;
    if (!secret) throw new HttpError(503, "META_NOT_CONFIGURED", "Integração Meta ainda não configurada.");
    const declared = Number(request.headers.get("content-length") ?? 0);
    if (declared > 256 * 1024) throw new HttpError(413,"PAYLOAD_TOO_LARGE","O payload excede o limite permitido.");
    const body = await request.arrayBuffer();
    if (body.byteLength > 256 * 1024) throw new HttpError(413,"PAYLOAD_TOO_LARGE","O payload excede o limite permitido.");
    const expected = `sha256=${await hmacSha256Hex(secret, body)}`;
    const received = request.headers.get("x-hub-signature-256") ?? "";
    if (!timingSafeEqual(expected, received)) throw new HttpError(401, "INVALID_SIGNATURE", "Webhook não autorizado.");
    const payload = JSON.parse(new TextDecoder().decode(body)) as Record<string, unknown>;
    const entries = (payload.entry as Array<Record<string, unknown>> | undefined) ?? [];
    let queued = 0;
    for (const entry of entries) {
      const changes = (entry.changes as Array<Record<string, unknown>> | undefined) ?? [];
      for (const change of changes) {
        const value = change.value as Record<string, unknown> | undefined;
        const messages = (value?.messages as Array<Record<string, unknown>> | undefined) ?? [];
        const statuses = (value?.statuses as Array<Record<string, unknown>> | undefined) ?? [];
        for (const event of [...messages, ...statuses]) {
          const isMessage = messages.includes(event);
          const providerEventId = String(event.id ?? `${entry.id}:${event.timestamp ?? crypto.randomUUID()}`);
          const externalId = isMessage ? `message:${providerEventId}` : `status:${providerEventId}:${String(event.status ?? "unknown")}`;
          const now = new Date().toISOString();
          const outboxId = crypto.randomUUID();
          const type = isMessage ? "whatsapp.incoming" : "whatsapp.status";
          await env.DB.batch([
            env.DB.prepare("INSERT OR IGNORE INTO webhook_events (id,provider,external_id,event_type,payload_json,request_id,created_at) VALUES (?,'meta',?,?,?,?,?)")
              .bind(crypto.randomUUID(),externalId,isMessage ? "message" : "status",JSON.stringify({ event,metadata:value?.metadata,contacts:value?.contacts }),requestId,now),
            env.DB.prepare("INSERT OR IGNORE INTO outbox_events (id,type,aggregate_id,dedupe_key,payload_json,attempts,request_id,created_at) SELECT ?,?,?,?, ?,0,?,? WHERE changes()=1")
              .bind(outboxId,type,externalId,`meta.webhook:${externalId}`,JSON.stringify({ externalId,requestId }),requestId,now),
          ]);
          const pending = await env.DB.prepare("SELECT id,published_at FROM outbox_events WHERE dedupe_key=?")
            .bind(`meta.webhook:${externalId}`).first<{ id:string;published_at:string|null }>();
          if (pending && !pending.published_at && await publishOutbox(env,{ id:pending.id,type,externalId,requestId })) {
            queued += 1;
          }
        }
      }
    }
    return responseWithRequestId(json({ received: true, queued }),requestId);
  } catch (error) { return responseWithRequestId(errorResponse(error,requestId),requestId); }
}
