import { env } from "cloudflare:workers";
import { requireAccessUser } from "@/server/auth/access";
import { markLeadInAttendance } from "@/server/conversation-state";
import { errorResponse,HttpError,json } from "@/server/http";

export async function POST(request: Request,{ params }:{ params:Promise<{ id:string }> }) {
  try {
    const actor = await requireAccessUser(request);
    const { id } = await params;
    const before = await env.DB.prepare("SELECT lead_id,mode,claimed_by,agent_processing_token,opted_out_at FROM conversations WHERE id=?")
      .bind(id).first<{ lead_id:string|null;mode:string;claimed_by:string|null;agent_processing_token:string|null;opted_out_at:string|null }>();
    if (!before) throw new HttpError(404,"CONVERSATION_NOT_FOUND","Conversa não encontrada.");
    if (before.mode === "HUMAN" && before.claimed_by === actor.id) {
      return json({ conversationId:id,mode:"HUMAN",claimedBy:actor.id,changed:false,agentReplyInProgress:Boolean(before.agent_processing_token) });
    }
    if (before.claimed_by && before.claimed_by !== actor.id) throw new HttpError(409,"CONVERSATION_ALREADY_CLAIMED","A conversa já está com outra pessoa.");
    const now = new Date().toISOString();
    const [updated] = await env.DB.batch([
      env.DB.prepare("UPDATE conversations SET mode='HUMAN',human_active=1,claimed_by=?,claimed_at=?,released_at=NULL,agent_paused_at=coalesce(agent_paused_at,?),updated_at=? WHERE id=? AND (claimed_by IS NULL OR claimed_by=?)")
        .bind(actor.id,now,now,now,id,actor.id),
      env.DB.prepare("INSERT INTO audit_log (id,actor_id,action,entity_type,entity_id,before_json,after_json,ip,created_at) SELECT ?,?,'conversation.claim','conversation',?,?,?,?,? WHERE changes()=1")
        .bind(crypto.randomUUID(),actor.id,id,JSON.stringify(before),JSON.stringify({ mode:"HUMAN",claimedBy:actor.id }),request.headers.get("cf-connecting-ip"),now),
    ]);
    if ((updated.meta.changes ?? 0) !== 1) throw new HttpError(409,"CONVERSATION_CLAIM_CONFLICT","A conversa mudou. Atualize a inbox e tente novamente.");
    await markLeadInAttendance(env,before.lead_id,actor.id,"Primeiro atendimento humano");
    return json({ conversationId:id,mode:"HUMAN",claimedBy:actor.id,changed:true,agentReplyInProgress:Boolean(before.agent_processing_token) });
  } catch (error) { return errorResponse(error); }
}
