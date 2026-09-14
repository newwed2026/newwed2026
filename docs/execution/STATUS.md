# Status de execução

Atualizado em: 2026-09-14

## Estado geral

- Onda atual: 0 concluída localmente; integração e CI remoto pendentes.
- Branch ativa: `codex/wave-0-ci-foundation`.
- Base: `origin/main` em `85e8717`.
- Dados legados: inexistentes; o projeto começa vazio.
- Ambientes externos: não configurados/autorizados nesta execução.

## Concluído antes das ondas

- Site institucional, landing FAMTOUR e formulário existentes.
- Schema D1 inicial com catálogo, leads, pipeline, atividades, conversas, mensagens, pagamentos, auditoria, idempotência e outbox.
- Cloudflare Access, Turnstile, Meta, OpenAI e Asaas possuem integrações iniciais.
- Dashboard comercial básico existente.
- 20 testes unitários e 33 baselines visuais existentes.

## Onda 0 concluída localmente

- Fontes permanentes de contexto e protocolo de retomada implantados.
- Referências e gerador de migração Base44 removidos.
- Contrato nativo `StaticImageData` estabilizado ao remover a declaração conflitante.
- Geração de tipos isolada de `.dev.vars` e TypeScript isolado de artefatos gerados.
- Modo de movimento reduzido estabiliza o carrossel e elimina mutações pré-hidratação.
- Gate local aprovado: lint, tipos, 20 unitários, build, 33 visuais e auditoria.

## Próximas ações

1. Integrar a Onda 0 em `main`, publicar e acompanhar o CI remoto.
2. Registrar a evidência remota no checkpoint se houver falha ou divergência.
3. Iniciar Onda 1 em branch própria e aplicar uma única migration de domínio.

## Riscos e bloqueios atuais

- Os IDs D1 em Wrangler são marcadores; migrations remotas não podem ser aplicadas.
- Meta, Asaas, OpenAI e e-mail dependem de contas, tokens e aprovações externas.
- Nenhum envio, cobrança ou deploy real está autorizado.

## Regra de atualização

Manter este arquivo conciso. Detalhes encerrados pertencem aos checkpoints e decisões permanentes a `DECISIONS.md`.
