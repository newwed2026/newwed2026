import { checkoutStateSchema,type CheckoutState } from "@/features/billing/checkout-state";

export type PaymentStatus = "PENDING"|"OVERDUE"|"CANCELLED"|"PAID"|"REFUNDED";

export function resolveCheckoutStatus(currentValue: string,event: string): CheckoutState {
  const current = checkoutStateSchema.parse(currentValue);
  if (["PAYMENT_REFUNDED","PAYMENT_REFUND_IN_PROGRESS","PAYMENT_REFUND_REQUESTED"].includes(event)) return "REFUNDED";
  if (["PAYMENT_RECEIVED","PAYMENT_CONFIRMED","PAYMENT_RECEIVED_IN_CASH"].includes(event)) return "PAID";
  if (current === "PAID" || current === "REFUNDED") return current;
  if (["PAYMENT_DELETED","PAYMENT_CANCELLED","PAYMENT_CREDIT_CARD_CAPTURE_REFUSED"].includes(event)) return "CANCELLED";
  if (event === "PAYMENT_OVERDUE") return current === "SENT" || current === "PENDING" ? "OVERDUE" : current;
  if (event === "PAYMENT_PENDING") return current === "SENT" ? "PENDING" : current;
  return current;
}
