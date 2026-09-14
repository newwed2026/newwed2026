import type { RuntimeSecrets } from "@/server/secrets";

export type MetaFetcher = typeof fetch;

export async function sendWhatsAppText(env: Env & RuntimeSecrets, to: string, body: string,fetcher: MetaFetcher = fetch) {
  if (!env.META_ACCESS_TOKEN || !env.META_PHONE_NUMBER_ID) throw new Error("Meta Cloud API não configurada");
  const response = await fetcher(`https://graph.facebook.com/${env.META_GRAPH_VERSION}/${env.META_PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: { authorization: `Bearer ${env.META_ACCESS_TOKEN}`, "content-type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", recipient_type: "individual", to, type: "text", text: { preview_url: false, body } }),
  });
  if (!response.ok) throw new Error(`Meta send failed: ${response.status}`);
  return response.json() as Promise<{ messages?: Array<{ id: string }> }>;
}

export async function sendCheckoutTemplate(env: Env & RuntimeSecrets, to: string, checkoutUrl: string,fetcher: MetaFetcher = fetch) {
  if (!env.META_ACCESS_TOKEN || !env.META_PHONE_NUMBER_ID) throw new Error("Meta Cloud API não configurada");
  const response = await fetcher(`https://graph.facebook.com/${env.META_GRAPH_VERSION}/${env.META_PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: { authorization: `Bearer ${env.META_ACCESS_TOKEN}`, "content-type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: env.META_CHECKOUT_TEMPLATE,
        language: { code: "pt_BR" },
        components: [{ type: "body", parameters: [{ type: "text", text: checkoutUrl }] }],
      },
    }),
  });
  if (!response.ok) throw new Error(`Meta template failed: ${response.status}`);
  return response.json() as Promise<{ messages?: Array<{ id: string }> }>;
}
