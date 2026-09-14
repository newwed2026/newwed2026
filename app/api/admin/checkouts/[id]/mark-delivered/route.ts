import { env } from "cloudflare:workers";
import { markCheckoutDelivered } from "@/server/checkout-processing";
import { requireAccessUser } from "@/server/auth/access";
import { errorResponse,HttpError,json } from "@/server/http";

export async function POST(request: Request,{ params }:{ params:Promise<{ id:string }> }) {
  try {
    const actor = await requireAccessUser(request);
    const { id } = await params;
    const before = await env.DB.prepare("SELECT status,send_status,lead_id FROM checkouts WHERE id=?")
      .bind(id).first<{ status:string;send_status:string;lead_id:string }>();
    if (!before) throw new HttpError(404,"CHECKOUT_NOT_FOUND","Checkout não encontrado.");
    if (before.send_status === "DELIVERED") return json({ checkoutId:id,changed:false,status:before.status,sendStatus:"DELIVERED" });
    if (!["SENT","PENDING","PAID"].includes(before.status) || before.send_status !== "ACCEPTED") {
      throw new HttpError(409,"CHECKOUT_NOT_DELIVERABLE","Somente um envio aceito pela Meta pode ser marcado como entregue.");
    }
    const result = await markCheckoutDelivered(env,id,actor.id,"Entrega marcada manualmente");
    if (!result.changed) throw new HttpError(409,"CHECKOUT_DELIVERY_CONFLICT","O checkout mudou. Atualize a tela e tente novamente.");
    const now = new Date().toISOString();
    await env.DB.prepare("INSERT INTO audit_log (id,actor_id,action,entity_type,entity_id,before_json,after_json,ip,created_at) VALUES (?,?,'checkout.mark_delivered','checkout',?,?,?,?,?)")
      .bind(crypto.randomUUID(),actor.id,id,JSON.stringify(before),JSON.stringify({ sendStatus:"DELIVERED" }),request.headers.get("cf-connecting-ip"),now).run();
    return json({ checkoutId:id,changed:true,status:before.status === "SENT" ? "PENDING" : before.status,sendStatus:"DELIVERED" });
  } catch (error) { return errorResponse(error); }
}
