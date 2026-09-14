# Configuração externa

Este documento separa o que já está implementado do que precisa ser provisionado fora do código. Use recursos independentes em `staging` e `production`. Nunca copie tokens, dados pessoais ou payloads reais para commits, logs ou checkpoints.

## Cloudflare

- Criar D1, R2, Queue principal e DLQ com os nomes documentados em `docs/DEPLOYMENT.md`.
- Trocar os UUIDs marcadores dos dois arquivos Wrangler e manter app e consumer apontando para o mesmo D1 e a mesma Queue em cada ambiente.
- Configurar Access para `/admin/*` e `/api/admin/*`; preencher `ACCESS_TEAM_DOMAIN` e `ACCESS_AUD`.
- Criar Turnstile para os domínios públicos; preencher `TURNSTILE_SITE_KEY` e cadastrar `TURNSTILE_SECRET_KEY` como secret.
- Habilitar o Email Service, verificar o remetente e substituir a allowlist por endereços internos aprovados. O responsável pelo lead precisa ser aceito pelo binding; gestores/admins são o fallback.
- Confirmar logs, traces, cron de cinco minutos, retry da Queue e encaminhamento final à DLQ.
- Cadastrar os secrets `OPENAI_API_KEY`, `META_APP_SECRET`, `META_ACCESS_TOKEN`, `META_VERIFY_TOKEN`, `META_PHONE_NUMBER_ID`, `ASAAS_API_KEY`, `ASAAS_WEBHOOK_TOKEN` e `TURNSTILE_SECRET_KEY` nos Workers que os consomem.
- Manter `ALLOW_LOCAL_ACCESS=false` fora do ambiente local.

## Meta WhatsApp

- Concluir verificação da empresa, WABA, número e app.
- Emitir token permanente com somente as permissões necessárias e armazená-lo como secret.
- Configurar o webhook HTTPS, o verify token e a assinatura por `META_APP_SECRET`.
- Aprovar o template `checkout_famtour` e conferir idioma e variáveis na mesma ordem usada pelo código.
- Validar opt-out, resposta manual e janela de atendimento usando apenas contato sintético autorizado.

## OpenAI

- Criar projeto próprio para o produto, chave restrita e orçamento/alertas.
- Definir `OPENAI_MODEL` por ambiente. O código mantém `store:false`; o histórico autoritativo fica no D1.
- Medir qualidade, latência e custo no piloto antes de congelar o modelo de produção.

## Asaas

- Criar conta sandbox e depois habilitar a conta de produção.
- Habilitar Pix e cartão, revisar preços e parcelamento máximo de cada edição.
- Cadastrar chave e token de webhook como secrets distintos por ambiente.
- Configurar o webhook para cobrança recebida/confirmada, vencida, cancelada e estornada.
- Executar a conciliação sandbox com `externalReference`, parcelas e eventos repetidos/fora de ordem antes do piloto.

## Operação

- Cadastrar usuários, papéis, responsáveis e gestores/admins de fallback.
- Definir responsáveis por edição, prioridades/tarefas, motivos comerciais e política de `NUTRICAO`.
- Aprovar remetente, destinatários de confirmação e política de suporte/handoff.
- Selecionar exatamente uma edição para o piloto e registrar capacidade, lote, preço e limite de parcelas.

## Gate seguro

Execute `npm run preflight:launch -- staging` depois de substituir os IDs marcadores. O comando só verifica configuração estática e não lê nem imprime secrets. A aprovação desse comando não substitui os gates manuais acima.
