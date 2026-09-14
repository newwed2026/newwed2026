#!/usr/bin/env node

import { readFileSync } from "node:fs";

const target = process.argv[2];
if (!new Set(["staging", "production"]).has(target)) {
  console.error("Uso: node scripts/preflight-launch.mjs <staging|production>");
  process.exit(2);
}

const configs = ["wrangler.jsonc", "wrangler.events.jsonc"].map((file) => ({
  file,
  value: JSON.parse(readFileSync(new URL(`../${file}`, import.meta.url), "utf8")),
}));
const errors = [];
const placeholder = "00000000-0000-0000-0000-000000000000";

for (const { file, value } of configs) {
  const selected = value.env?.[target];
  if (!selected) {
    errors.push(`${file}: ambiente ${target} ausente`);
    continue;
  }

  if (selected.vars?.ENVIRONMENT !== target) {
    errors.push(`${file}: ENVIRONMENT deve ser ${target}`);
  }
  if (selected.vars?.ALLOW_LOCAL_ACCESS === "true") {
    errors.push(`${file}: ALLOW_LOCAL_ACCESS não pode estar ativo`);
  }

  for (const database of selected.d1_databases ?? []) {
    if (!database.database_id || database.database_id === placeholder) {
      errors.push(`${file}: D1 ${database.database_name} ainda usa ID marcador`);
    }
  }
  if (!(selected.queues?.producers?.length > 0)) {
    errors.push(`${file}: producer de Queue ausente`);
  }
}

const app = configs.find(({ file }) => file === "wrangler.jsonc")?.value.env[target];
const events = configs.find(({ file }) => file === "wrangler.events.jsonc")?.value.env[target];
if (!(app?.r2_buckets?.length > 0)) errors.push("wrangler.jsonc: binding R2 MEDIA ausente");
if (!(events?.queues?.consumers?.[0]?.dead_letter_queue)) {
  errors.push("wrangler.events.jsonc: DLQ do consumidor ausente");
}
if (!(events?.send_email?.[0]?.allowed_sender_addresses?.length > 0)) {
  errors.push("wrangler.events.jsonc: remetente EMAIL não configurado");
}
if (!(events?.send_email?.[0]?.allowed_destination_addresses?.length > 0)) {
  errors.push("wrangler.events.jsonc: destinatários EMAIL não configurados");
}
const expectedAsaas = target === "production"
  ? "https://api.asaas.com/v3"
  : "https://api-sandbox.asaas.com/v3";
if (app?.vars?.ASAAS_API_URL !== expectedAsaas || events?.vars?.ASAAS_API_URL !== expectedAsaas) {
  errors.push(`ASAAS_API_URL deve ser ${expectedAsaas} nos dois Workers`);
}

if (errors.length > 0) {
  console.error(`Preflight ${target}: BLOQUEADO`);
  for (const error of errors) console.error(`- ${error}`);
  console.error("Segredos, permissões, webhooks e aprovações devem ser conferidos pelo runbook; valores nunca são impressos.");
  process.exit(1);
}

console.log(`Preflight ${target}: configuração estática aprovada.`);
console.log("Próximo gate: conferir recursos, secrets, Access, webhooks e autorização conforme docs/operations/LAUNCH_CHECKLIST.md.");
