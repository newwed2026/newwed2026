import { describe, expect, it } from "vitest";
import { asaasStatusEvent } from "@/server/integrations/asaas-payment";

describe("asaasStatusEvent", () => {
  it.each([
    ["RECEIVED", "PAYMENT_RECEIVED"],
    ["CONFIRMED", "PAYMENT_RECEIVED"],
    ["OVERDUE", "PAYMENT_OVERDUE"],
    ["REFUNDED", "PAYMENT_REFUNDED"],
    ["REFUND_IN_PROGRESS", "PAYMENT_REFUNDED"],
    ["DELETED", "PAYMENT_DELETED"],
    ["CREDIT_CARD_CAPTURE_REFUSED", "PAYMENT_DELETED"],
    ["PENDING", "PAYMENT_PENDING"],
  ])("maps %s to %s", (status, event) => {
    expect(asaasStatusEvent(status)).toBe(event);
  });
});
