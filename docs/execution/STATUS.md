# Status de execução

Atualizado em: 2026-09-30

## Estado geral

- Onda atual: onda 7, publicação inicial do site na Cloudflare, concluída e validada remotamente.
- Branch operacional: `codex/wave-7-cloudflare-deploy`; ondas 0–6 no repositório `newwed2026/newwed2026`.
- Base da publicação: `origin/main` em `c382d58`.
- Dados legados: inexistentes; o projeto começa vazio.
- Usuário autorizou deploy, conexão GitHub restrita ao repositório, publicação sem R2 e conexão do domínio existente em 2026-09-30.

## Concluído antes das ondas

- Site institucional, landing FAMTOUR e formulário existentes.
- Schema D1 inicial com catálogo, leads, pipeline, atividades, conversas, mensagens, pagamentos, auditoria, idempotência e outbox.
- Cloudflare Access, Turnstile, Meta, OpenAI e Asaas possuem integrações iniciais.
- Dashboard comercial básico existente.
- 20 testes unitários e 33 baselines visuais existentes.

## Onda 0 concluída

- Fontes permanentes de contexto e protocolo de retomada implantados.
- Referências e gerador de migração Base44 removidos.
- Contrato nativo `StaticImageData` estabilizado ao remover a declaração conflitante.
- Geração de tipos isolada de `.dev.vars` e TypeScript isolado de artefatos gerados.
- Modo de movimento reduzido estabiliza o carrossel e elimina mutações pré-hidratação.
- Gate local aprovado: lint, tipos, 20 unitários, build, 33 visuais e auditoria.
- Fontes web foram empacotadas e os 33 baselines passaram a ter variantes macOS e Linux.
- CI remoto definitivo aprovado na execução `34849879987` para `a0450c3`.

## Onda 1 concluída

- Migration `0002_nappy_tag.sql` adiciona estados, parcelamento, erros, timestamps, conversa e notificações.
- Checkout possui máquina técnica explícita e eixos financeiro e de envio separados.
- Conversa possui modo `AGENT`/`HUMAN`, claim/release, pausa, erro e resumo.
- Mensagem de checkout fica vinculada à cobrança; parcelas possuem identificador, número e vencimento.
- Notificações e destinatários possuem deduplicação no banco.
- Etapas financeiras não podem ser aplicadas pela API manual.
- `PERDIDO`/`CANCELADO` exigem motivo; `NUTRICAO` cria próxima ação com vencimento.
- Atualização otimista evita histórico e auditoria falsos em concorrência.
- Gate local aprovado: migration repetível, 31 unitários, build, 33 visuais e auditoria.
- PR `#2` integrada em `main` no commit `32aef27`.
- CI remoto aprovado nas execuções `34851532033` (PR) e `34851855439` (`main`).

## Onda 2 concluída

- Checkout agora reserva vaga, checkout, outbox, idempotência e auditoria atomicamente e retorna `202` em `CREATING`.
- Queue recupera cobrança por `externalReference` antes de criar; falha após o Asaas é retomável sem duplicação.
- Pix é único; cartão respeita o limite da edição e usa `installmentCount` + `totalValue` quando parcelado.
- Parcelas são persistidas e conciliadas individualmente; pagamento não é inferido da criação.
- Envio só ocorre após `READY`; aceite/entrega Meta atualizam checkout e pipeline separadamente.
- Webhooks Asaas são assinados, deduplicados, validados e reprocessados com backoff.
- Expiração e cancelamento liberam a reserva e removem cobranças abertas no Asaas por Queue.
- APIs de detalhe, envio/reenvio e entrega manual auditada foram implementadas.
- Gate local aprovado: migration `0003` repetível, 47 unitários, teste D1, build, 33 visuais e auditoria.
- PR `#3` integrada em `main` no commit `ad13c7f`.
- CI remoto aprovado nas execuções `34855781328` (PR) e `34856140923` (`main`).

## Onda 3 concluída

- Inbox operacional possui lista, busca, modos, filtro de falhas, transcript, resumo e estado do responsável.
- APIs de listar/detalhar, assumir, devolver e responder foram implementadas com auditoria e idempotência.
- Polling usa 5 segundos com a página visível e 30 segundos em segundo plano; WebSocket não foi adicionado.
- Lease D1 bloqueia resposta humana enquanto uma resposta do agente está em voo e pausa o agente no claim.
- Primeiro atendimento do agente ou humano move `NOVO` para `EM_ATENDIMENTO` uma única vez.
- Contexto do agente vem do D1: resumo, 12 mensagens, lead, edição e catálogo; a OpenAI usa `store:false`.
- Saída `{reply, confidence, handoff, reason}` é validada; intenção sensível, baixa confiança e falhas geram handoff.
- Resumos são atualizados por Queue a cada 10 mensagens; opt-out bloqueia agente, release e resposta manual.
- Webhooks Meta usam outbox e IDs por evento/status, sem perder `sent`, `delivered` ou `read`.
- Gate local aprovado: migration `0004` repetível, 58 unitários, teste D1, build, 33 visuais e auditoria.
- PR `#4` integrada em `main` no commit `8a57a9f`.
- CI remoto aprovado nas execuções `34858446009` (PR) e `34858840979` (`main`).

## Onda 4 concluída

- Dashboard possui filtros de etapa, edição, responsável, origem, período e tarefas vencidas.
- Tarefas possuem prazo, responsável, prioridade, conclusão/reabertura e auditoria.
- Relatórios agregam funil, origem, edição, responsável, checkouts e pagamentos.
- Central de notificações oferece leitura/não leitura e polling operacional.
- Primeiro `PAGO` gera uma notificação deduplicada para o responsável ou fallback de gestores/admins.
- E-mail HTML/texto usa binding `EMAIL`, outbox com retry e allowlists de remetente/destinatário.
- `requestId` correlaciona lead, conversa, checkout, webhook, outbox e notificação.
- Rate limits D1 cobrem formulário, resposta manual e checkout; webhooks têm assinatura, deduplicação e limite de payload.
- Painel operacional consolida falhas de Queue, Meta, OpenAI, Asaas e e-mail.
- Gate local aprovado: migration `0005` repetível, 64 unitários, testes D1 das ondas 2–4, build, 33 visuais e auditoria.
- PR `#5` integrada em `main` no commit `4c4069d`.
- CI remoto aprovado nas execuções `34861800501` (PR) e `34862179558` (`main`).

## Onda 5 concluída

- Testes E2E usam o runtime Workers com D1, Queue e R2 reais locais; `.dev.vars` não é carregado.
- Meta, OpenAI, Asaas e e-mail são os únicos serviços mockados nos cenários automatizados.
- Fluxo completo cobre UTM → lead → agente → qualificação humana → checkout → entrega → `PAGO` → confirmação.
- Duplicidade/ordem, última vaga, retry, opt-out, handoff e permissões são exercitados no workerd.
- Runtime revelou e validou a correção do `INSERT` público de lead e da regressão de pagamento por evento atrasado.
- CI agora inclui as três baterias D1 e a suíte Workers.
- Preflight e runbooks documentam configuração externa, staging, rollback e piloto de uma edição.
- Gate local aprovado: 64 unitários, 18 invariantes D1, 6 cenários Workers, build, 33 visuais e auditoria.
- PR `#6` integrada em `main` no commit `0c79d94`.
- CI remoto aprovado nas execuções `34864371156` (PR) e `34864801713` (`main`).

## Próximas ações

1. Provisionar Access, Turnstile e integrações externas para liberar a operação comercial, com autorização específica.

## Onda 6 validada localmente

- A página inicial institucional segue a referência recebida: hero editorial, quatro projetos, números, apresentação de Cindy e chamada final.
- Fundo branco e tons neutros substituem as cores institucionais nessa página; as demais rotas permanecem com o visual existente.
- Uma foto editorial gerada foi adicionada ao projeto para o hero; os cards e a seção sobre usam fotos locais.
- Gate local aprovado: tipos Cloudflare, lint, typecheck, 64 unitários, build, 33 verificações visuais e auditoria sem vulnerabilidades.
- Não houve alteração de schema, envio externo ou deploy.
- Commit de implementação na branch: `127f1f3`.

## Onda 7 publicada

- Conta Cloudflare New Wed: `41245f76790f4922487ec395c9e3bcec`.
- D1 production criado: `2263d378-59c9-4e5a-8d9b-a6e0140767dd`.
- Queue production criada: `8e18d7f59d554826bb425c633c6441fa`.
- R2 production removido por escolha explícita do usuário; assets continuam no build.
- Commit publicado: `e6a6614`; Worker version `07a6ff4d-5a20-4a15-a8ae-40c1572b665c`.
- Workers Build `f96de1e2-3067-4a1d-bb3c-aeee80de073d` aprovado às 16:43 de 2026-09-30 (America/Recife).
- CI GitHub `36767408991` aprovado; site em `https://new-wed-platform-production.royal-leaf-8110.workers.dev`.
- Migrations 0000–0005 confirmadas no console D1; oito páginas públicas responderam HTTP 200 no Chrome.
- Scripts selecionam production no build e publicam o artefato sem recompilar em development.
- Tipos, lint, typecheck, 64 unitários, 18 invariantes D1, 6 cenários Workers, build production, dry-run e 33 visuais aprovados.
- Os dois casos visuais com ERR_EMPTY_RESPONSE passaram na repetição direcionada.
- `fast-uri` atualizado de 3.1.7 para 3.1.8; auditoria de produção sem vulnerabilidades.

- Domínios `newwed.com.br` e `www.newwed.com.br` conectados por rotas Workers, preservando DNS e e-mail existentes.

## Riscos e bloqueios atuais

- Access, Turnstile, Meta, Asaas, OpenAI e e-mail ainda dependem de configuração externa.
- O painel permanece autenticado; inscrições falham de forma segura sem Turnstile.
- O consumidor de eventos não será publicado nesta etapa de hospedagem do site.
- O preflight comercial completo permanece bloqueado sem R2 e os demais requisitos de lançamento.
- Nenhum envio ou cobrança externa foi autorizado.

## Regra de atualização

Manter este arquivo conciso. Detalhes encerrados pertencem aos checkpoints e decisões permanentes a `DECISIONS.md`.
