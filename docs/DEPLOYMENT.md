# Deploy e configuração Cloudflare

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
