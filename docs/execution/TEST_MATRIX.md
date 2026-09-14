# Matriz de testes

| Área | Cenário | Comando/suíte | Estado |
|---|---|---|---|
| Tipos Cloudflare | bindings e tipos gerados em checkout limpo | `npm run cf:types` | pendente Onda 0 |
| Qualidade | lint sem erros | `npm run lint` | pendente Onda 0 |
| Tipos | TypeScript após `cf:types` | `npm run typecheck` | pendente Onda 0 |
| Domínio | pipeline e estados financeiros | `npm test` | pendente Onda 0 |
| Build | bundle vinext/Workers | `npm run build` | pendente Onda 0 |
| Visual | 11 páginas × 3 viewports, zero pixels | `npm run test:visual` | pendente Onda 0 |
| Dependências | produção sem vulnerabilidades | `npm audit --omit=dev` | pendente Onda 0 |
| Migration | aplicação inicial e repetição segura | `npm run db:migrate:local` | Onda 1 |
| Checkout | sucesso, duplicidade, última vaga e falha externa | integração Workers | Onda 2 |
| Asaas | atraso, cancelamento, estorno e ordem de eventos | integração Workers | Onda 2 |
| Inbox | claim/release, resposta, opt-out e exclusão mútua | integração Workers | Onda 3 |
| Agente | histórico, resumo, handoff e fallback | integração Workers | Onda 3 |
| Confirmação | evento duplicado gera uma notificação e um e-mail | integração Workers | Onda 4 |
| E2E | UTM até `PAGO` e confirmação | suíte E2E Workers | Onda 5 |
| Permissões | vendedor/gestor/admin e qualificação humana | suíte E2E Workers | Onda 5 |

Resultados completos de cada execução pertencem ao checkpoint da onda. Falhas extensas não devem ser copiadas para este arquivo.
