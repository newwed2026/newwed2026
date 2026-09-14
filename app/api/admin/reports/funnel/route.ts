import { env } from "cloudflare:workers";
import { requireAccessUser } from "@/server/auth/access";
import { errorResponse,json } from "@/server/http";

function filters(url:URL) {
  return {
    from:url.searchParams.get("from"),to:url.searchParams.get("to"),editionId:url.searchParams.get("editionId"),
    origin:url.searchParams.get("origin"),assigneeId:url.searchParams.get("assigneeId"),
  };
}

export async function GET(request:Request) {
  try {
    await requireAccessUser(request);
    const f = filters(new URL(request.url));
    const where = `(? IS NULL OR l.created_at>=?) AND (? IS NULL OR l.created_at<=?) AND (? IS NULL OR l.edition_id=?)
      AND (? IS NULL OR EXISTS (SELECT 1 FROM lead_attribution la WHERE la.lead_id=l.id AND la.touch_type='LAST' AND coalesce(la.utm_source,'Direto')=?))
      AND (? IS NULL OR EXISTS (SELECT 1 FROM assignments a WHERE a.lead_id=l.id AND a.active=1 AND a.user_id=?))`;
    const bindings = [f.from,f.from,f.to,f.to ? `${f.to}T23:59:59.999Z` : null,f.editionId,f.editionId,f.origin,f.origin,f.assigneeId,f.assigneeId];
    const [stages,origins,editions,assignees,checkouts,payments] = await Promise.all([
      env.DB.prepare(`SELECT l.stage AS label,count(*) AS total FROM leads l WHERE ${where} GROUP BY l.stage ORDER BY total DESC`).bind(...bindings).all(),
      env.DB.prepare(`SELECT coalesce((SELECT la.utm_source FROM lead_attribution la WHERE la.lead_id=l.id AND la.touch_type='LAST'),'Direto') AS label,count(*) AS total FROM leads l WHERE ${where} GROUP BY label ORDER BY total DESC`).bind(...bindings).all(),
      env.DB.prepare(`SELECT coalesce(e.name,'Sem edição') AS label,count(*) AS total FROM leads l LEFT JOIN editions e ON e.id=l.edition_id WHERE ${where} GROUP BY label ORDER BY total DESC`).bind(...bindings).all(),
      env.DB.prepare(`SELECT coalesce((SELECT u.name FROM assignments a JOIN users u ON u.id=a.user_id WHERE a.lead_id=l.id AND a.active=1 ORDER BY a.created_at DESC LIMIT 1),'Sem responsável') AS label,count(*) AS total FROM leads l WHERE ${where} GROUP BY label ORDER BY total DESC`).bind(...bindings).all(),
      env.DB.prepare(`SELECT c.status AS label,count(*) AS total FROM checkouts c JOIN leads l ON l.id=c.lead_id WHERE ${where} GROUP BY c.status ORDER BY total DESC`).bind(...bindings).all(),
      env.DB.prepare(`SELECT p.status AS label,count(*) AS total,coalesce(sum(p.amount_cents),0) AS amount_cents FROM payments p JOIN checkouts c ON c.id=p.checkout_id JOIN leads l ON l.id=c.lead_id WHERE ${where} GROUP BY p.status ORDER BY total DESC`).bind(...bindings).all(),
    ]);
    return json({stages:stages.results,origins:origins.results,editions:editions.results,assignees:assignees.results,checkouts:checkouts.results,payments:payments.results});
  } catch (error) { return errorResponse(error); }
}
