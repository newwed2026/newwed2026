import { env } from "cloudflare:workers";
import { pipelineStageSchema } from "@/features/pipeline/model";
import { requireAccessUser } from "@/server/auth/access";
import { errorResponse, json } from "@/server/http";

export async function GET(request: Request) {
  try {
    await requireAccessUser(request);
    const url = new URL(request.url);
    const stageValue = url.searchParams.get("stage");
    const stage = stageValue ? pipelineStageSchema.parse(stageValue) : null;
    const search = url.searchParams.get("q")?.trim() ?? "";
    const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 50), 1), 100);
    const cursor = url.searchParams.get("cursor");
    const result = await env.DB.prepare(`SELECT l.id,l.name,l.email,l.phone,l.company,l.city_state,l.stage,l.created_at,l.updated_at,
      e.name AS edition_name,(SELECT user_id FROM assignments WHERE lead_id=l.id AND active=1 ORDER BY created_at DESC LIMIT 1) AS assignee_id
      FROM leads l LEFT JOIN editions e ON e.id=l.edition_id
      WHERE (? IS NULL OR l.stage=?) AND (?='' OR l.name LIKE ? OR l.email LIKE ? OR l.phone LIKE ?)
      AND (? IS NULL OR l.created_at < ?) ORDER BY l.created_at DESC LIMIT ?`)
      .bind(stage,stage,search,`%${search}%`,`%${search}%`,`%${search}%`,cursor,cursor,limit + 1).all();
    const items = result.results.slice(0, limit);
    return json({ items, nextCursor: result.results.length > limit ? String(items.at(-1)?.created_at) : null });
  } catch (error) {
    return errorResponse(error);
  }
}
