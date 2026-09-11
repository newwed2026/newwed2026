import { z } from "zod";

export const pipelineStageSchema = z.enum([
  "NOVO",
  "EM_ATENDIMENTO",
  "QUALIFICADO",
  "CHECKOUT_ENVIADO",
  "AGUARDANDO_PAGAMENTO",
  "PAGO",
  "NUTRICAO",
  "PERDIDO",
  "CANCELADO",
]);

export type PipelineStage = z.infer<typeof pipelineStageSchema>;

const transitions: Record<PipelineStage, readonly PipelineStage[]> = {
  NOVO: ["EM_ATENDIMENTO", "NUTRICAO", "PERDIDO", "CANCELADO"],
  EM_ATENDIMENTO: ["QUALIFICADO", "NUTRICAO", "PERDIDO", "CANCELADO"],
  QUALIFICADO: ["CHECKOUT_ENVIADO", "EM_ATENDIMENTO", "NUTRICAO", "PERDIDO", "CANCELADO"],
  CHECKOUT_ENVIADO: ["AGUARDANDO_PAGAMENTO", "QUALIFICADO", "CANCELADO"],
  AGUARDANDO_PAGAMENTO: ["PAGO", "QUALIFICADO", "CANCELADO"],
  PAGO: ["CANCELADO"],
  NUTRICAO: ["EM_ATENDIMENTO", "PERDIDO", "CANCELADO"],
  PERDIDO: ["EM_ATENDIMENTO", "NUTRICAO"],
  CANCELADO: ["EM_ATENDIMENTO"],
};

export function canTransition(from: PipelineStage, to: PipelineStage): boolean {
  return from === to || transitions[from].includes(to);
}

export function assertTransition(from: PipelineStage, to: PipelineStage): void {
  if (!canTransition(from, to)) {
    throw new Error(`Transição inválida: ${from} → ${to}`);
  }
}
