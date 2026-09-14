# Status de execução

Atualizado em: 2026-09-14

## Estado geral

- Onda atual: 3 concluída localmente; integração e CI remoto pendentes.
- Branch ativa: `codex/wave-3-agent-inbox`.
- Base: `main` em `ad13c7f`.
- Dados legados: inexistentes; o projeto começa vazio.
- Ambientes externos: não configurados/autorizados nesta execução.

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

## Onda 3 concluída localmente

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

## Próximas ações

1. Integrar a Onda 3 em `main` e confirmar o CI remoto.
2. Iniciar Onda 4 por filtros/tarefas/relatórios e central de notificações.
3. Ligar confirmação de `PAGO` ao dashboard e ao outbox de e-mail com deduplicação.

## Riscos e bloqueios atuais

- Os IDs D1 em Wrangler são marcadores; migrations remotas não podem ser aplicadas.
- Meta, Asaas, OpenAI e e-mail dependem de contas, tokens e aprovações externas.
- Nenhum envio, cobrança ou deploy real está autorizado.

## Regra de atualização

Manter este arquivo conciso. Detalhes encerrados pertencem aos checkpoints e decisões permanentes a `DECISIONS.md`.
