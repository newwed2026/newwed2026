export type CheckoutStatus = "PENDING" | "OVERDUE" | "CANCELLED" | "PAID" | "REFUNDED";

export function resolveCheckoutStatus(current: string, event: string): CheckoutStatus {
  if (["PAYMENT_REFUNDED","PAYMENT_REFUND_IN_PROGRESS"].includes(event)) return "REFUNDED";
  if (["PAYMENT_RECEIVED","PAYMENT_CONFIRMED"].includes(event)) return "PAID";
  if (current === "PAID" || current === "REFUNDED") return current as CheckoutStatus;
  if (event === "PAYMENT_OVERDUE") return "OVERDUE";
  if (["PAYMENT_DELETED","PAYMENT_CREDIT_CARD_CAPTURE_REFUSED"].includes(event)) return "CANCELLED";
  return (current as CheckoutStatus) || "PENDING";
}
