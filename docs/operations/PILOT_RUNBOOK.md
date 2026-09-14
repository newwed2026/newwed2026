# Runbook do piloto FAMTOUR

O piloto usa uma única edição e começa somente após staging aprovado. Mensagens, e-mails e cobranças externas exigem autorização específica para a janela do piloto.

## Preparação

1. Congelar edição, lote, valor, capacidade e limite de cartão; Pix permanece em parcela única.
2. Designar responsável primário, gestor de fallback e plantão técnico.
3. Usar um contato consentido e identificado para a validação inicial.
4. Confirmar que dashboard, inbox, notificações e painel de falhas estão acessíveis à equipe correta.
5. Confirmar saldo/orçamento e status de Meta, OpenAI, Asaas e Email Service.

## Sequência controlada

1. Capturar um lead com origem/UTMs conhecidas.
2. Verificar `NOVO` e o primeiro atendimento em `EM_ATENDIMENTO`.
3. Assumir a conversa e qualificar manualmente.
4. Criar um checkout e acompanhar `CREATING → READY`.
5. Enviar uma única vez e conferir aceite/entrega antes de `AGUARDANDO_PAGAMENTO`.
6. Concluir pagamento sandbox/real conforme a autorização e conferir `PAGO` exclusivamente por webhook.
7. Confirmar uma notificação interna e um e-mail para o responsável/fallback.
8. Conciliar cobrança, parcela, reserva/venda e auditoria usando os IDs técnicos.

## Monitoramento e encerramento

- Revisar falhas de Queue/DLQ, Meta, OpenAI, Asaas e e-mail durante toda a janela.
- Pausar novos checkouts diante de qualquer critério de interrupção do checklist de lançamento.
- Ao final, registrar contagens, divergências, custos, handoffs e decisões de correção.
- Remover dados sintéticos e configurações temporárias; não apagar evidência financeira necessária à conciliação.
- Liberar produção ampla somente com aceite comercial, operacional e técnico registrado.
