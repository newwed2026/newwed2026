import { describe,expect,it } from "vitest";
import { enforceRateLimit } from "@/server/rate-limit";
import { readJsonWithLimit,requestIdFrom,responseWithRequestId } from "@/server/request-context";

function rateEnv(count:number) {
  const values:unknown[]=[];
  const DB={prepare:()=>({bind:(...bound:unknown[])=>{values.push(...bound);return{first:async()=>({count,expires_at:"2026-09-14T00:01:00.000Z"})};}})};
  return {env:{DB:DB as unknown as D1Database},values};
}

describe("proteções operacionais",()=>{
  it("preserva request id confiável e devolve no header",()=>{
    const request=new Request("https://example.test",{headers:{"x-request-id":"req-12345678"}});
    const id=requestIdFrom(request);
    expect(id).toBe("req-12345678");
    expect(responseWithRequestId(new Response(),id).headers.get("x-request-id")).toBe(id);
  });

  it("substitui request id inválido",()=>{
    expect(requestIdFrom(new Request("https://example.test",{headers:{"x-request-id":"curto"}}))).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("rejeita payload declarado acima do limite",async()=>{
    await expect(readJsonWithLimit(new Request("https://example.test",{method:"POST",headers:{"content-length":"200"},body:"{}"}),100))
      .rejects.toMatchObject({status:413,code:"PAYLOAD_TOO_LARGE"});
  });

  it("rejeita json inválido",async()=>{
    await expect(readJsonWithLimit(new Request("https://example.test",{method:"POST",body:"{"}),100))
      .rejects.toMatchObject({status:400,code:"INVALID_JSON"});
  });

  it("não persiste a identidade original no rate limit",async()=>{
    const test=rateEnv(1);
    const result=await enforceRateLimit(test.env,{scope:"public.lead",identity:"198.51.100.9",limit:5,windowSeconds:60},new Date("2026-09-14T00:00:00Z"));
    expect(result.remaining).toBe(4);
    expect(test.values.join("|")).not.toContain("198.51.100.9");
  });

  it("bloqueia a solicitação que ultrapassa o limite",async()=>{
    const test=rateEnv(6);
    await expect(enforceRateLimit(test.env,{scope:"checkout.create",identity:"user:lead",limit:5,windowSeconds:600},new Date("2026-09-14T00:00:00Z")))
      .rejects.toMatchObject({status:429,code:"RATE_LIMITED"});
  });
});
