import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, extname, resolve } from "node:path";
import { parse } from "csv-parse/sync";

type Source = Record<string, unknown>;
const validStages = new Set(["NOVO","EM_ATENDIMENTO","QUALIFICADO","CHECKOUT_ENVIADO","AGUARDANDO_PAGAMENTO","PAGO","NUTRICAO","PERDIDO","CANCELADO"]);

function arg(name: string) { const index = process.argv.indexOf(`--${name}`); return index >= 0 ? process.argv[index + 1] : undefined; }
function sql(value: unknown) { return value == null || value === "" ? "NULL" : `'${String(value).replaceAll("'", "''")}'`; }
function normalizedEmail(value: unknown) { return String(value ?? "").trim().toLowerCase(); }
function normalizedPhone(value: unknown) { let digits = String(value ?? "").replace(/\D/g,""); if (!digits.startsWith("55") && [10,11].includes(digits.length)) digits=`55${digits}`; return digits ? `+${digits}` : ""; }
function stableId(namespace: string, value: string) { return `${namespace}_${createHash("sha256").update(value).digest("hex").slice(0,32)}`; }
function parseDate(value: unknown) { const date = value ? new Date(String(value)) : new Date(); return Number.isNaN(date.valueOf()) ? new Date().toISOString() : date.toISOString(); }

async function main() {
  const inputName = arg("input");
  const outputName = arg("output") ?? "tmp/base44-import.sql";
  if (!inputName) throw new Error("Uso: npm run base44:prepare -- --input export.csv --output tmp/base44-import.sql");
  const inputPath = resolve(inputName);
  const outputPath = resolve(outputName);
  const raw = await readFile(inputPath,"utf8");
  const rows: Source[] = extname(inputPath).toLowerCase() === ".json"
    ? JSON.parse(raw)
    : parse(raw,{ columns:true,skip_empty_lines:true,bom:true,relax_column_count:true });
  if (!Array.isArray(rows)) throw new Error("O arquivo precisa conter uma lista de leads.");

  const seen = new Set<string>();
  const statements: string[] = ["BEGIN TRANSACTION;"];
  let duplicates = 0;
  let rejected = 0;
  for (const row of rows) {
    const email = normalizedEmail(row.email);
    const phone = normalizedPhone(row.telefone ?? row.phone ?? row.whatsapp);
    if (!email || !phone || !String(row.nome ?? row.name ?? "").trim()) { rejected += 1; continue; }
    const dedupeKey = createHash("sha256").update(`${email}|${phone}`).digest("hex");
    if (seen.has(dedupeKey)) { duplicates += 1; continue; }
    seen.add(dedupeKey);
    const sourceId = String(row.id ?? row._id ?? dedupeKey);
    const leadId = stableId("lead",sourceId);
    const createdAt = parseDate(row.created_at ?? row.createdAt ?? row.created_date);
    const stageCandidate = String(row.stage ?? row.status ?? "NOVO").toUpperCase().replaceAll(" ","_");
    const stage = validStages.has(stageCandidate) ? stageCandidate : "NOVO";
    const answers = Object.fromEntries(Object.entries(row).filter(([key]) => ["status_dw","trabalha_sozinho","tem_casal_nordeste","destino_interesse","expectativa","maior_desafio"].includes(key)));
    const editionId = row.famtour_id ?? row.edition_id ?? null;
    statements.push(`INSERT INTO leads (id,name,email,normalized_email,phone,normalized_phone,instagram,company,city_state,edition_id,stage,consent_version,consent_at,source_system,external_id,dedupe_key,created_at,updated_at) VALUES (${sql(leadId)},${sql(row.nome ?? row.name)},${sql(row.email)},${sql(email)},${sql(row.telefone ?? row.phone ?? row.whatsapp)},${sql(phone)},${sql(row.instagram)},${sql(row.empresa ?? row.company)},${sql(row.cidade_estado ?? row.city_state)},${sql(editionId)},${sql(stage)},${sql(row.consent_version ?? "base44-import")},${sql(parseDate(row.consent_at ?? createdAt))},'base44',${sql(sourceId)},${sql(dedupeKey)},${sql(createdAt)},${sql(parseDate(row.updated_at ?? row.updatedAt ?? createdAt))}) ON CONFLICT(source_system,external_id) DO NOTHING;`);
    statements.push(`INSERT INTO lead_answers (id,lead_id,answers_json,created_at) VALUES (${sql(stableId("answers",sourceId))},${sql(leadId)},${sql(JSON.stringify(answers))},${sql(createdAt)}) ON CONFLICT(id) DO NOTHING;`);
    statements.push(`INSERT INTO pipeline_history (id,lead_id,from_stage,to_stage,actor_id,reason,created_at) VALUES (${sql(stableId("pipeline",sourceId))},${sql(leadId)},NULL,${sql(stage)},NULL,'Migração Base44',${sql(createdAt)}) ON CONFLICT(id) DO NOTHING;`);
    const history = Array.isArray(row.historico ?? row.history) ? (row.historico ?? row.history) as Source[] : [];
    history.forEach((item,index) => {
      const toStageCandidate = String(item.to_stage ?? item.stage ?? "NOVO").toUpperCase().replaceAll(" ","_");
      if (!validStages.has(toStageCandidate)) return;
      statements.push(`INSERT INTO pipeline_history (id,lead_id,from_stage,to_stage,actor_id,reason,created_at) VALUES (${sql(stableId("history",`${sourceId}:${index}`))},${sql(leadId)},${sql(item.from_stage)},${sql(toStageCandidate)},NULL,${sql(item.reason ?? "Histórico migrado da Base44")},${sql(parseDate(item.created_at ?? createdAt))}) ON CONFLICT(id) DO NOTHING;`);
    });
    statements.push(`INSERT INTO lead_attribution (id,lead_id,touch_type,landing_url,referrer,utm_source,utm_medium,utm_campaign,utm_content,utm_term,created_at) VALUES (${sql(stableId("attribution",sourceId))},${sql(leadId)},'FIRST',${sql(row.landing_url ?? "https://base44.app")},${sql(row.referrer)},${sql(row.utm_source)},${sql(row.utm_medium)},${sql(row.utm_campaign)},${sql(row.utm_content)},${sql(row.utm_term)},${sql(createdAt)}) ON CONFLICT(lead_id,touch_type) DO NOTHING;`);
  }
  statements.push("COMMIT;");
  await mkdir(dirname(outputPath),{ recursive:true });
  await writeFile(outputPath,statements.join("\n"),{ mode:0o600 });
  const report = { sourceRows:rows.length,prepared:seen.size,duplicates,rejected,sourceSha256:createHash("sha256").update(raw).digest("hex"),sqlSha256:createHash("sha256").update(statements.join("\n")).digest("hex") };
  await writeFile(`${outputPath}.report.json`,JSON.stringify(report,null,2),{ mode:0o600 });
  console.log(JSON.stringify(report,null,2));
}

main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode=1; });
