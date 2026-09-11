import { HttpError } from "@/server/http";
import { getSecrets } from "@/server/secrets";

const BASE_URL = "https://api.asaas.com/v3";

type LeadForBilling = { id: string; name: string; email: string; normalizedPhone: string };

async function asaas<T>(path: string, init: RequestInit = {}): Promise<T> {
  const key = getSecrets().ASAAS_API_KEY;
  if (!key) throw new HttpError(503, "ASAAS_NOT_CONFIGURED", "Integração Asaas ainda não configurada.");
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: { "content-type": "application/json", access_token: key, "user-agent": "NewWedPlatform/1.0", ...init.headers },
  });
  const body = await response.json().catch(() => ({})) as Record<string, unknown>;
  if (!response.ok) {
    console.error(JSON.stringify({ level: "error", event: "asaas.request_failed", path, status: response.status }));
    throw new HttpError(502, "ASAAS_ERROR", "O Asaas não aceitou a solicitação.");
  }
  return body as T;
}

export async function findOrCreateCustomer(lead: LeadForBilling) {
  const found = await asaas<{ data: Array<{ id: string }> }>(`/customers?externalReference=${encodeURIComponent(lead.id)}&limit=1`);
  if (found.data[0]) return found.data[0].id;
  const created = await asaas<{ id: string }>("/customers", {
    method: "POST",
    body: JSON.stringify({ name: lead.name, email: lead.email, mobilePhone: lead.normalizedPhone.replace(/^\+55/, ""), externalReference: lead.id }),
  });
  return created.id;
}

export async function createAsaasPayment(input: {
  customerId: string;
  checkoutId: string;
  method: "PIX" | "CREDIT_CARD";
  amountCents: number;
  dueDate?: string;
  description: string;
}) {
  return asaas<{ id: string; invoiceUrl: string; status: string }>("/payments", {
    method: "POST",
    body: JSON.stringify({
      customer: input.customerId,
      billingType: input.method,
      value: input.amountCents / 100,
      dueDate: input.dueDate ?? new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
      description: input.description,
      externalReference: input.checkoutId,
    }),
  });
}
