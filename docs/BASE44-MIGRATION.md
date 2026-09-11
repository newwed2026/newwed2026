# Migração Base44

## Ensaio

Exporte leads, respostas e histórico para CSV ou JSON e preserve o arquivo original em armazenamento restrito. Gere o lote determinístico:

```bash
npm run base44:prepare -- --input /caminho/export.json --output tmp/base44-import.sql
```

O comando cria um SQL com permissão local restrita e um relatório sem PII contendo contagens e SHA-256 da origem e do lote. Registros sem nome, e-mail ou telefone entram em `rejected`; duplicidades do mesmo e-mail+telefone entram em `duplicates`.

Execute primeiro em staging, confira contagem por estágio/edição, duplicidades, campos obrigatórios e amostras. Aplique o mesmo export novamente para provar idempotência por `source_system + external_id`.

## Corte

1. Registrar o checksum do ensaio aceito.
2. Definir a janela de corte e tornar Base44 somente leitura.
3. Fazer exportação final e preparar novo lote.
4. Importar apenas registros ainda ausentes; o SQL é idempotente.
5. Comparar contagens e checksums.
6. Validar formulário, pipeline, Meta e Asaas no novo sistema.
7. Desativar a entrada antiga somente depois do aceite.
8. Manter exportação original criptografada para auditoria e o sistema antigo sem escrita durante o rollback.
