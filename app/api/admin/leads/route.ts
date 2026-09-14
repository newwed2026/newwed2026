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
    const editionId = url.searchParams.get("editionId");
    const assigneeId = url.searchParams.get("assigneeId");
    const origin = url.searchParams.get("origin")?.trim() ?? "";
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");
    const overdue = url.searchParams.get("overdue") === "true";
    const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 50), 1), 100);
    const cursor = url.searchParams.get("cursor");
    const result = await env.DB.prepare(`SELECT l.id,l.name,l.email,l.phone,l.company,l.city_state,l.stage,l.edition_id,l.created_at,l.updated_at,
      e.name AS edition_name,
      (SELECT a.user_id FROM assignments a WHERE a.lead_id=l.id AND a.active=1 ORDER BY a.created_at DESC LIMIT 1) AS assignee_id,
      (SELECT u.name FROM assignments a JOIN users u ON u.id=a.user_id WHERE a.lead_id=l.id AND a.active=1 ORDER BY a.created_at DESC LIMIT 1) AS assignee_name,
      (SELECT la.utm_source FROM lead_attribution la WHERE la.lead_id=l.id AND la.touch_type='LAST') AS origin,
      (SELECT ac.due_at FROM activities ac WHERE ac.lead_id=l.id AND ac.type='TASK' AND ac.completed_at IS NULL ORDER BY ac.due_at IS NULL,ac.due_at LIMIT 1) AS next_task_due
      FROM leads l LEFT JOIN editions e ON e.id=l.edition_id
      WHERE (? IS NULL OR l.stage=?) AND (?='' OR l.name LIKE ? OR l.email LIKE ? OR l.phone LIKE ?)
      AND (? IS NULL OR l.edition_id=?)
      AND (? IS NULL OR EXISTS (SELECT 1 FROM assignments a WHERE a.lead_id=l.id AND a.active=1 AND a.user_id=?))
      AND (?='' OR EXISTS (SELECT 1 FROM lead_attribution la WHERE la.lead_id=l.id AND la.touch_type='LAST' AND coalesce(la.utm_source,'Direto')=?))
      AND (? IS NULL OR l.created_at>=?) AND (? IS NULL OR l.created_at<?)
      AND (?=0 OR EXISTS (SELECT 1 FROM activities ac WHERE ac.lead_id=l.id AND ac.type='TASK' AND ac.completed_at IS NULL AND ac.due_at<?))
      AND (? IS NULL OR l.created_at < ?) ORDER BY l.created_at DESC LIMIT ?`)
      .bind(stage,stage,search,`%${search}%`,`%${search}%`,`%${search}%`,editionId,editionId,assigneeId,assigneeId,origin,origin,from,from,to,to,overdue ? 1 : 0,new Date().toISOString(),cursor,cursor,limit + 1).all();
    const items = result.results.slice(0, limit);
    return json({ items, nextCursor: result.results.length > limit ? String(items.at(-1)?.created_at) : null });
  } catch (error) {
    return errorResponse(error);
  }
}
