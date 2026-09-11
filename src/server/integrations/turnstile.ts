import { env } from "cloudflare:workers";
import { HttpError } from "@/server/http";
import { getSecrets } from "@/server/secrets";

export async function verifyTurnstile(token: string | undefined, ip: string | null) {
  const secret = getSecrets().TURNSTILE_SECRET_KEY;
  if (!secret) {
    if (env.ENVIRONMENT === "production") throw new HttpError(503, "TURNSTILE_NOT_CONFIGURED", "Verificação temporariamente indisponível.");
    return;
  }
  if (!token) throw new HttpError(400, "TURNSTILE_REQUIRED", "Confirme a verificação de segurança.");

  const form = new FormData();
  form.set("secret", secret);
  form.set("response", token);
  if (ip) form.set("remoteip", ip);
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: form });
  const result = await response.json() as { success?: boolean };
  if (!result.success) throw new HttpError(400, "TURNSTILE_FAILED", "Não foi possível confirmar a verificação de segurança.");
}
