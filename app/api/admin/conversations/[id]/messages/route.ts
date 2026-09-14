import { env } from "cloudflare:workers";
import { manualMessageSchema } from "@/features/conversations/model";
import { requireAccessUser } from "@/server/auth/access";
import { errorResponse,HttpError,json,requireIdempotencyKey } from "@/server/http";
import { publishOutbox } from "@/server/outbox";
import { enforceRateLimit } from "@/server/rate-limit";
import { requestIdFrom,responseWithRequestId } from "@/server/request-context";

type StoredResponse = { response_json:string };

async function priorResponse(key: string) {
  return env.DB.prepare("SELECT response_json FROM idempotency_keys WHERE key=? AND scope='conversation_message'").bind(key).first<StoredResponse>();
}

export async function POST(request: Request,{ params }:{ params:Promise<{ id:string }> }) {
  const requestId = requestIdFrom(request);
  try {
    const actor = await requireAccessUser(request);
    const key = requireIdempotencyKey(request);
    const prior = await priorResponse(key);
    if (prior) return responseWithRequestId(json(JSON.parse(prior.response_json),{ status:202 }),requestId);
    const { id } = await params;
    await enforceRateLimit(env,{scope:"conversation.manual.message",identity:actor.id,limit:30,windowSeconds:60});
    const input = manualMessageSchema.parse(await request.json());
    const conversation = await env.DB.prepare("SELECT mode,claimed_by,opted_out_at,agent_processing_token FROM conversations WHERE id=?")
      .bind(id).first<{ mode:string;claimed_by:string|null;opted_out_at:string|null;agent_processing_token:string|null }>();
    if (!conversation) throw new HttpError(404,"CONVERSATION_NOT_FOUND","Conversa não encontrada.");
    if (conversation.opted_out_at) throw new HttpError(409,"CONVERSATION_OPTED_OUT","O contato recusou novas mensagens.");
    if (conversation.mode !== "HUMAN" || conversation.claimed_by !== actor.id) throw new HttpError(409,"CONVERSATION_NOT_CLAIMED","Assuma esta conversa antes de responder.");
    if (conversation.agent_processing_token) throw new HttpError(409,"AGENT_REPLY_IN_PROGRESS","A pausa do agente ainda está sendo concluída. Aguarde antes de responder.");

    const messageId = crypto.randomUUID();
    const outboxId = crypto.randomUUID();
    const now = new Date().toISOString();
    const responseBody = { conversationId:id,messageId,status:"SEND_PENDING" };
    try {
      const [inserted] = await env.DB.batch([
        env.DB.prepare(`INSERT INTO messages (id,conversation_id,actor_id,direction,type,body,status,payload_json,request_id,created_at)
          SELECT ?,?,?, 'OUT','text',?,'SEND_PENDING',?,?,? FROM conversations WHERE id=? AND mode='HUMAN' AND claimed_by=? AND opted_out_at IS NULL AND agent_processing_token IS NULL`)
          .bind(messageId,id,actor.id,input.body,JSON.stringify({ source:"human" }),requestId,now,id,actor.id),
        env.DB.prepare("INSERT INTO outbox_events (id,type,aggregate_id,dedupe_key,payload_json,attempts,request_id,created_at) SELECT ?,'conversation.manual.send',?,?,?,0,?,? WHERE changes()=1")
          .bind(outboxId,id,`conversation.manual.send:${messageId}`,JSON.stringify({ conversationId:id,messageId,requestId }),requestId,now),
        env.DB.prepare("INSERT INTO idempotency_keys (key,scope,resource_id,response_json,created_at) SELECT ?,'conversation_message',?,?,? WHERE changes()=1")
          .bind(key,messageId,JSON.stringify(responseBody),now),
        env.DB.prepare("INSERT INTO audit_log (id,actor_id,action,entity_type,entity_id,after_json,ip,request_id,created_at) SELECT ?,?,'conversation.message.queue','message',?,?,?,?,? WHERE changes()=1")
          .bind(crypto.randomUUID(),actor.id,messageId,JSON.stringify({ conversationId:id }),request.headers.get("cf-connecting-ip"),requestId,now),
      ]);
      if ((inserted.meta.changes ?? 0) !== 1) throw new HttpError(409,"CONVERSATION_MESSAGE_CONFLICT","A conversa mudou. Atualize a inbox e tente novamente.");
    } catch (error) {
      const concurrent = await priorResponse(key);
      if (concurrent) return responseWithRequestId(json(JSON.parse(concurrent.response_json),{ status:202 }),requestId);
      const reused = await env.DB.prepare("SELECT scope FROM idempotency_keys WHERE key=?").bind(key).first<{ scope:string }>();
      if (reused) throw new HttpError(409,"IDEMPOTENCY_KEY_REUSED","A chave de idempotência já foi usada em outra operação.");
      throw error;
    }
    await publishOutbox(env,{ id:outboxId,type:"conversation.manual.send",conversationId:id,messageId,requestId });
    return responseWithRequestId(json(responseBody,{ status:202 }),requestId);
  } catch (error) { return responseWithRequestId(errorResponse(error,requestId),requestId); }
}
