import { env } from "cloudflare:workers";
import { z } from "zod";
import { requireAccessUser } from "@/server/auth/access";
import { errorResponse, HttpError, json } from "@/server/http";

const schema = z.object({ title:z.string().trim().min(2).max(200),body:z.string().trim().max(1000).optional(),dueAt:z.string().datetime().optional() });

export async function POST(request: Request,{params}:{params:Promise<{id:string}>}) {
  try {
    const actor = await requireAccessUser(request);
    const { id } = await params;
    const input = schema.parse(await request.json());
    const lead = await env.DB.prepare("SELECT id FROM leads WHERE id=?").bind(id).first();
    if (!lead) throw new HttpError(404,"LEAD_NOT_FOUND","Lead não encontrado.");
    const activityId = crypto.randomUUID();
    await env.DB.prepare("INSERT INTO activities (id,lead_id,type,title,body,actor_id,due_at,created_at) VALUES (?,?,'TASK',?,?,?,?,?)")
      .bind(activityId,id,input.title,input.body ?? null,actor.id,input.dueAt ?? null,new Date().toISOString()).run();
    return json({id:activityId},{status:201});
  } catch (error) { return errorResponse(error); }
}
