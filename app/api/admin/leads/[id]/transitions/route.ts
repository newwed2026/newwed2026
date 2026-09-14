import { env } from "cloudflare:workers";
import { transitionSchema } from "@/features/leads/schemas";
import { canManuallyTransition, pipelineStageSchema } from "@/features/pipeline/model";
import { requireAccessUser } from "@/server/auth/access";
import { cancelCheckoutReservationsForLead } from "@/server/checkout-processing";
import { errorResponse, HttpError, json } from "@/server/http";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireAccessUser(request);
    const { id } = await params;
    const input = transitionSchema.parse(await request.json());
    const lead = await env.DB.prepare("SELECT stage FROM leads WHERE id=?").bind(id).first<{ stage: string }>();
    if (!lead) throw new HttpError(404, "LEAD_NOT_FOUND", "Lead não encontrado.");
    const from = pipelineStageSchema.parse(lead.stage);
    if (!canManuallyTransition(from,input.stage)) {
      throw new HttpError(409,"INVALID_PIPELINE_TRANSITION",`A etapa ${input.stage} não pode ser aplicada manualmente a partir de ${from}.`);
    }
    const now = new Date().toISOString();
    if (from !== input.stage) {
      const statements = [
        env.DB.prepare("UPDATE leads SET stage=?,updated_at=? WHERE id=? AND stage=?").bind(input.stage,now,id,from),
        env.DB.prepare("INSERT INTO pipeline_history (id,lead_id,from_stage,to_stage,actor_id,reason,created_at) SELECT ?,?,?,?,?,?,? WHERE changes()=1")
          .bind(crypto.randomUUID(),id,from,input.stage,actor.id,input.reason ?? null,now),
        env.DB.prepare("INSERT INTO audit_log (id,actor_id,action,entity_type,entity_id,before_json,after_json,ip,created_at) SELECT ?,?,'pipeline.transition','lead',?,?,?,?,? WHERE changes()=1")
          .bind(crypto.randomUUID(),actor.id,id,JSON.stringify({ stage: from }),JSON.stringify(input),request.headers.get("cf-connecting-ip"),now),
      ];
      if (input.stage === "NUTRICAO") {
        statements.push(env.DB.prepare("INSERT INTO activities (id,lead_id,type,title,body,actor_id,due_at,created_at) SELECT ?,?,'TASK',?,?,?, ?,? WHERE changes()=1")
          .bind(crypto.randomUUID(),id,input.nextAction,input.reason ?? null,actor.id,input.nextActionAt,now));
      }
      const [updated] = await env.DB.batch(statements);
      if ((updated.meta.changes ?? 0) !== 1) {
        throw new HttpError(409,"PIPELINE_CONFLICT","O lead foi alterado por outra operação. Atualize a tela e tente novamente.");
      }
      if (input.stage === "CANCELADO") await cancelCheckoutReservationsForLead(env,id);
    }
    return json({ leadId: id, from, stage: input.stage, changed: from !== input.stage });
  } catch (error) { return errorResponse(error); }
}
