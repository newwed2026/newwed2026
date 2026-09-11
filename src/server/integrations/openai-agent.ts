import type { RuntimeSecrets } from "@/server/secrets";

type AgentResult = { reply: string; confidence: number; handoff: boolean };

export async function answerWithAgent(env: Env & RuntimeSecrets, input: { message: string; leadId?: string | null }): Promise<AgentResult> {
  if (!env.OPENAI_API_KEY) return { reply: "Vou encaminhar sua mensagem para nossa equipe.", confidence: 0, handoff: true };
  const editions = await env.DB.prepare(`SELECT e.name,e.destination,e.starts_at,e.ends_at,e.capacity,a.reserved,a.sold,p.amount_cents,p.installment_count
    FROM editions e JOIN availability a ON a.edition_id=e.id LEFT JOIN price_batches p ON p.edition_id=e.id AND p.active=1 WHERE e.status='OPEN' ORDER BY e.starts_at`).all();
  const lead = input.leadId ? await env.DB.prepare("SELECT name,stage,edition_id FROM leads WHERE id=?").bind(input.leadId).first() : null;
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { authorization: `Bearer ${env.OPENAI_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({
      model: env.OPENAI_MODEL || "gpt-5-mini",
      store: false,
      instructions: `Você atende em português pela New Wed. Use exclusivamente o catálogo server-side fornecido. Nunca invente preços, vagas, condições ou políticas. Se houver intenção de compra, reclamação, pedido de humano ou incerteza, defina handoff=true. Seja breve. Catálogo: ${JSON.stringify(editions.results)}. Lead: ${JSON.stringify(lead)}.`,
      input: input.message,
      text: {
        format: {
          type: "json_schema",
          name: "whatsapp_reply",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: { reply: { type: "string" }, confidence: { type: "number", minimum: 0, maximum: 1 }, handoff: { type: "boolean" } },
            required: ["reply", "confidence", "handoff"],
          },
        },
      },
    }),
  });
  if (!response.ok) throw new Error(`OpenAI response failed: ${response.status}`);
  const result = await response.json() as { output_text?: string };
  const parsed = JSON.parse(result.output_text ?? "{}") as AgentResult;
  return { ...parsed, handoff: parsed.handoff || parsed.confidence < 0.65 };
}
