import { env } from "cloudflare:workers";
import { z } from "zod";
import { requireAccessUser } from "@/server/auth/access";
import { errorResponse,HttpError,json } from "@/server/http";
import { requestIdFrom,responseWithRequestId } from "@/server/request-context";

const schema = z.object({
  completed:z.boolean().optional(),dueAt:z.string().datetime().nullable().optional(),assignedTo:z.string().uuid().optional(),
  priority:z.enum(["LOW","NORMAL","HIGH","URGENT"]).optional(),
}).refine((value) => Object.keys(value).length > 0,"Informe ao menos uma alteração.");

export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}) {
  try {
    const requestId = requestIdFrom(request);
    const actor = await requireAccessUser(request);
    const { id } = await params;
    const input = schema.parse(await request.json());
    const before = await env.DB.prepare("SELECT * FROM activities WHERE id=? AND type='TASK'").bind(id).first<Record<string,unknown>>();
    if (!before) throw new HttpError(404,"ACTIVITY_NOT_FOUND","Tarefa não encontrada.");
    if (input.assignedTo) {
      const user = await env.DB.prepare("SELECT id FROM users WHERE id=? AND active=1").bind(input.assignedTo).first();
      if (!user) throw new HttpError(422,"INVALID_ASSIGNEE","O responsável informado não está ativo.");
    }
    const now = new Date().toISOString();
    await env.DB.batch([
      env.DB.prepare(`UPDATE activities SET assigned_to=coalesce(?,assigned_to),priority=coalesce(?,priority),due_at=CASE WHEN ? THEN ? ELSE due_at END,
        completed_at=CASE WHEN ?=1 THEN coalesce(completed_at,?) WHEN ?=0 THEN NULL ELSE completed_at END,
        completed_by=CASE WHEN ?=1 THEN coalesce(completed_by,?) WHEN ?=0 THEN NULL ELSE completed_by END,updated_at=? WHERE id=?`)
        .bind(input.assignedTo ?? null,input.priority ?? null,input.dueAt !== undefined,input.dueAt ?? null,input.completed === true ? 1 : input.completed === false ? 0 : null,now,input.completed === false ? 0 : null,input.completed === true ? 1 : input.completed === false ? 0 : null,actor.id,input.completed === false ? 0 : null,now,id),
      env.DB.prepare("INSERT INTO audit_log (id,actor_id,action,entity_type,entity_id,before_json,after_json,ip,request_id,created_at) VALUES (?,?,'activity.update','activity',?,?,?,?,?,?)")
        .bind(crypto.randomUUID(),actor.id,id,JSON.stringify(before),JSON.stringify(input),request.headers.get("cf-connecting-ip"),requestId,now),
    ]);
    return responseWithRequestId(json({id,updatedAt:now}),requestId);
  } catch (error) { return errorResponse(error); }
}
