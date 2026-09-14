# Checklist de lançamento

## 1. Antes do staging

- [ ] CI de `main` aprovado no commit candidato.
- [ ] Recursos e secrets de staging conferidos conforme `EXTERNAL_CONFIGURATION.md`.
- [ ] `npm run preflight:launch -- staging` aprovado.
- [ ] Backup/export lógico do D1 e procedimento de rollback definidos.
- [ ] Dados sintéticos identificados como `VALIDACAO-<timestamp>`.
- [ ] Janela e responsável pela validação definidos.
- [ ] Autorização específica registrada antes de qualquer mensagem, e-mail ou cobrança sandbox.

## 2. Publicação de staging

1. Aplicar migrations `0000`–`0005` no D1 de staging e confirmar ausência de pendências.
2. Publicar primeiro o consumer de eventos e depois a aplicação.
3. Confirmar HTTP, Access, formulário, D1, R2, Queue, DLQ, cron, logs e traces.
4. Executar o fluxo sintético completo em sandbox: UTM → lead → atendimento → qualificação humana → checkout → entrega → pagamento → `PAGO` → confirmação.
5. Repetir webhook e enviá-lo fora de ordem; confirmar uma única transição, notificação e mensagem de e-mail.
6. Conferir liberação de vaga em cancelamento/expiração, handoff, opt-out, rate limit e permissões.

## 3. Evidências de staging

Registrar no checkpoint, sem dados pessoais ou secretos:

- commit implantado e execução do CI;
- horário e ambiente;
- IDs sintéticos de lead, conversa, checkout, cobrança e webhook;
- migrations aplicadas;
- resultados dos smokes e do fluxo sandbox;
- contagens de Queue/DLQ, falhas operacionais e screenshots úteis;
- limpeza dos dados e gatilhos temporários.

## 4. Piloto de uma edição

- [ ] Edição, lote, preço, capacidade e parcelamento aprovados.
- [ ] Equipe treinada em inbox, claim/release, qualificação, checkout e exceções.
- [ ] Templates Meta e destinatários de e-mail aprovados.
- [ ] Orçamento OpenAI e alertas dos provedores ativos.
- [ ] Critérios de interrupção definidos: duplicidade financeira, perda de mensagens, ausência de confirmação, inconsistência de vagas ou falha de segurança.
- [ ] Autorização específica de piloto registrada.

Durante o piloto, acompanhar conversão, handoffs, divergências financeiras, falhas de outbox/DLQ, custos e tempo de atendimento. Produção ampla só é liberada depois da conciliação da edição piloto.

## 5. Rollback

- Suspender novos checkouts e o agente sem apagar dados.
- Preservar webhooks/outbox para reconciliação; nunca reaplicar pagamento manualmente sem auditoria.
- Reverter os Workers para o commit anterior compatível com as migrations já aplicadas.
- Manter a equipe em modo humano até a causa ser corrigida e revalidada em staging.
