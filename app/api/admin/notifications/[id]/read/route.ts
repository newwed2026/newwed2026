import { env } from "cloudflare:workers";
import { requireAccessUser } from "@/server/auth/access";
import { errorResponse,HttpError,json } from "@/server/http";

export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}) {
  try {
    const actor = await requireAccessUser(request);
    const { id } = await params;
    const now = new Date().toISOString();
    const result = await env.DB.prepare("UPDATE notification_recipients SET read_at=coalesce(read_at,?),updated_at=? WHERE notification_id=? AND user_id=? AND channel='IN_APP'")
      .bind(now,now,id,actor.id).run();
    if ((result.meta.changes ?? 0) !== 1) throw new HttpError(404,"NOTIFICATION_NOT_FOUND","Notificação não encontrada.");
    return json({id,readAt:now});
  } catch (error) { return errorResponse(error); }
}
