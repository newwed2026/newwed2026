import { env } from "cloudflare:workers";
import { requireAccessUser } from "@/server/auth/access";
import { errorResponse,json } from "@/server/http";

export async function GET(request:Request) {
  try {
    await requireAccessUser(request,["admin","gestor"]);
    const [outbox,webhooks,checkouts,messages,conversations,email] = await Promise.all([
      env.DB.prepare("SELECT id,type,aggregate_id AS entity_id,last_error AS error,attempts,request_id,created_at FROM outbox_events WHERE last_error IS NOT NULL ORDER BY created_at DESC LIMIT 30").all(),
      env.DB.prepare("SELECT id,'webhook.'||provider AS type,external_id AS entity_id,error,attempts,request_id,created_at FROM webhook_events WHERE error IS NOT NULL ORDER BY created_at DESC LIMIT 30").all(),
      env.DB.prepare("SELECT id,'checkout' AS type,id AS entity_id,last_error AS error,retry_count AS attempts,request_id,created_at FROM checkouts WHERE last_error IS NOT NULL ORDER BY created_at DESC LIMIT 30").all(),
      env.DB.prepare("SELECT id,'message' AS type,id AS entity_id,last_error AS error,0 AS attempts,request_id,created_at FROM messages WHERE last_error IS NOT NULL ORDER BY created_at DESC LIMIT 30").all(),
      env.DB.prepare("SELECT id,'agent' AS type,id AS entity_id,agent_error AS error,0 AS attempts,request_id,created_at FROM conversations WHERE agent_error IS NOT NULL ORDER BY created_at DESC LIMIT 30").all(),
      env.DB.prepare(`SELECT nr.id,'email' AS type,nr.notification_id AS entity_id,nr.last_error AS error,nr.attempts,n.request_id,nr.created_at
        FROM notification_recipients nr JOIN notifications n ON n.id=nr.notification_id WHERE nr.channel='EMAIL' AND nr.last_error IS NOT NULL ORDER BY nr.created_at DESC LIMIT 30`).all(),
    ]);
    const items = [...outbox.results,...webhooks.results,...checkouts.results,...messages.results,...conversations.results,...email.results]
      .sort((a,b) => String(b.created_at).localeCompare(String(a.created_at))).slice(0,100);
    return json({items,counts:{queue:outbox.results.length,webhooks:webhooks.results.length,checkouts:checkouts.results.length,meta:messages.results.length,openai:conversations.results.length,email:email.results.length}});
  } catch (error) { return errorResponse(error); }
}
