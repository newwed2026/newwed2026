import { describe,expect,it } from "vitest";
import { answerWithAgent } from "@/server/integrations/openai-agent";
import type { RuntimeSecrets } from "@/server/secrets";

function fakeDb() {
  return {
    prepare(sql: string) {
      return {
        bind() { return this; },
        async all() {
          if (sql.includes("FROM editions")) return { results:[{ name:"FAMTOUR RN",amount_cents:10000,installment_count:12 }] };
          return { results:[{ direction:"IN",body:"Qual é a data?",created_at:"2026-09-14T00:00:00Z" }] };
        },
        async first() {
          if (sql.includes("FROM leads")) return { name:"Maria",stage:"EM_ATENDIMENTO",edition_name:"FAMTOUR RN" };
          return { summary:"Cliente perguntou sobre o roteiro.",summarized_message_count:10 };
        },
      };
    },
  } as unknown as D1Database;
}

describe("agente OpenAI",() => {
  it("usa contexto D1, store false e saída estruturada",async () => {
    let requestBody:Record<string,unknown>|undefined;
    const fetcher = (async (_input: string | URL | Request,init?:RequestInit) => {
      requestBody = JSON.parse(String(init?.body)) as Record<string,unknown>;
      return Response.json({ output:[{ content:[{ type:"output_text",text:JSON.stringify({ reply:"A viagem começa em outubro.",confidence:0.9,handoff:false,reason:"Informação disponível no catálogo" }) }] }] });
    }) as typeof fetch;
    const env = { DB:fakeDb(),OPENAI_API_KEY:"test",OPENAI_MODEL:"gpt-test" } as unknown as Env & RuntimeSecrets;
    const result = await answerWithAgent(env,{ message:"Qual é a data?",leadId:"lead-1",conversationId:"conversation-1" },fetcher);
    expect(result).toMatchObject({ confidence:0.9,handoff:false });
    expect(requestBody?.store).toBe(false);
    expect(requestBody?.model).toBe("gpt-test");
    expect(String(requestBody?.input)).toContain("Cliente perguntou sobre o roteiro");
    expect(String(requestBody?.input)).toContain("Qual é a data?");
    expect(JSON.stringify(requestBody?.text)).toContain("reason");
  });

  it("transforma baixa confiança em handoff",async () => {
    const fetcher = (async () => Response.json({ output_text:JSON.stringify({ reply:"Vou confirmar com a equipe.",confidence:0.4,handoff:false,reason:"" }) })) as typeof fetch;
    const env = { DB:fakeDb(),OPENAI_API_KEY:"test",OPENAI_MODEL:"gpt-test" } as unknown as Env & RuntimeSecrets;
    const result = await answerWithAgent(env,{ message:"Há uma exceção?",conversationId:"conversation-1" },fetcher);
    expect(result).toMatchObject({ handoff:true,reason:"Baixa confiança" });
  });

  it("falha de configuração é explícita para o worker pausar o agente",async () => {
    const env = { DB:fakeDb(),OPENAI_MODEL:"gpt-test" } as unknown as Env & RuntimeSecrets;
    await expect(answerWithAgent(env,{ message:"Olá",conversationId:"conversation-1" })).rejects.toThrow("OpenAI não configurada");
  });
});
