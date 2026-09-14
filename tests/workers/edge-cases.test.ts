import { env } from "cloudflare:workers";
import { describe,expect,it,vi } from "vitest";
import { POST as createCheckout } from "../../app/api/admin/leads/[id]/checkouts/route";
import { POST as claimConversation } from "../../app/api/admin/conversations/[id]/claim/route";
import { POST as sendManualMessage } from "../../app/api/admin/conversations/[id]/messages/route";
import { POST as receiveMetaWebhook } from "../../app/api/webhooks/meta/route";
import { processIncomingWhatsApp } from "@/server/conversation-processing";
import { hmacSha256Hex } from "@/server/crypto";
import type { RuntimeSecrets } from "@/server/secrets";

type TestEnv=Env&RuntimeSecrets;
const workerEnv=env as unknown as TestEnv;
const now="2026-09-14T00:00:00Z";

async function seed(capacity=1) {
  await env.DB.batch([
    env.DB.prepare("INSERT INTO users (id,email,name,active,created_at,updated_at) VALUES ('admin','admin@test.local','Admin',1,?,?),('seller','seller@test.local','Vendedor',1,?,?)").bind(now,now,now,now),
    env.DB.prepare("INSERT INTO roles (id,user_id,role,created_at) VALUES ('ra','admin','admin',?),('rs','seller','vendedor',?)").bind(now,now),
    env.DB.prepare("INSERT INTO editions (id,slug,name,destination,starts_at,ends_at,status,capacity,created_at,updated_at) VALUES ('edition','test','Teste','Recife','2027-01-01','2027-01-03','OPEN',?,?,?)").bind(capacity,now,now),
    env.DB.prepare("INSERT INTO availability (edition_id,reserved,sold,version,updated_at) VALUES ('edition',0,0,1,?)").bind(now),
    env.DB.prepare("INSERT INTO price_batches (id,edition_id,name,amount_cents,installment_count,active,created_at,updated_at) VALUES ('price','edition','Lote',90000,12,1,?,?)").bind(now,now),
    env.DB.prepare("INSERT INTO leads (id,name,email,normalized_email,phone,normalized_phone,edition_id,stage,consent_version,consent_at,dedupe_key,created_at,updated_at) VALUES ('lead-a','Lead A','a@test.local','a@test.local','81999990001','+5581999990001','edition','QUALIFICADO','test',?,'da',?,?),('lead-b','Lead B','b@test.local','b@test.local','81999990002','+5581999990002','edition','QUALIFICADO','test',?,'db',?,?)").bind(now,now,now,now,now,now),
  ]);
}

function checkoutRequest(leadId:string,email:string,key:string) {
  return new Request(`https://newwed.test/api/admin/leads/${leadId}/checkouts`,{method:"POST",headers:{"content-type":"application/json","x-dev-access-email":email,"idempotency-key":key},body:JSON.stringify({editionId:"edition",priceBatchId:"price",method:"CREDIT_CARD",installmentCount:12})});
}

async function storeIncoming(id:string,phone:string,text:string) {
  const event={id,from:phone,type:"text",text:{body:text}};
  const body=JSON.stringify({entry:[{id:"waba",changes:[{value:{messages:[event]}}]}]});
  const signature=`sha256=${await hmacSha256Hex("test-meta-secret",new TextEncoder().encode(body).buffer as ArrayBuffer)}`;
  const response=await receiveMetaWebhook(new Request("https://newwed.test/api/webhooks/meta",{method:"POST",headers:{"content-type":"application/json","x-hub-signature-256":signature},body}));
  expect(response.status).toBe(200);
  return `message:${id}`;
}

describe("concorrência, opt-out e permissões no workerd",()=>{
  it("reserva somente uma última vaga em checkouts concorrentes",async()=>{
    await seed(1);
    const results=await Promise.all([
      createCheckout(checkoutRequest("lead-a","admin@test.local","checkout-key-a"),{params:Promise.resolve({id:"lead-a"})}),
      createCheckout(checkoutRequest("lead-b","admin@test.local","checkout-key-b"),{params:Promise.resolve({id:"lead-b"})}),
    ]);
    expect(results.map((response)=>response.status).sort()).toEqual([202,409]);
    expect(await env.DB.prepare("SELECT reserved,sold FROM availability WHERE edition_id='edition'").first()).toMatchObject({reserved:1,sold:0});
    expect((await env.DB.prepare("SELECT count(*) AS total FROM checkouts").first<{total:number}>())?.total).toBe(1);
  });

  it("impede vendedor de autorizar checkout",async()=>{
    await seed(2);
    const response=await createCheckout(checkoutRequest("lead-a","seller@test.local","seller-checkout-key"),{params:Promise.resolve({id:"lead-a"})});
    expect(response.status).toBe(403);
    expect((await env.DB.prepare("SELECT count(*) AS total FROM checkouts").first<{total:number}>())?.total).toBe(0);
  });

  it("opt-out pausa o agente e bloqueia mensagem humana",async()=>{
    await seed(2);
    await env.DB.prepare("UPDATE leads SET stage='NOVO' WHERE id='lead-a'").run();
    const incoming=await storeIncoming("wamid.optout","5581999990001","sair");
    const openai=vi.fn();const meta=vi.fn();
    expect(await processIncomingWhatsApp(workerEnv,incoming,{openaiFetcher:openai as unknown as typeof fetch,metaFetcher:meta as unknown as typeof fetch})).toMatchObject({processed:true,optedOut:true});
    expect(openai).not.toHaveBeenCalled();expect(meta).not.toHaveBeenCalled();
    const conversation=await env.DB.prepare("SELECT id,mode,opted_out_at FROM conversations WHERE external_id='5581999990001'").first<{id:string;mode:string;opted_out_at:string}>();
    expect(conversation).toMatchObject({mode:"HUMAN"});expect(conversation?.opted_out_at).toBeTruthy();
    expect((await claimConversation(new Request(`https://newwed.test/api/admin/conversations/${conversation!.id}/claim`,{method:"POST",headers:{"x-dev-access-email":"admin@test.local"}}),{params:Promise.resolve({id:conversation!.id})})).status).toBe(200);
    const manual=await sendManualMessage(new Request(`https://newwed.test/api/admin/conversations/${conversation!.id}/messages`,{method:"POST",headers:{"content-type":"application/json","x-dev-access-email":"admin@test.local","idempotency-key":"manual-optout-key"},body:JSON.stringify({body:"Mensagem indevida"})}),{params:Promise.resolve({id:conversation!.id})});
    expect(manual.status).toBe(409);
    expect((await env.DB.prepare("SELECT count(*) AS total FROM messages WHERE direction='OUT'").first<{total:number}>())?.total).toBe(0);
  });

  it("baixa confiança gera handoff antes de liberar resposta humana",async()=>{
    await seed(2);
    await env.DB.prepare("UPDATE leads SET stage='NOVO' WHERE id='lead-b'").run();
    const incoming=await storeIncoming("wamid.low","5581999990002","Tenho uma dúvida diferente sobre o roteiro");
    const openai=(async()=>new Response(JSON.stringify({output_text:JSON.stringify({reply:"Vou pedir ajuda à equipe.",confidence:0.3,handoff:false,reason:"Contexto insuficiente"})}))) as typeof fetch;
    const meta=(async()=>new Response(JSON.stringify({messages:[{id:"wamid.handoff"}]}))) as typeof fetch;
    expect(await processIncomingWhatsApp(workerEnv,incoming,{openaiFetcher:openai,metaFetcher:meta})).toMatchObject({processed:true,answered:true,handoff:true});
    expect(await env.DB.prepare("SELECT mode,claimed_by,agent_processing_token FROM conversations WHERE external_id='5581999990002'").first()).toMatchObject({mode:"HUMAN",claimed_by:null,agent_processing_token:null});
    expect((await env.DB.prepare("SELECT count(*) AS total FROM messages WHERE direction='OUT' AND status='ACCEPTED'").first<{total:number}>())?.total).toBe(1);
  });

  it("rejeita webhook Meta sem assinatura antes de persistir",async()=>{
    await seed(1);
    const response=await receiveMetaWebhook(new Request("https://newwed.test/api/webhooks/meta",{method:"POST",headers:{"content-type":"application/json","x-hub-signature-256":"sha256=invalid"},body:"{}"}));
    expect(response.status).toBe(401);
    expect((await env.DB.prepare("SELECT count(*) AS total FROM webhook_events").first<{total:number}>())?.total).toBe(0);
  });
});
