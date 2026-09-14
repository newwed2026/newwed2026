import { HttpError } from "@/server/http";
import type { RuntimeSecrets } from "@/server/secrets";

const DEFAULT_BASE_URL = "https://api-sandbox.asaas.com/v3";

export type AsaasEnvironment = RuntimeSecrets & { ASAAS_API_URL?: string };
export type AsaasFetcher = typeof fetch;

export type AsaasPaymentSnapshot = {
  id: string;
  externalReference?: string;
  customer?: string;
  installment?: string;
  installmentNumber?: number;
  invoiceUrl?: string;
  billingType?: string;
  value: number;
  dueDate?: string;
  status: string;
  paymentDate?: string;
  confirmedDate?: string;
};

type LeadForBilling = { id:string;name:string;email:string;normalizedPhone:string };

function baseUrl(env: AsaasEnvironment) {
  return (env.ASAAS_API_URL || DEFAULT_BASE_URL).replace(/\/$/,"");
}

async function asaas<T>(env: AsaasEnvironment,path: string,init: RequestInit = {},fetcher: AsaasFetcher = fetch): Promise<T> {
  if (!env.ASAAS_API_KEY) throw new HttpError(503,"ASAAS_NOT_CONFIGURED","Integração Asaas ainda não configurada.");
  const response = await fetcher(`${baseUrl(env)}${path}`,{
    ...init,
    headers:{ "content-type":"application/json",access_token:env.ASAAS_API_KEY,"user-agent":"NewWedPlatform/1.0",...init.headers },
  });
  const body = await response.json().catch(() => ({})) as Record<string,unknown>;
  if (!response.ok) {
    console.error(JSON.stringify({ level:"error",event:"asaas.request_failed",path,status:response.status }));
    if (response.status === 404) throw new HttpError(404,"ASAAS_RESOURCE_NOT_FOUND","Recurso Asaas não encontrado.");
    throw new HttpError(502,"ASAAS_ERROR","O Asaas não aceitou a solicitação.");
  }
  return body as T;
}

export async function findOrCreateCustomer(env: AsaasEnvironment,lead: LeadForBilling,fetcher: AsaasFetcher = fetch) {
  const found = await asaas<{ data:Array<{ id:string }> }>(env,`/customers?externalReference=${encodeURIComponent(lead.id)}&limit=1`,{},fetcher);
  if (found.data[0]) return found.data[0].id;
  const created = await asaas<{ id:string }>(env,"/customers",{
    method:"POST",
    body:JSON.stringify({ name:lead.name,email:lead.email,mobilePhone:lead.normalizedPhone.replace(/^\+55/,""),externalReference:lead.id }),
  },fetcher);
  return created.id;
}

export function buildAsaasPaymentPayload(input: {
  customerId:string;
  checkoutId:string;
  method:"PIX"|"CREDIT_CARD";
  amountCents:number;
  installmentCount:number;
  dueDate:string;
  description:string;
}) {
  const common = {
    customer:input.customerId,
    billingType:input.method,
    dueDate:input.dueDate,
    description:input.description,
    externalReference:input.checkoutId,
  };
  if (input.installmentCount > 1) {
    return { ...common,installmentCount:input.installmentCount,totalValue:input.amountCents / 100 };
  }
  return { ...common,value:input.amountCents / 100 };
}

export async function findPaymentsByExternalReference(env: AsaasEnvironment,checkoutId: string,fetcher: AsaasFetcher = fetch) {
  const response = await asaas<{ data:AsaasPaymentSnapshot[] }>(env,`/payments?externalReference=${encodeURIComponent(checkoutId)}&limit=100`,{},fetcher);
  return response.data.filter((payment) => payment.externalReference === checkoutId);
}

export async function createAsaasPayment(env: AsaasEnvironment,input: {
  customerId:string;
  checkoutId:string;
  method:"PIX"|"CREDIT_CARD";
  amountCents:number;
  installmentCount:number;
  dueDate:string;
  description:string;
},fetcher: AsaasFetcher = fetch) {
  return asaas<AsaasPaymentSnapshot>(env,"/payments",{
    method:"POST",
    body:JSON.stringify(buildAsaasPaymentPayload(input)),
  },fetcher);
}

export async function listInstallmentPayments(env: AsaasEnvironment,installmentId: string,fetcher: AsaasFetcher = fetch) {
  const response = await asaas<{ data:AsaasPaymentSnapshot[] }>(env,`/installments/${encodeURIComponent(installmentId)}/payments?limit=100`,{},fetcher);
  return response.data;
}

export async function getAsaasPayment(env: AsaasEnvironment,paymentId: string,fetcher: AsaasFetcher = fetch) {
  return asaas<AsaasPaymentSnapshot>(env,`/payments/${encodeURIComponent(paymentId)}`,{},fetcher);
}

export async function cancelAsaasPayment(env: AsaasEnvironment,input: { paymentId:string;installmentId?:string|null },fetcher: AsaasFetcher = fetch) {
  const path = input.installmentId
    ? `/installments/${encodeURIComponent(input.installmentId)}/payments`
    : `/payments/${encodeURIComponent(input.paymentId)}`;
  try {
    await asaas<Record<string,unknown>>(env,path,{ method:"DELETE" },fetcher);
    return { cancelled:true as const,alreadyMissing:false };
  } catch (error) {
    if (error instanceof HttpError && error.code === "ASAAS_RESOURCE_NOT_FOUND") {
      return { cancelled:true as const,alreadyMissing:true };
    }
    throw error;
  }
}
