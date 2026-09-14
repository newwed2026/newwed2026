# Matriz de testes

| Área | Cenário | Comando/suíte | Estado |
|---|---|---|---|
| Tipos Cloudflare | bindings e tipos gerados em checkout limpo | `npm run cf:types` | aprovado 2026-09-14 |
| Qualidade | lint sem erros | `npm run lint` | aprovado 2026-09-14 |
| Tipos | TypeScript após `cf:types` | `npm run typecheck` | aprovado 2026-09-14 |
| Domínio | pipeline, checkout, Asaas e validações condicionais | `npm test` | 47/47 em 2026-09-14 |
| Build | bundle vinext/Workers | `npm run build` | aprovado 2026-09-14 |
| Visual | 11 páginas × 3 viewports, baselines macOS/Linux | `npm run test:visual` | 33/33 local e CI `34849879987` em 2026-09-14 |
| Dependências | produção sem vulnerabilidades | `npm audit --omit=dev` | 0 em 2026-09-14 |
| Migration | aplicação inicial e repetição segura | `npm run test:d1:wave2` | `0000`–`0003` aplicadas; segunda execução sem pendências em 2026-09-14 |
| Persistência | defaults, FKs, deduplicação e concorrência de pipeline | D1 local isolado | aprovado em 2026-09-14 |
| Checkout | contrato, deduplicação, última vaga, expiração e cancelamento | unitários + D1 local | aprovado em 2026-09-14 |
| Asaas | payload Pix/cartão, recuperação, parcelas, cancelamento, estorno e ordem | unitários + D1 local | aprovado em 2026-09-14; runtime Workers na Onda 5 |
| Inbox | claim/release, resposta, opt-out e exclusão mútua | integração Workers | Onda 3 |
| Agente | histórico, resumo, handoff e fallback | integração Workers | Onda 3 |
| Confirmação | evento duplicado gera uma notificação e um e-mail | integração Workers | Onda 4 |
| E2E | UTM até `PAGO` e confirmação | suíte E2E Workers | Onda 5 |
| Permissões | vendedor/gestor/admin e qualificação humana | suíte E2E Workers | Onda 5 |

Resultados completos de cada execução pertencem ao checkpoint da onda. Falhas extensas não devem ser copiadas para este arquivo.
