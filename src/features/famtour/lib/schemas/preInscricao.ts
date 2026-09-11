import { z } from "zod";

export const preInscricaoSchema = z
  .object({
    nome: z
      .string()
      .trim()
      .min(1, "Informe seu nome completo")
      .regex(/\S+\s+\S+/, "Informe nome e sobrenome"),
    email: z.string().trim().email("E-mail inválido"),
    telefone: z
      .string()
      .trim()
      .refine((v) => {
        const d = v.replace(/\D/g, "");
        return d.length === 10 || d.length === 11;
      }, "WhatsApp inválido (10 ou 11 dígitos com DDD)"),
    instagram: z.string().trim().optional().default(""),
    empresa: z.string().trim().min(1, "Informe sua empresa ou assessoria"),
    cidade_estado: z.string().trim().min(1, "Informe estado e cidade"),
    famtour_id: z.string().optional().default(""),
    respostas_brutas: z.object({
      status_dw: z.enum(["JA_TRABALHA", "INTERESSE_COMECAR"], { error: "Selecione uma opção" }),
      trabalha_sozinho: z.string().optional().default(""),
      tem_casal_nordeste: z.enum(["sim", "nao"], { error: "Selecione uma opção" }),
      destino_interesse: z
        .string()
        .trim()
        .min(1, "Informe um destino"),
      destino_outro: z.string().optional().default(""),
      expectativa: z
        .string()
        .trim()
        .min(20, "Conte um pouco mais (mínimo 20 caracteres)"),
      maior_desafio: z.string().optional().default(""),
    }),
    lgpd: z.literal(true, { error: "Necessário concordar para continuar" }),
  });

export type PreInscricaoData = z.infer<typeof preInscricaoSchema>;
