# Status de execução

Atualizado em: 2026-09-14

## Estado geral

- Onda atual: 0 — Controle, limpeza e CI.
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

## Em andamento

- Fontes permanentes de contexto e protocolo de retomada.
- Remoção das referências e do gerador de migração Base44.
- Correção de imports de imagens incompatíveis com tipos limpos do vinext/Vite.
- Estabilização dos testes visuais após hidratação.

## Próximas ações

1. Executar gate completo da Onda 0.
2. Corrigir qualquer regressão sem atualizar baselines por conveniência.
3. Registrar `CP-00`, commit e resultado do CI remoto quando disponível.
4. Iniciar Onda 1 em branch própria e aplicar uma única migration de domínio.

## Riscos e bloqueios atuais

- Os IDs D1 em Wrangler são marcadores; migrations remotas não podem ser aplicadas.
- Meta, Asaas, OpenAI e e-mail dependem de contas, tokens e aprovações externas.
- Nenhum envio, cobrança ou deploy real está autorizado.

## Regra de atualização

Manter este arquivo conciso. Detalhes encerrados pertencem aos checkpoints e decisões permanentes a `DECISIONS.md`.
