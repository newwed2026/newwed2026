import { env } from "cloudflare:workers";
import { requireAccessUser } from "@/server/auth/access";
import { errorResponse,json } from "@/server/http";

export async function GET(request:Request) {
  try {
    const actor = await requireAccessUser(request);
    const url = new URL(request.url);
    const unreadOnly = url.searchParams.get("unread") === "true";
    const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 30),1),100);
    const [items,count] = await Promise.all([
      env.DB.prepare(`SELECT n.id,n.type,n.entity_type,n.entity_id,n.title,n.body,n.payload_json,n.request_id,n.created_at,nr.read_at
        FROM notification_recipients nr JOIN notifications n ON n.id=nr.notification_id
        WHERE nr.user_id=? AND nr.channel='IN_APP' AND (?=0 OR nr.read_at IS NULL)
        ORDER BY n.created_at DESC LIMIT ?`).bind(actor.id,unreadOnly ? 1 : 0,limit).all(),
      env.DB.prepare("SELECT count(*) AS total FROM notification_recipients WHERE user_id=? AND channel='IN_APP' AND read_at IS NULL")
        .bind(actor.id).first<{total:number}>(),
    ]);
    return json({items:items.results,unreadCount:count?.total ?? 0});
  } catch (error) { return errorResponse(error); }
}
