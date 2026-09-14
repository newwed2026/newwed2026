import { describe,expect,it } from "vitest";
import { checkoutExpiresAt,currentDateInRecife,dueDateFromCheckoutExpiry,installmentsAreAllowed,resolveCheckoutDueDate } from "@/features/billing/checkout-request";
import { retryAt } from "@/server/outbox";

describe("políticas do checkout",() => {
  it("limita Pix a uma cobrança e cartão ao teto da edição",() => {
    expect(installmentsAreAllowed("PIX",1,12)).toBe(true);
    expect(installmentsAreAllowed("PIX",2,12)).toBe(false);
    expect(installmentsAreAllowed("CREDIT_CARD",12,12)).toBe(true);
    expect(installmentsAreAllowed("CREDIT_CARD",13,12)).toBe(false);
  });
  it("preserva o vencimento no fuso de Recife",() => {
    const expiresAt = checkoutExpiresAt("2026-10-01");
    expect(expiresAt).toBe("2026-10-02T02:59:59.999Z");
    expect(dueDateFromCheckoutExpiry(expiresAt)).toBe("2026-10-01");
  });
  it("usa três dias como vencimento padrão",() => {
    expect(resolveCheckoutDueDate(undefined,new Date("2026-09-14T12:00:00Z"))).toBe("2026-09-17");
    expect(currentDateInRecife(new Date("2026-09-15T01:30:00Z"))).toBe("2026-09-14");
    expect(resolveCheckoutDueDate(undefined,new Date("2026-09-15T01:30:00Z"))).toBe("2026-09-17");
  });
  it("aplica backoff exponencial limitado a uma hora",() => {
    const now = new Date("2026-09-14T12:00:00Z");
    expect(retryAt(0,now)).toBe("2026-09-14T12:00:30.000Z");
    expect(retryAt(99,now)).toBe("2026-09-14T13:00:00.000Z");
  });
});
