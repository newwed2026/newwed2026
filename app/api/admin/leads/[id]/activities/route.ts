import { env } from "cloudflare:workers";
import { z } from "zod";
import { requireAccessUser } from "@/server/auth/access";
import { errorResponse, HttpError, json } from "@/server/http";
import { requestIdFrom,responseWithRequestId } from "@/server/request-context";

const schema = z.object({
  title:z.string().trim().min(2).max(200),body:z.string().trim().max(1000).optional(),
  dueAt:z.string().datetime().optional(),assignedTo:z.string().uuid().optional(),priority:z.enum(["LOW","NORMAL","HIGH","URGENT"]).default("NORMAL"),
});

export async function POST(request: Request,{params}:{params:Promise<{id:string}>}) {
  try {
    const requestId = requestIdFrom(request);
    const actor = await requireAccessUser(request);
    const { id } = await params;
    const input = schema.parse(await request.json());
    const lead = await env.DB.prepare("SELECT id FROM leads WHERE id=?").bind(id).first();
    if (!lead) throw new HttpError(404,"LEAD_NOT_FOUND","Lead não encontrado.");
    if (input.assignedTo) {
      const assignee = await env.DB.prepare("SELECT id FROM users WHERE id=? AND active=1").bind(input.assignedTo).first();
      if (!assignee) throw new HttpError(422,"INVALID_ASSIGNEE","O responsável informado não está ativo.");
    }
    const activityId = crypto.randomUUID();
    const now = new Date().toISOString();
    await env.DB.batch([
      env.DB.prepare("INSERT INTO activities (id,lead_id,type,title,body,actor_id,assigned_to,priority,due_at,created_at,updated_at) VALUES (?,?,'TASK',?,?,?,?,?,?,?,?)")
        .bind(activityId,id,input.title,input.body ?? null,actor.id,input.assignedTo ?? actor.id,input.priority,input.dueAt ?? null,now,now),
      env.DB.prepare("INSERT INTO audit_log (id,actor_id,action,entity_type,entity_id,after_json,ip,request_id,created_at) VALUES (?,?,'activity.create','activity',?,?,?,?,?)")
        .bind(crypto.randomUUID(),actor.id,activityId,JSON.stringify(input),request.headers.get("cf-connecting-ip"),requestId,now),
    ]);
    return responseWithRequestId(json({id:activityId},{status:201}),requestId);
  } catch (error) { return errorResponse(error); }
}
