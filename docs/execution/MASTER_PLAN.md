# Plano mestre — New Wed FAMTOUR

## Objetivo e fluxo de aceite

Entregar uma plataforma única para site, FAMTOUR, CRM, WhatsApp e pagamento:

`visita → formulário com UTMs → lead → atendimento → qualificação humana → checkout → cobrança Asaas → confirmação por webhook → PAGO → notificação interna e e-mail`.

O pipeline comercial é `NOVO → EM_ATENDIMENTO → QUALIFICADO → CHECKOUT_ENVIADO → AGUARDANDO_PAGAMENTO → PAGO`, com saídas `NUTRICAO`, `PERDIDO` e `CANCELADO`.

O projeto começa vazio. Não existe importação, sincronização ou dependência da Base44.

## Ondas

### Onda 0 — Controle, limpeza e CI

- Criar fontes permanentes de contexto e protocolo de retomada.
- Remover todo resíduo de migração Base44.
- Corrigir o contrato de assets do vinext/Vite e avisos relevantes de hidratação.
- Aprovar lint, tipos, unitários, build, auditoria e 33 testes visuais.

### Onda 1 — Estados e confiabilidade do domínio

- Persistir a máquina de checkout, parcelamento, erros, envio e timestamps.
- Relacionar cobrança, mensagem e parcelas.
- Persistir modo `AGENT`/`HUMAN`, responsável e claim/release da conversa.
- Criar notificações/destinatários com deduplicação.
- Validar motivo obrigatório em `PERDIDO`/`CANCELADO` e próxima ação em `NUTRICAO`.

### Onda 2 — Checkout e Asaas

- Reservar vaga e gravar checkout/outbox atomicamente; criar cobrança na Queue.
- Recuperar cobrança por `externalReference` antes de criar outra.
- Aceitar Pix único e cartão até o limite da edição, inicialmente 12x.
- Enviar checkout somente após `READY`; atualizar pipeline por aceite/entrega Meta.
- Validar edição, valor e estado em webhook; reprocessar não conciliados.
- Expirar/liberar reservas e proteger a última vaga contra concorrência.

### Onda 3 — Agente e inbox operacional

- APIs e interface de inbox, transcript, resposta, claim e release.
- Polling de 5 segundos ativa e 30 segundos em segundo plano.
- Primeiro atendimento move `NOVO` para `EM_ATENDIMENTO`; só humano qualifica.
- Pausar agente ao assumir; usar resumo, 12 mensagens, lead, edição e catálogo.
- OpenAI com `store:false` e saída `{reply, confidence, handoff, reason}`.
- Compra, reclamação, solicitação humana, baixa confiança ou falha geram handoff.

### Onda 4 — Dashboard, confirmação e observabilidade

- Filtros, tarefas completas, relatórios e central de notificações.
- Primeiro `PAGO` notifica responsável; gestores/admins são fallback.
- E-mail HTML/texto via binding `EMAIL`, outbox, retry e deduplicação.
- `requestId`, correlação, rate limits e painel de falhas externas.

### Onda 5 — Testes ponta a ponta e lançamento

- Testar no runtime Workers com bindings locais reais.
- Mockar somente Meta, OpenAI, Asaas e e-mail nos automatizados.
- Cobrir fluxo completo, duplicidade, ordem, concorrência, retry, opt-out e RBAC.
- Manter os 33 baselines; preparar staging, sandbox e piloto de uma edição.
- Deploy e tráfego externo dependem de configuração e autorização específicas.

## Contratos HTTP principais

- `POST /api/admin/leads/:id/checkouts` → `202`, `method`, `installmentCount`.
- `GET /api/admin/checkouts/:id` → estado técnico, financeiro, envio e erro.
- `POST /api/admin/checkouts/:id/send` → envio/reenvio idempotente.
- `POST /api/admin/checkouts/:id/mark-delivered` → exceção manual auditada.
- `GET /api/admin/conversations` e `GET /api/admin/conversations/:id`.
- `POST /api/admin/conversations/:id/claim|release|messages`.
- `GET /api/admin/notifications` e `PATCH /api/admin/notifications/:id/read`.
- `GET /api/admin/reports/funnel`.

## Critério final

O fluxo ponta a ponta precisa ser reproduzível em testes locais, seguro contra repetição e concorrência, observável e pronto para configuração externa. Nenhuma criação de cobrança é confirmação de pagamento; apenas eventos conciliados promovem o lead a `PAGO`.
