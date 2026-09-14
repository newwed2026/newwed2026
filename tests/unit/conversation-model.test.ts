import { describe,expect,it } from "vitest";
import { agentResultSchema,requiresImmediateHandoff,shouldSummarizeConversation } from "@/features/conversations/model";

describe("políticas da conversa",() => {
  it.each(["Quero comprar","posso pagar no pix?","preciso de um humano","tenho uma reclamação"])("faz handoff imediato para: %s",(message) => {
    expect(requiresImmediateHandoff(message)).toBe(true);
  });
  it("mantém dúvidas informativas com o agente",() => expect(requiresImmediateHandoff("Qual é a data da viagem?")).toBe(false));
  it("resume a cada dez mensagens",() => {
    expect(shouldSummarizeConversation(9,0)).toBe(false);
    expect(shouldSummarizeConversation(10,0)).toBe(true);
    expect(shouldSummarizeConversation(19,10)).toBe(false);
    expect(shouldSummarizeConversation(20,10)).toBe(true);
  });
  it("resume um histórico antigo ainda sem resumo",() => {
    expect(shouldSummarizeConversation(41,0)).toBe(true);
    expect(shouldSummarizeConversation(41,40)).toBe(false);
  });
  it("exige a saída estruturada completa",() => {
    expect(agentResultSchema.safeParse({ reply:"Olá",confidence:0.9,handoff:false,reason:"" }).success).toBe(true);
    expect(agentResultSchema.safeParse({ reply:"Olá",confidence:0.9,handoff:false }).success).toBe(false);
  });
});
