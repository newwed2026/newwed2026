# Protocolo de execução contínua

Estas regras se aplicam a qualquer trabalho neste repositório.

## Retomada obrigatória

Antes de alterar código:

1. Leia `docs/execution/STATUS.md` e `docs/execution/DECISIONS.md` por inteiro.
2. Leia o checkpoint mais recente em `docs/execution/checkpoints/`.
3. Confira `git status --short --branch`, `git rev-parse --short HEAD` e as migrations existentes.
4. Preserve alterações do usuário e nunca exponha segredos ou dados pessoais.

## Forma de trabalhar

- Trabalhe em uma fatia vertical por vez, em `codex/wave-<n>-<tema>`.
- Mantenha apenas uma onda com alteração de schema ativa.
- Rode testes estreitos durante a implementação e o gate completo ao concluir a onda.
- Cada onda termina com código validado, documentação atualizada, commit e checkpoint recuperável.
- Não reanalise o repositório inteiro quando `STATUS.md` e o checkpoint responderem à dúvida.
- Registre decisões definitivas em `DECISIONS.md`; não registre exploração, hipóteses descartadas ou logs extensos.
- Nunca registre tokens, chaves, payloads reais ou dados pessoais. Segredos pertencem a Workers Secrets ou `.dev.vars` ignorado.
- Não envie WhatsApp, e-mail, cobrança, deploy ou tráfego de produção sem autorização específica.

## Controle de contexto

Quando o contexto estiver grande:

1. Atualize `STATUS.md` mantendo-o abaixo de aproximadamente 150 linhas.
2. Crie ou complete o checkpoint da onda com commit, migrations, testes, bloqueios e próxima ação.
3. Preserve objetivo, decisões, IDs não secretos, arquivos alterados e resultados dos gates.
4. Descarte logs, diffs já commitados e caminhos de investigação encerrados.
5. Retome a partir do checkpoint, sem repetir trabalho concluído.

## Gate padrão

Execute, nesta ordem:

```bash
npm run cf:types
npm run lint
npm run typecheck
npm test
npm run build
npm run test:visual
npm audit --omit=dev
```

Quando uma onda tocar o runtime Workers ou persistência, inclua migrations locais e os testes de integração correspondentes descritos em `docs/execution/TEST_MATRIX.md`.
