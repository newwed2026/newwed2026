import { env } from "cloudflare:workers";
import { transitionSchema } from "@/features/leads/schemas";
import { assertTransition, pipelineStageSchema } from "@/features/pipeline/model";
import { requireAccessUser } from "@/server/auth/access";
import { errorResponse, HttpError, json } from "@/server/http";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireAccessUser(request);
    const { id } = await params;
    const input = transitionSchema.parse(await request.json());
    const lead = await env.DB.prepare("SELECT stage FROM leads WHERE id=?").bind(id).first<{ stage: string }>();
    if (!lead) throw new HttpError(404, "LEAD_NOT_FOUND", "Lead não encontrado.");
    const from = pipelineStageSchema.parse(lead.stage);
    assertTransition(from, input.stage);
    const now = new Date().toISOString();
    if (from !== input.stage) {
      await env.DB.batch([
        env.DB.prepare("UPDATE leads SET stage=?,updated_at=? WHERE id=? AND stage=?").bind(input.stage,now,id,from),
        env.DB.prepare("INSERT INTO pipeline_history (id,lead_id,from_stage,to_stage,actor_id,reason,created_at) VALUES (?,?,?,?,?,?,?)")
          .bind(crypto.randomUUID(),id,from,input.stage,actor.id,input.reason,now),
        env.DB.prepare("INSERT INTO audit_log (id,actor_id,action,entity_type,entity_id,before_json,after_json,ip,created_at) VALUES (?,?,'pipeline.transition','lead',?,?,?,?,?)")
          .bind(crypto.randomUUID(),actor.id,id,JSON.stringify({ stage: from }),JSON.stringify({ stage: input.stage, reason: input.reason }),request.headers.get("cf-connecting-ip"),now),
      ]);
    }
    return json({ leadId: id, from, stage: input.stage, changed: from !== input.stage });
  } catch (error) { return errorResponse(error); }
}
