"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Columns3,List,MessageSquare,RefreshCw,Search,X } from "lucide-react";
import { AdminInbox } from "@/features/admin/AdminInbox";
import { canManuallyTransition } from "@/features/pipeline/model";

const stages = ["NOVO","EM_ATENDIMENTO","QUALIFICADO","CHECKOUT_ENVIADO","AGUARDANDO_PAGAMENTO","PAGO","NUTRICAO","PERDIDO","CANCELADO"] as const;
type Stage = typeof stages[number];
type Lead = { id: string; name: string; email: string; phone: string; company?: string; city_state?: string; stage: Stage; edition_name?: string; created_at: string };
type Detail = { lead: Record<string, unknown>; answers: Array<Record<string, unknown>>; history: Array<Record<string, unknown>>; activities: Array<Record<string, unknown>>; conversations: Array<Record<string, unknown>>; checkouts: Array<Record<string, unknown>> };

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, headers: { "content-type": "application/json", ...init?.headers } });
  const body = await response.json() as T & { message?: string };
  if (!response.ok) throw new Error(body.message ?? "Falha na solicitação");
  return body;
}

function stageLabel(stage: string) { return stage.replaceAll("_", " "); }

export function AdminDashboard() {
  const [leads,setLeads] = useState<Lead[]>([]);
  const [query,setQuery] = useState("");
  const [view,setView] = useState<"kanban"|"list">("kanban");
  const [workspace,setWorkspace] = useState<"pipeline"|"inbox">("pipeline");
  const [selected,setSelected] = useState<Detail|null>(null);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setLeads((await api<{items: Lead[]}>(`/api/admin/leads?q=${encodeURIComponent(query)}`)).items); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Não foi possível carregar os leads."); }
    finally { setLoading(false); }
  },[query]);

  useEffect(() => { const timeout = setTimeout(load,250); return () => clearTimeout(timeout); },[load]);

  const grouped = useMemo(() => Object.fromEntries(stages.map((stage) => [stage,leads.filter((lead) => lead.stage === stage)])) as Record<Stage,Lead[]>,[leads]);
  const openLead = async (id: string) => { try { setSelected(await api<Detail>(`/api/admin/leads/${id}`)); } catch (reason) { setError(reason instanceof Error ? reason.message : "Erro"); } };
  const refreshSelected = async () => { if (selected) setSelected(await api<Detail>(`/api/admin/leads/${selected.lead.id}`)); };
  const transition = async (stage: Stage) => {
    if (!selected) return;
    const payload: { stage:Stage;reason?:string;nextAction?:string;nextActionAt?:string } = { stage };
    if (stage === "PERDIDO" || stage === "CANCELADO") {
      const reason = window.prompt(`Motivo da mudança para ${stageLabel(stage)}:`)?.trim();
      if (!reason) return;
      payload.reason = reason;
    }
    if (stage === "NUTRICAO") {
      const nextAction = window.prompt("Qual é a próxima ação?")?.trim();
      if (!nextAction) return;
      const scheduledFor = window.prompt("Quando executar? Use data e hora, por exemplo 2026-10-01 09:00")?.trim();
      if (!scheduledFor) return;
      const parsedDate = new Date(scheduledFor);
      if (Number.isNaN(parsedDate.getTime())) { setError("Informe uma data e hora válidas para a próxima ação.");return; }
      payload.nextAction = nextAction;
      payload.nextActionAt = parsedDate.toISOString();
    }
    try {
      await api(`/api/admin/leads/${selected.lead.id}/transitions`,{ method:"POST",body:JSON.stringify(payload) });
      setSelected(await api<Detail>(`/api/admin/leads/${selected.lead.id}`));
      await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Não foi possível mover o lead."); }
  };

  return <main className="min-h-screen bg-[#F7F4EE] text-[#191010]">
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#191010] px-5 py-4 text-white md:px-8">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-5">
        <div><div className="serif text-xl tracking-[0.18em]">NEW WED</div><div className="mt-1 text-[9px] uppercase tracking-[0.22em] text-white/45">Comercial</div></div>
        <div className="flex items-center gap-2">
          <button onClick={() => setWorkspace("pipeline")} aria-label="Pipeline" className={`flex items-center gap-2 px-3 py-2 text-[9px] uppercase tracking-[0.12em] ${workspace === "pipeline" ? "bg-white text-[#191010]" : "text-white/65"}`}><Columns3 size={16}/> Pipeline</button>
          <button onClick={() => setWorkspace("inbox")} aria-label="Inbox" className={`flex items-center gap-2 px-3 py-2 text-[9px] uppercase tracking-[0.12em] ${workspace === "inbox" ? "bg-white text-[#191010]" : "text-white/65"}`}><MessageSquare size={16}/> Inbox</button>
          {workspace === "pipeline" && <><button onClick={() => setView("kanban")} aria-label="Kanban" className={`p-2 ${view === "kanban" ? "text-white" : "text-white/45"}`}><Columns3 size={17}/></button><button onClick={() => setView("list")} aria-label="Lista" className={`p-2 ${view === "list" ? "text-white" : "text-white/45"}`}><List size={17}/></button><button onClick={load} aria-label="Atualizar" className="p-2 text-white/65 hover:text-white"><RefreshCw size={17}/></button></>}
        </div>
      </div>
    </header>
    {workspace === "inbox" ? <AdminInbox/> : <section className="mx-auto max-w-[1600px] px-5 py-7 md:px-8">
      <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div><p className="text-[9px] uppercase tracking-[0.24em] text-[#2E8E8E]">Pipeline</p><h1 className="serif mt-2 text-4xl font-light md:text-5xl">Relacionamentos em movimento.</h1></div>
        <label className="flex min-w-72 items-center gap-3 border-b border-black/20 py-2"><Search size={16} className="text-black/40"/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar nome, e-mail ou telefone" className="w-full bg-transparent text-sm outline-none"/></label>
      </div>
      {error && <div className="mb-5 border border-[#7A2535]/30 bg-white p-4 text-sm text-[#7A2535]">{error}</div>}
      {loading ? <div className="py-20 text-center text-xs uppercase tracking-[0.2em] text-black/40">Carregando pipeline…</div> : view === "kanban" ?
        <div className="flex snap-x gap-3 overflow-x-auto pb-5">{stages.map((stage) => <section key={stage} className="w-[285px] shrink-0 snap-start">
          <div className="mb-3 flex items-center justify-between border-t-2 border-[#7A2535] pt-3"><h2 className="text-[10px] font-medium uppercase tracking-[0.16em]">{stageLabel(stage)}</h2><span className="text-xs text-black/40">{grouped[stage].length}</span></div>
          <div className="space-y-2">{grouped[stage].map((lead) => <LeadCard key={lead.id} lead={lead} onClick={() => openLead(lead.id)}/>)}</div>
        </section>)}</div> :
        <div className="overflow-x-auto border border-black/10 bg-white"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-black/10 text-[9px] uppercase tracking-[0.18em] text-black/45"><tr><th className="p-4">Lead</th><th className="p-4">Empresa</th><th className="p-4">Edição</th><th className="p-4">Etapa</th><th className="p-4">Entrada</th></tr></thead><tbody>{leads.map((lead) => <tr key={lead.id} onClick={() => openLead(lead.id)} className="cursor-pointer border-b border-black/5 hover:bg-[#F7F4EE]"><td className="p-4"><b className="font-medium">{lead.name}</b><div className="text-xs text-black/45">{lead.email}</div></td><td className="p-4">{lead.company || "—"}</td><td className="p-4">{lead.edition_name || "—"}</td><td className="p-4 text-xs uppercase">{stageLabel(lead.stage)}</td><td className="p-4">{new Date(lead.created_at).toLocaleDateString("pt-BR")}</td></tr>)}</tbody></table></div>}
    </section>}
    {workspace === "pipeline" && selected && <DetailPanel detail={selected} onClose={() => setSelected(null)} onTransition={transition} onRefresh={refreshSelected}/>}
  </main>;
}

function LeadCard({lead,onClick}:{lead:Lead;onClick:()=>void}) {
  return <button onClick={onClick} className="w-full border border-black/10 bg-white p-4 text-left shadow-[0_8px_20px_rgba(25,16,16,0.04)] transition hover:-translate-y-0.5 hover:border-[#7A2535]/40">
    <div className="serif text-xl leading-tight">{lead.name}</div><div className="mt-2 text-[11px] text-black/50">{lead.company || lead.email}</div><div className="mt-4 border-t border-black/5 pt-3 text-[9px] uppercase tracking-[0.14em] text-[#2E8E8E]">{lead.edition_name || "Sem edição"}</div>
  </button>;
}

function DetailPanel({detail,onClose,onTransition,onRefresh}:{detail:Detail;onClose:()=>void;onTransition:(stage:Stage)=>Promise<void>;onRefresh:()=>Promise<void>}) {
  const lead = detail.lead;
  const [users,setUsers] = useState<Array<{id:string;name:string}>>([]);
  const [editions,setEditions] = useState<Array<{id:string;price_batch_id:string;price_batch_name:string;amount_cents:number;installment_count:number}>>([]);
  const [assignee,setAssignee] = useState("");
  const [task,setTask] = useState("");
  const [method,setMethod] = useState<"PIX"|"CREDIT_CARD">("PIX");
  const [installmentCount,setInstallmentCount] = useState(1);
  const [notice,setNotice] = useState("");
  useEffect(() => { Promise.all([api<{users:Array<{id:string;name:string}>}>("/api/admin/users"),api<{editions:Array<{id:string;price_batch_id:string;price_batch_name:string;amount_cents:number;installment_count:number}>}>("/api/catalog/editions")]).then(([people,catalog]) => { setUsers(people.users);setEditions(catalog.editions); }).catch(() => undefined); },[]);
  const assign = async () => { if (!assignee) return; await api(`/api/admin/leads/${lead.id}/assign`,{method:"POST",body:JSON.stringify({userId:assignee})});setNotice("Responsável atualizado.");await onRefresh(); };
  const createTask = async () => { if (!task.trim()) return; await api(`/api/admin/leads/${lead.id}/activities`,{method:"POST",body:JSON.stringify({title:task})});setTask("");setNotice("Tarefa criada.");await onRefresh(); };
  const createCheckout = async () => {
    const offer = editions.find((edition) => edition.id === lead.edition_id);
    if (!offer) { setNotice("Não há lote ativo para esta edição.");return; }
    try {
      const result = await api<{checkoutId:string;status:string}>(`/api/admin/leads/${lead.id}/checkouts`,{method:"POST",headers:{"Idempotency-Key":crypto.randomUUID()},body:JSON.stringify({editionId:offer.id,priceBatchId:offer.price_batch_id,method,installmentCount:method === "PIX" ? 1 : installmentCount})});
      setNotice(`Checkout ${result.checkoutId} reservado e em processamento.`);await onRefresh();
    } catch (reason) { setNotice(reason instanceof Error ? reason.message : "Não foi possível criar o checkout."); }
  };
  return <div className="fixed inset-0 z-50 flex justify-end bg-black/45" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}>
    <aside className="h-full w-full max-w-2xl overflow-y-auto bg-white shadow-2xl">
      <div className="sticky top-0 z-10 flex items-start justify-between border-b border-black/10 bg-white px-6 py-5"><div><p className="text-[9px] uppercase tracking-[0.2em] text-[#2E8E8E]">Ficha do lead</p><h2 className="serif mt-2 text-3xl">{String(lead.name)}</h2></div><button onClick={onClose} aria-label="Fechar" className="p-2"><X/></button></div>
      <div className="space-y-9 p-6">
        <section className="grid gap-4 border-b border-black/10 pb-7 sm:grid-cols-2"><Info label="E-mail" value={lead.email}/><Info label="WhatsApp" value={lead.phone}/><Info label="Empresa" value={lead.company}/><Info label="Cidade" value={lead.city_state}/><Info label="Edição" value={lead.edition_name}/><Info label="Etapa atual" value={stageLabel(String(lead.stage))}/></section>
        <section><h3 className="mb-3 text-[10px] uppercase tracking-[0.2em] text-black/45">Mover no pipeline</h3><div className="flex flex-wrap gap-2">{stages.filter((stage) => stage !== lead.stage && canManuallyTransition(lead.stage as Stage,stage)).map((stage) => <button key={stage} onClick={() => onTransition(stage)} className="border border-black/15 px-3 py-2 text-[9px] uppercase tracking-[0.12em] hover:border-[#7A2535] hover:text-[#7A2535]">{stageLabel(stage)}</button>)}</div></section>
        {notice && <div className="border border-[#2E8E8E]/30 bg-[#F7F4EE] p-3 text-xs leading-relaxed text-[#0A2B28] break-all">{notice}</div>}
        <section className="grid gap-4 border-y border-black/10 py-6 md:grid-cols-2">
          <div><h3 className="mb-3 text-[10px] uppercase tracking-[0.2em] text-black/45">Responsável</h3><div className="flex gap-2"><select value={assignee} onChange={(event) => setAssignee(event.target.value)} className="min-w-0 flex-1 border border-black/15 bg-white px-3 py-2 text-xs"><option value="">Selecionar</option>{users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}</select><button onClick={assign} className="bg-[#191010] px-3 py-2 text-[9px] uppercase tracking-[0.12em] text-white">Atribuir</button></div></div>
          <div><h3 className="mb-3 text-[10px] uppercase tracking-[0.2em] text-black/45">Nova tarefa</h3><div className="flex gap-2"><input value={task} onChange={(event) => setTask(event.target.value)} placeholder="Ex.: Retornar amanhã" className="min-w-0 flex-1 border border-black/15 px-3 py-2 text-xs"/><button onClick={createTask} className="bg-[#191010] px-3 py-2 text-[9px] uppercase tracking-[0.12em] text-white">Criar</button></div></div>
        </section>
        <section className="border border-[#7A2535]/25 bg-[#7A2535]/[0.04] p-5"><h3 className="text-[10px] uppercase tracking-[0.2em] text-[#7A2535]">Checkout autorizado</h3><p className="mt-2 text-xs text-black/55">Disponível somente para gestores e administradores quando o lead estiver qualificado. A cobrança e o envio são processados em segundo plano.</p><div className="mt-4 flex flex-wrap gap-2"><select value={method} onChange={(event) => { const next = event.target.value as "PIX"|"CREDIT_CARD";setMethod(next);if (next === "PIX") setInstallmentCount(1); }} className="border border-black/15 bg-white px-3 py-2 text-xs"><option value="PIX">Pix</option><option value="CREDIT_CARD">Cartão</option></select>{method === "CREDIT_CARD" && <select aria-label="Parcelas" value={installmentCount} onChange={(event) => setInstallmentCount(Number(event.target.value))} className="border border-black/15 bg-white px-3 py-2 text-xs">{Array.from({length:Math.max(1,editions.find((edition) => edition.id === lead.edition_id)?.installment_count ?? 1)},(_,index) => index + 1).map((count) => <option key={count} value={count}>{count}x</option>)}</select>}<button onClick={createCheckout} disabled={lead.stage !== "QUALIFICADO"} className="bg-[#7A2535] px-4 py-2 text-[9px] uppercase tracking-[0.12em] text-white disabled:cursor-not-allowed disabled:opacity-35">Criar checkout</button></div></section>
        <Timeline title="Timeline" rows={detail.history} primary="to_stage" secondary="reason"/>
        <Timeline title="Tarefas e atividades" rows={detail.activities} primary="title" secondary="body"/>
        <Timeline title="Conversas" rows={detail.conversations} primary="channel" secondary="external_id"/>
        <Timeline title="Pagamentos" rows={detail.checkouts} primary="status" secondary="url"/>
        <Timeline title="Respostas da qualificação" rows={detail.answers.map((row) => ({...row,answers_json:prettyJson(row.answers_json)}))} primary="answers_json"/>
      </div>
    </aside>
  </div>;
}

function Info({label,value}:{label:string;value:unknown}) { return <div><div className="text-[8px] uppercase tracking-[0.2em] text-black/40">{label}</div><div className="mt-1 text-sm">{value ? String(value) : "—"}</div></div>; }
function Timeline({title,rows,primary,secondary}:{title:string;rows:Array<Record<string,unknown>>;primary:string;secondary?:string}) { return <section><h3 className="mb-4 text-[10px] uppercase tracking-[0.2em] text-black/45">{title}</h3>{rows.length ? <div className="border-l border-[#7A2535]/25 pl-5">{rows.map((row,index) => <div key={String(row.id ?? index)} className="relative pb-5 before:absolute before:-left-[23px] before:top-1 before:size-[5px] before:rounded-full before:bg-[#7A2535]"><div className="text-sm font-medium whitespace-pre-wrap">{String(row[primary] ?? "—")}</div>{secondary && row[secondary] ? <div className="mt-1 text-xs leading-relaxed text-black/55">{String(row[secondary])}</div> : null}<div className="mt-1 text-[9px] uppercase tracking-[0.12em] text-black/35">{row.created_at ? new Date(String(row.created_at)).toLocaleString("pt-BR") : ""}</div></div>)}</div> : <p className="text-sm text-black/35">Nenhum registro.</p>}</section>; }
function prettyJson(value: unknown) { try { return JSON.stringify(JSON.parse(String(value)),null,2); } catch { return String(value ?? ""); } }
