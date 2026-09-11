import { env } from "cloudflare:workers";
import { assignmentSchema } from "@/features/leads/schemas";
import { requireAccessUser } from "@/server/auth/access";
import { errorResponse, HttpError, json } from "@/server/http";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireAccessUser(request);
    const { id } = await params;
    const { userId } = assignmentSchema.parse(await request.json());
    const target = await env.DB.prepare("SELECT id FROM users WHERE id=? AND active=1").bind(userId).first();
    if (!target) throw new HttpError(422, "ASSIGNEE_NOT_FOUND", "Responsável não encontrado.");
    const now = new Date().toISOString();
    await env.DB.batch([
      env.DB.prepare("UPDATE assignments SET active=0 WHERE lead_id=? AND active=1").bind(id),
      env.DB.prepare("INSERT INTO assignments (id,lead_id,user_id,assigned_by,active,created_at) VALUES (?,?,?,?,1,?)")
        .bind(crypto.randomUUID(),id,userId,actor.id,now),
      env.DB.prepare("INSERT INTO audit_log (id,actor_id,action,entity_type,entity_id,after_json,ip,created_at) VALUES (?,?,'lead.assign','lead',?,?,?,?)")
        .bind(crypto.randomUUID(),actor.id,id,JSON.stringify({ userId }),request.headers.get("cf-connecting-ip"),now),
    ]);
    return json({ leadId: id, userId });
  } catch (error) { return errorResponse(error); }
}
