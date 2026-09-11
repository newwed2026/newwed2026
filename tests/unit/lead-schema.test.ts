import { describe,expect,it } from "vitest";
import { publicLeadSchema } from "@/features/leads/schemas";

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
