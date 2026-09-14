# Registro de decisões

## D-001 — Projeto sem legado

O projeto começa vazio. Não haverá migração, conciliação nem compatibilidade Base44.

## D-002 — Qualificação e checkout humanos

Somente um usuário humano pode mover um lead para `QUALIFICADO` e autorizar checkout. O agente pode atender, coletar contexto e gerar handoff, mas não concluir essas ações.

## D-003 — Máquina de checkout

Estados principais: `CREATING → READY → SEND_PENDING → SENT → PENDING → PAID`. Saídas: `FAILED`, `OVERDUE`, `CANCELLED` e `REFUNDED`. A cobrança criada nunca equivale a pagamento.

## D-004 — Pagamentos

Pix é cobrança única. Cartão aceita de 1 até o limite configurado por edição, inicialmente 12. A aprovação inicial do cartão promove o lead a `PAGO`; parcelas posteriores seguem em conciliação financeira.

## D-005 — Inbox v1

A primeira versão oferece lista, busca, transcript, resposta manual, claim/release e falhas. Usa polling de 5 segundos com a página ativa e 30 segundos em segundo plano. WebSocket e roteamento avançado ficam fora da v1.

## D-006 — Contexto do agente

D1 é a fonte de contexto. A OpenAI recebe resumo, 12 mensagens recentes, lead, edição e catálogo com `store:false`. A resposta é estruturada como `{reply, confidence, handoff, reason}`.

## D-007 — Handoff obrigatório

Baixa confiança, intenção de compra, reclamação, pedido humano e falha da OpenAI pausam o agente e encaminham a conversa a uma pessoa.

## D-008 — Confirmação da equipe

No primeiro `PAGO`, criar uma notificação interna e um e-mail. O destinatário primário é o responsável pelo lead; sem responsável, gestores e administradores recebem. Deduplicação impede repetição.

## D-009 — E-mail

Usar o binding nativo Cloudflare `EMAIL`, com HTML e texto, envio por outbox, retry e destinatários/remetentes restritos na configuração.

## D-010 — Serviços externos

Testes automatizados mockam apenas Meta, OpenAI, Asaas e e-mail. Nenhuma mensagem, cobrança, e-mail, deploy ou tráfego real ocorre sem configuração e autorização específicas.

## D-011 — Testes Workers atuais

Usar `@cloudflare/vitest-plugin`, integração oficial vigente para Vitest 5 e runtime Workers, em vez do pacote legado `@cloudflare/vitest-pool-workers`.
