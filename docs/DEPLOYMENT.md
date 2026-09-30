# Deploy e configuração Cloudflare

## Publicação inicial do site — 2026-09-30

O usuário autorizou publicar o repositório `newwed2026/newwed2026` na conta New Wed e escolheu manter R2 desabilitado nesta primeira publicação.

- Conta: `41245f76790f4922487ec395c9e3bcec`.
- Worker: `new-wed-platform-production`.
- D1: `new-wed-platform-production`, ID `2263d378-59c9-4e5a-8d9b-a6e0140767dd`.
- Queue: `new-wed-events-production`, ID `8e18d7f59d554826bb425c633c6441fa`.
- Build no Workers Builds: `npm run build:production`.
- Deploy no Workers Builds: `npm run db:migrate:production && npm run deploy:production`.

O ambiente é selecionado no build com `CLOUDFLARE_ENV=production`; o deploy usa a configuração gerada e não recompila no ambiente de desenvolvimento. A migração remota ocorre antes da publicação.

O site usa seus assets empacotados e não depende de uploads R2. O consumidor de eventos, Access, Turnstile e as integrações externas ainda exigem provisionamento próprio. O painel mantém `ALLOW_LOCAL_ACCESS=false`, e o formulário falha de forma segura enquanto Turnstile não estiver configurado. O preflight completo de lançamento comercial continua bloqueado sem R2 e os demais requisitos; esta publicação não representa aceite do piloto comercial.

## Recursos

Crie recursos distintos para `staging` e `production`:

1. D1: `new-wed-platform-<ambiente>`.
2. R2: `new-wed-platform-<ambiente>`.
3. Queue principal `new-wed-events-<ambiente>` e dead-letter queue correspondente.
4. Aplicação Cloudflare Access cobrindo `/admin/*` e `/api/admin/*`.
5. Widget Turnstile para os domínios públicos.

Substitua os UUIDs marcadores em `wrangler.jsonc` e `wrangler.events.jsonc` pelos IDs reais. Gere novamente os tipos com `npm run cf:types`.

## Segredos

Cadastre, sem colocar valores no Git:

```text
OPENAI_API_KEY
META_APP_SECRET
META_ACCESS_TOKEN
META_VERIFY_TOKEN
META_PHONE_NUMBER_ID
ASAAS_API_KEY
ASAAS_WEBHOOK_TOKEN
TURNSTILE_SECRET_KEY
```

Defina `ACCESS_TEAM_DOMAIN`, `ACCESS_AUD`, `TURNSTILE_SITE_KEY`, `OPENAI_MODEL` e o template Meta aprovado nas variáveis do ambiente. O bypass `ALLOW_LOCAL_ACCESS` jamais deve ser habilitado fora do desenvolvimento local. O modelo padrão é `gpt-5-mini` e pode ser trocado sem alterar o código.

## Ordem de publicação

1. Execute o gate completo definido no CI, incluindo os testes D1 e `npm run test:workers`.
2. Aprove `npm run preflight:launch -- staging` e o checklist em `docs/operations/LAUNCH_CHECKLIST.md`.
3. Aplique migrations D1 no staging.
4. Publique o consumidor com `npm run deploy:events -- --env staging`.
5. Publique o app com `npm run deploy -- --env staging`.
6. Cadastre URLs de webhook e execute smoke tests sem tráfego externo até existir autorização específica.
7. Execute a conciliação sandbox e o piloto de uma edição conforme `docs/operations/PILOT_RUNBOOK.md`.
8. Somente após o aceite do piloto, repita o preflight e a publicação em produção.

O repositório não cria recursos nem envia mensagens/pagamentos automaticamente. Essas ações dependem das credenciais e da janela de lançamento aprovadas.

### Domínio institucional

`https://newwed.com.br` e `https://www.newwed.com.br` usam rotas Workers específicas no ambiente production. Os registros A/CNAME existentes e MX/TXT de e-mail permanecem intactos, incluindo o alias mail que depende do apex. Não substituir esses registros por Custom Domains sem separar essa dependência legada. As rotas estão versionadas em `wrangler.jsonc` para os builds automáticos.
