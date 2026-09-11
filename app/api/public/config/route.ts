import { env } from "cloudflare:workers";
import { json } from "@/server/http";

export async function GET() {
  return json({ turnstileSiteKey: String(env.TURNSTILE_SITE_KEY || "") });
}
