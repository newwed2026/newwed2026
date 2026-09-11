import { env } from "cloudflare:workers";
import { hmacSha256Hex, timingSafeEqual } from "@/server/crypto";
import { errorResponse, HttpError, json } from "@/server/http";
import { getSecrets } from "@/server/secrets";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const expected = getSecrets().META_VERIFY_TOKEN;
  if (url.searchParams.get("hub.mode") === "subscribe" && expected && timingSafeEqual(expected, url.searchParams.get("hub.verify_token") ?? "")) {
    return new Response(url.searchParams.get("hub.challenge") ?? "", { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

export async function POST(request: Request) {
  try {
    const secret = getSecrets().META_APP_SECRET;
    if (!secret) throw new HttpError(503, "META_NOT_CONFIGURED", "Integração Meta ainda não configurada.");
    const body = await request.arrayBuffer();
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
          const externalId = String(event.id ?? `${entry.id}:${event.timestamp ?? crypto.randomUUID()}`);
          const now = new Date().toISOString();
          const inserted = await env.DB.prepare("INSERT OR IGNORE INTO webhook_events (id,provider,external_id,event_type,payload_json,created_at) VALUES (?,'meta',?,?,?,?)")
            .bind(crypto.randomUUID(),externalId,messages.includes(event) ? "message" : "status",JSON.stringify({ event, metadata: value?.metadata, contacts: value?.contacts }),now).run();
          if (inserted.meta.changes) {
            await env.EVENTS_QUEUE.send({ type: messages.includes(event) ? "whatsapp.incoming" : "whatsapp.status", externalId });
            queued += 1;
          }
        }
      }
    }
    return json({ received: true, queued });
  } catch (error) { return errorResponse(error); }
}
