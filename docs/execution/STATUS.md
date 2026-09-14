# Status de execução

Atualizado em: 2026-09-14

## Estado geral

- Onda atual: 1 concluída localmente; integração e CI remoto pendentes.
- Branch ativa: `codex/wave-1-domain-state`.
- Base: `origin/main` em `a0450c3`.
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

## Onda 1 concluída localmente

- Migration `0002_nappy_tag.sql` adiciona estados, parcelamento, erros, timestamps, conversa e notificações.
- Checkout possui máquina técnica explícita e eixos financeiro e de envio separados.
- Conversa possui modo `AGENT`/`HUMAN`, claim/release, pausa, erro e resumo.
- Mensagem de checkout fica vinculada à cobrança; parcelas possuem identificador, número e vencimento.
- Notificações e destinatários possuem deduplicação no banco.
- Etapas financeiras não podem ser aplicadas pela API manual.
- `PERDIDO`/`CANCELADO` exigem motivo; `NUTRICAO` cria próxima ação com vencimento.
- Atualização otimista evita histórico e auditoria falsos em concorrência.
- Gate local aprovado: migration repetível, 31 unitários, build, 33 visuais e auditoria.

## Próximas ações

1. Integrar a Onda 1 em `main` e confirmar o CI remoto.
2. Iniciar Onda 2 com reserva e criação assíncrona de checkout via outbox/Queue.
3. Implementar idempotência Asaas por `externalReference` e envio somente após `READY`.

## Riscos e bloqueios atuais

- Os IDs D1 em Wrangler são marcadores; migrations remotas não podem ser aplicadas.
- Meta, Asaas, OpenAI e e-mail dependem de contas, tokens e aprovações externas.
- Nenhum envio, cobrança ou deploy real está autorizado.

## Regra de atualização

Manter este arquivo conciso. Detalhes encerrados pertencem aos checkpoints e decisões permanentes a `DECISIONS.md`.
