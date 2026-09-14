import { describe,expect,it } from "vitest";
import { assertCheckoutTransition,canTransitionCheckout } from "@/features/billing/checkout-state";

describe("máquina de estado do checkout",() => {
  it("permite o fluxo principal completo",() => {
    const path = ["CREATING","READY","SEND_PENDING","SENT","PENDING","PAID"] as const;
    for (let index = 0; index < path.length - 1; index += 1) {
      expect(canTransitionCheckout(path[index],path[index + 1])).toBe(true);
    }
  });

  it("aceita pagamento recebido antes da confirmação de entrega",() => {
    expect(canTransitionCheckout("SENT","PAID")).toBe(true);
  });

  it("aceita eventos financeiros fora de ordem e impede regressões",() => {
    expect(() => assertCheckoutTransition("CREATING","PAID")).not.toThrow();
    expect(() => assertCheckoutTransition("PENDING","READY")).toThrow("Transição de checkout inválida");
  });

  it("mantém estados terminais fechados e repetição idempotente",() => {
    expect(canTransitionCheckout("CANCELLED","READY")).toBe(false);
    expect(canTransitionCheckout("REFUNDED","PAID")).toBe(false);
    expect(canTransitionCheckout("PAID","PAID")).toBe(true);
  });

  it("permite recuperação controlada de falhas e atraso",() => {
    expect(canTransitionCheckout("FAILED","CREATING")).toBe(true);
    expect(canTransitionCheckout("FAILED","SEND_PENDING")).toBe(true);
    expect(canTransitionCheckout("OVERDUE","PAID")).toBe(true);
  });
});
