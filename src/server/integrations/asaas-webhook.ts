import { z } from "zod";
import { applyAsaasPayment } from "@/server/integrations/asaas-payment";
import { retryAt } from "@/server/outbox";

export const asaasWebhookSchema = z.object({
  id:z.string().min(1).optional(),
  event:z.string().min(1),
  dateCreated:z.string().optional(),
  payment:z.object({
    id:z.string().min(1),
    externalReference:z.string().optional(),
    customer:z.string().optional(),
    installment:z.string().optional(),
    installmentNumber:z.number().int().positive().optional(),
    invoiceUrl:z.string().url().optional(),
    billingType:z.string().optional(),
    value:z.number().positive(),
    dueDate:z.string().optional(),
    status:z.string().min(1),
    paymentDate:z.string().optional(),
    confirmedDate:z.string().optional(),
  }).passthrough(),
}).passthrough();

export type AsaasWebhook = z.infer<typeof asaasWebhookSchema>;
export type StoredAsaasWebhook = { id:string;external_id:string;payload_json:string;attempts:number };

export async function processStoredAsaasWebhook(env: Pick<Env,"DB">,stored: StoredAsaasWebhook) {
  const now = new Date().toISOString();
  try {
    const input = asaasWebhookSchema.parse(JSON.parse(stored.payload_json));
    const result = await applyAsaasPayment(env,input.event,input.payment,input);
    const divergence = "divergence" in result ? result.divergence : undefined;
    if (!result.found || divergence) {
      const error = divergence ?? "CHECKOUT_NOT_FOUND";
      await env.DB.prepare("UPDATE webhook_events SET attempts=attempts+1,last_attempt_at=?,next_retry_at=?,error=? WHERE id=? AND processed_at IS NULL")
        .bind(now,retryAt(stored.attempts),error,stored.id).run();
      return { processed:false as const,error };
    }
    await env.DB.prepare("UPDATE webhook_events SET attempts=attempts+1,last_attempt_at=?,next_retry_at=NULL,error=NULL,processed_at=? WHERE id=? AND processed_at IS NULL")
      .bind(now,now,stored.id).run();
    return { processed:true as const };
  } catch (error) {
    const message = (error instanceof Error ? error.message : String(error)).slice(0,1000);
    await env.DB.prepare("UPDATE webhook_events SET attempts=attempts+1,last_attempt_at=?,next_retry_at=?,error=? WHERE id=? AND processed_at IS NULL")
      .bind(now,retryAt(stored.attempts),message,stored.id).run();
    return { processed:false as const,error:message };
  }
}
