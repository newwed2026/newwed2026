export type QueueEvent = { id:string;type:string;checkoutId?:string;leadId?:string;externalId?:string;providerPaymentId?:string;resend?:boolean };

type OutboxEnv = Pick<Env,"DB"|"EVENTS_QUEUE">;

function errorMessage(error: unknown) {
  return (error instanceof Error ? error.message : String(error)).slice(0,1000);
}

export function retryAt(attempt: number,now = new Date()) {
  const delaySeconds = Math.min(3600,30 * (2 ** Math.min(Math.max(attempt,0),7)));
  return new Date(now.getTime() + delaySeconds * 1000).toISOString();
}

export async function publishOutbox(env: OutboxEnv,event: QueueEvent) {
  try {
    await env.EVENTS_QUEUE.send(event);
    await env.DB.prepare("UPDATE outbox_events SET published_at=?,attempts=attempts+1,next_attempt_at=NULL,last_error=NULL WHERE id=?")
      .bind(new Date().toISOString(),event.id).run();
    return true;
  } catch (error) {
    const row = await env.DB.prepare("SELECT attempts FROM outbox_events WHERE id=?").bind(event.id).first<{ attempts:number }>();
    await env.DB.prepare("UPDATE outbox_events SET attempts=attempts+1,next_attempt_at=?,last_error=? WHERE id=?")
      .bind(retryAt(row?.attempts ?? 0),errorMessage(error),event.id).run();
    return false;
  }
}

export async function deferOutbox(env: Pick<Env,"DB">,eventId: string,error: unknown,attempt: number) {
  await env.DB.prepare("UPDATE outbox_events SET published_at=NULL,next_attempt_at=?,last_error=? WHERE id=?")
    .bind(retryAt(attempt),errorMessage(error),eventId).run();
}
