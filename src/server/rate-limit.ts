import { HttpError } from "@/server/http";
import { sha256 } from "@/server/normalization";

export type RateLimitRule = { scope:string;identity:string;limit:number;windowSeconds:number };

export async function enforceRateLimit(env: Pick<Env,"DB">,rule: RateLimitRule,now = new Date()) {
  const identityHash = await sha256(rule.identity || "unknown");
  const key = `${rule.scope}:${identityHash}`;
  const nowIso = now.toISOString();
  const resetBefore = new Date(now.getTime() - rule.windowSeconds * 1000).toISOString();
  const expiresAt = new Date(now.getTime() + rule.windowSeconds * 1000).toISOString();
  const row = await env.DB.prepare(`INSERT INTO rate_limit_buckets (key,scope,window_started_at,count,expires_at,updated_at)
    VALUES (?,?,?,1,?,?) ON CONFLICT(key) DO UPDATE SET
      window_started_at=CASE WHEN rate_limit_buckets.window_started_at<=? THEN excluded.window_started_at ELSE rate_limit_buckets.window_started_at END,
      count=CASE WHEN rate_limit_buckets.window_started_at<=? THEN 1 ELSE rate_limit_buckets.count+1 END,
      expires_at=CASE WHEN rate_limit_buckets.window_started_at<=? THEN excluded.expires_at ELSE rate_limit_buckets.expires_at END,
      updated_at=excluded.updated_at RETURNING count,expires_at`)
    .bind(key,rule.scope,nowIso,expiresAt,nowIso,resetBefore,resetBefore,resetBefore)
    .first<{ count:number;expires_at:string }>();
  if (!row || row.count > rule.limit) {
    const retryAfter = row ? Math.max(1,Math.ceil((Date.parse(row.expires_at) - now.getTime()) / 1000)) : rule.windowSeconds;
    throw new HttpError(429,"RATE_LIMITED",`Limite de solicitações atingido. Tente novamente em ${retryAfter} segundos.`);
  }
  return { remaining:Math.max(0,rule.limit-row.count),expiresAt:row.expires_at };
}

export function clientIp(request: Request) {
  return request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}
