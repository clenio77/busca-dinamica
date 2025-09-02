# Sprint 06 — Deploy Contínuo na Vercel (BMAD)

## B — Background
Automatizar o deploy de produção via GitHub Actions para a Vercel.

## M — Metas
- Um push na `master` gera deploy de produção automaticamente.

## A — Ações
- [x] Criar workflow `.github/workflows/vercel-deploy.yml` usando `amondnet/vercel-action`.
- [ ] Configurar secrets no repositório: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.
- [ ] Validar que o deploy roda em um push.

## D — Definição de Pronto (DoD)
- Workflow executa com sucesso e publica na Vercel em produção.

## Critérios de Aceite
- Commits em `master` resultam em novo deploy disponível no domínio configurado.

## Estimativa
- 1–2h.
