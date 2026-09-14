# Arquitetura da New Wed Platform

## Limites do sistema

O projeto é uma aplicação única em Next.js App Router executada por vinext no Cloudflare Workers. As páginas institucionais e FAMTOUR têm componentes separados para impedir que uma refatoração compartilhada altere pixels. Apenas estilos e recursos comprovadamente idênticos são compartilhados.

- `/` e rotas institucionais: baseline do `new-wed-group`.
- `/famtour`: baseline do `wed-fam-memories`.
- `/admin`: aplicação comercial protegida pelo Cloudflare Access.
- `/api/public`: entrada pública com Turnstile, validação e idempotência.
- `/api/admin`: operações autenticadas e auditadas.
- `/api/webhooks`: entradas assinadas e deduplicadas de Meta e Asaas.
- `workers/events.ts`: consumidor de Queue e reconciliação agendada.

## Persistência e confiabilidade

D1 é a fonte de verdade. O schema Drizzle possui catálogo, disponibilidade, leads, atribuições, pipeline, atividades, conversas, mensagens, faturamento, usuários, papéis, auditoria, idempotência e outbox. As migrations são versionadas em `migrations/`.

O formulário grava o lead e um evento de outbox antes de tentar publicar na Queue. Se a publicação falhar, o agendamento do worker tenta novamente. Webhooks usam uma chave única por provedor/evento. Eventos financeiros confirmados não são rebaixados por eventos atrasados.

## Segurança

- Segredos existem somente como Workers Secrets ou `.dev.vars` ignorado pelo Git.
- O JWT do Cloudflare Access é validado com o JWKS do domínio da equipe.
- Papéis: `admin`, `gestor` e `vendedor`.
- Checkout requer `admin` ou `gestor` e lead em `QUALIFICADO`.
- Asaas usa token próprio de webhook; Meta usa HMAC SHA-256.
- O agente recebe catálogo e disponibilidade lidos no servidor e não possui ferramenta de escrita financeira.
- Atendimento humano pausa o agente, e opt-out é persistido.

## Paridade visual

As 33 imagens em `tests/visual/baselines` foram capturadas dos servidores originais em 390×844, 768×1024 e 1440×900. Anton, Cormorant Garamond e DM Sans são empacotadas no build para impedir variações causadas pela rede. O teste desliga animações, força imagens lazy a carregar e exige zero pixels diferentes na plataforma de captura. No runner Linux, dimensões continuam exatas e a comparação usa dois limites medidos contra as mesmas páginas: até 2,5% de pixels após ignorar antialiasing e até 0,8% de erro médio em blocos 4×4. O segundo limite continua detectando mudanças estruturais ou de cor que a tolerância de rasterização poderia esconder. Falhas remotas preservam imagem atual, esperada e diff como artefato. Atualizar baselines é uma ação deliberada com `npm run baseline:capture`, nunca parte automática do CI.
