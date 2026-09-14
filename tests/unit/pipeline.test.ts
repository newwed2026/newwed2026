import { describe,expect,it } from "vitest";
import { assertManualTransition,assertTransition,canManuallyTransition,canTransition } from "@/features/pipeline/model";

describe("pipeline",() => {
  it("permite o fluxo comercial principal",() => {
    expect(canTransition("NOVO","EM_ATENDIMENTO")).toBe(true);
    expect(canTransition("EM_ATENDIMENTO","QUALIFICADO")).toBe(true);
    expect(canTransition("QUALIFICADO","CHECKOUT_ENVIADO")).toBe(true);
    expect(canTransition("CHECKOUT_ENVIADO","AGUARDANDO_PAGAMENTO")).toBe(true);
    expect(canTransition("AGUARDANDO_PAGAMENTO","PAGO")).toBe(true);
  });
  it("impede pagamento direto a partir de NOVO",() => {
    expect(() => assertTransition("NOVO","PAGO")).toThrow("Transição inválida");
  });
  it("aceita repetição idempotente do estágio",() => expect(canTransition("PAGO","PAGO")).toBe(true));
  it("reserva etapas financeiras para integrações do sistema",() => {
    expect(canManuallyTransition("QUALIFICADO","CHECKOUT_ENVIADO")).toBe(false);
    expect(canManuallyTransition("CHECKOUT_ENVIADO","AGUARDANDO_PAGAMENTO")).toBe(false);
    expect(canManuallyTransition("AGUARDANDO_PAGAMENTO","PAGO")).toBe(false);
    expect(() => assertManualTransition("AGUARDANDO_PAGAMENTO","PAGO")).toThrow("Transição manual inválida");
  });
  it("mantém qualificação e exceções comerciais sob controle humano",() => {
    expect(canManuallyTransition("EM_ATENDIMENTO","QUALIFICADO")).toBe(true);
    expect(canManuallyTransition("QUALIFICADO","NUTRICAO")).toBe(true);
    expect(canManuallyTransition("NUTRICAO","PERDIDO")).toBe(true);
  });
});
