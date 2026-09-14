import { describe,expect,it } from "vitest";
import { publicLeadSchema,transitionSchema } from "@/features/leads/schemas";

const valid = {
  nome:"Maria da Silva",email:"maria@example.com",telefone:"81999990000",empresa:"Assessoria Maria",cidade_estado:"Recife, PE",
  editionSlug:"famtour-rn-abril-2027",respostas_brutas:{ expectativa:"Aprender sobre o destino" },lgpd:true,
  consent:{ version:"2026-09-11",accepted:true },landingUrl:"https://newwed.com.br/famtour",utm:{utm_source:"instagram"},
};

describe("contrato público de lead",() => {
  it("aceita payload completo",() => expect(publicLeadSchema.parse(valid).email).toBe("maria@example.com"));
  it("exige consentimento explícito",() => expect(publicLeadSchema.safeParse({...valid,lgpd:false}).success).toBe(false));
  it("rejeita URL de atribuição inválida",() => expect(publicLeadSchema.safeParse({...valid,landingUrl:"invalida"}).success).toBe(false));
});

describe("contrato de transição comercial",() => {
  it.each(["PERDIDO","CANCELADO"])("exige motivo em %s",(stage) => {
    expect(transitionSchema.safeParse({ stage }).success).toBe(false);
    expect(transitionSchema.safeParse({ stage,reason:"Sem aderência ao perfil" }).success).toBe(true);
  });
  it("exige próxima ação e data em nutrição",() => {
    expect(transitionSchema.safeParse({ stage:"NUTRICAO",nextAction:"Retomar contato" }).success).toBe(false);
    expect(transitionSchema.safeParse({ stage:"NUTRICAO",nextActionAt:"2026-10-01T12:00:00Z" }).success).toBe(false);
    expect(transitionSchema.safeParse({ stage:"NUTRICAO",nextAction:"Retomar contato",nextActionAt:"2026-10-01T12:00:00Z" }).success).toBe(true);
  });
  it("não exige motivo para uma etapa operacional",() => {
    expect(transitionSchema.safeParse({ stage:"EM_ATENDIMENTO" }).success).toBe(true);
  });
});
