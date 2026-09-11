import { env } from "cloudflare:workers";
import { errorResponse, json } from "@/server/http";

export async function GET() {
  try {
    const rows = await env.DB.prepare(`SELECT e.id,e.slug,e.name,e.destination,e.starts_at,e.ends_at,e.capacity,
      a.reserved,a.sold,p.id AS price_batch_id,p.name AS price_batch_name,p.amount_cents,p.installment_count
      FROM editions e
      JOIN availability a ON a.edition_id=e.id
      LEFT JOIN price_batches p ON p.edition_id=e.id AND p.active=1
      WHERE e.status='OPEN' ORDER BY e.starts_at`).all();
    return json({ editions: rows.results });
  } catch (error) {
    return errorResponse(error);
  }
}
