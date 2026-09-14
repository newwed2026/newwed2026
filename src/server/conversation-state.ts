import { shouldSummarizeConversation } from "@/features/conversations/model";
import { publishOutbox } from "@/server/outbox";

type ConversationEnv = Pick<Env,"DB"|"EVENTS_QUEUE">;

export async function markLeadInAttendance(env: Pick<Env,"DB">,leadId: string | null,actorId: string | null,reason: string) {
  if (!leadId) return false;
  const now = new Date().toISOString();
  const [updated] = await env.DB.batch([
    env.DB.prepare("UPDATE leads SET stage='EM_ATENDIMENTO',updated_at=? WHERE id=? AND stage='NOVO'").bind(now,leadId),
    env.DB.prepare("INSERT INTO pipeline_history (id,lead_id,from_stage,to_stage,actor_id,reason,created_at) SELECT ?,?,'NOVO','EM_ATENDIMENTO',?,?,? WHERE changes()=1")
      .bind(crypto.randomUUID(),leadId,actorId,reason,now),
  ]);
  return (updated.meta.changes ?? 0) === 1;
}

export async function queueConversationSummary(env: ConversationEnv,conversationId: string) {
  const counts = await env.DB.prepare(`SELECT count(m.id) AS total,c.summarized_message_count AS summarized
    FROM conversations c LEFT JOIN messages m ON m.conversation_id=c.id WHERE c.id=? GROUP BY c.id`)
    .bind(conversationId).first<{ total:number;summarized:number }>();
  if (!counts || !shouldSummarizeConversation(counts.total,counts.summarized)) return false;
  const targetCount = counts.total;
  const eventId = crypto.randomUUID();
  const dedupeKey = `conversation.summary:${conversationId}:${targetCount}`;
  await env.DB.prepare("INSERT OR IGNORE INTO outbox_events (id,type,aggregate_id,dedupe_key,payload_json,attempts,created_at) VALUES (?,'conversation.summarize',?,?,?,0,?)")
    .bind(eventId,conversationId,dedupeKey,JSON.stringify({ conversationId,targetCount }),new Date().toISOString()).run();
  const stored = await env.DB.prepare("SELECT id,published_at FROM outbox_events WHERE dedupe_key=?").bind(dedupeKey).first<{ id:string;published_at:string|null }>();
  return stored && !stored.published_at ? publishOutbox(env,{ id:stored.id,type:"conversation.summarize",conversationId,targetCount }) : false;
}

export async function pauseConversationForHandoff(env: Pick<Env,"DB">,input: {
  conversationId:string;leadId:string|null;reason:string;error?:string|null;processingToken?:string;
}) {
  const now = new Date().toISOString();
  const condition = input.processingToken ? "AND agent_processing_token=?" : "";
  const bindings = input.processingToken
    ? [now,input.error ?? null,now,input.conversationId,input.processingToken]
    : [now,input.error ?? null,now,input.conversationId];
  const updated = await env.DB.prepare(`UPDATE conversations SET mode='HUMAN',human_active=1,agent_paused_at=coalesce(agent_paused_at,?),agent_error=?,updated_at=? WHERE id=? ${condition}`)
    .bind(...bindings).run();
  if ((updated.meta.changes ?? 0) === 1 && input.leadId) {
    await env.DB.prepare("INSERT INTO activities (id,lead_id,type,title,body,created_at) VALUES (?,?,'HANDOFF','Atendimento humano necessário',?,?)")
      .bind(crypto.randomUUID(),input.leadId,input.reason,now).run();
  }
  return (updated.meta.changes ?? 0) === 1;
}
