# Status de execução

Atualizado em: 2026-09-14

## Estado geral

- Onda atual: 1 — estados e confiabilidade do domínio.
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

## Próximas ações

1. Aplicar uma única migration para estados de checkout, parcelamento, conversa e notificações.
2. Implementar as máquinas de estado e as invariantes de transição manual.
3. Cobrir estados, validações e repetição segura de migrations com testes estreitos.

## Riscos e bloqueios atuais

- Os IDs D1 em Wrangler são marcadores; migrations remotas não podem ser aplicadas.
- Meta, Asaas, OpenAI e e-mail dependem de contas, tokens e aprovações externas.
- Nenhum envio, cobrança ou deploy real está autorizado.

## Regra de atualização

Manter este arquivo conciso. Detalhes encerrados pertencem aos checkpoints e decisões permanentes a `DECISIONS.md`.
