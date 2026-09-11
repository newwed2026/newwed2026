import { env } from "cloudflare:workers";
import { requireAccessUser } from "@/server/auth/access";
import { errorResponse, json } from "@/server/http";

export async function GET(request: Request) {
  try {
    await requireAccessUser(request);
    const result = await env.DB.prepare("SELECT u.id,u.name,u.email,group_concat(r.role) AS roles FROM users u LEFT JOIN roles r ON r.user_id=u.id WHERE u.active=1 GROUP BY u.id ORDER BY u.name").all();
    return json({ users: result.results });
  } catch (error) { return errorResponse(error); }
}
