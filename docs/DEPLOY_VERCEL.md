# Deploy na Vercel — Passo a passo completo

Este guia cobre três formas de deploy:
- A) Deploy pela interface da Vercel (mais simples)
- B) Deploy via GitHub Actions (CD no GitHub)
- C) Deploy via Vercel CLI (local)

A aplicação é um frontend React (Create React App), build estático (diretório `build`). Já existe um `vercel.json` no projeto para facilitar.

## Pré-requisitos
- Conta na Vercel (gratuita)
- Repositório no GitHub: `clenio77/busca-dinamica`
- Node 18+ local (apenas para a opção C)

---

## A) Deploy pela Interface da Vercel
1. Acesse o painel da Vercel e clique em "New Project".
2. Escolha "Import Git Repository" e selecione `clenio77/busca-dinamica`.
3. Nas configurações do projeto:
   - Framework Preset: Create React App (detectado automaticamente)
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Root Directory: raiz do repositório (onde estão `package.json` e `vercel.json`)
4. Variáveis de Ambiente: (opcional) — atualmente não são necessárias.
5. Clique em "Deploy".
6. Após o deploy, salve a URL de produção exibida. A cada push na branch `master`, um novo deploy de produção será gerado automaticamente.

### Domínio personalizado (opcional)
1. No projeto Vercel, vá em Settings > Domains > Add.
2. Adicione seu domínio, por exemplo: `meu-dominio.com`.
3. Configure o DNS no seu provedor:
   - Apex (raiz): A -> `76.76.21.21`
   - Subdomínio `www`: CNAME -> `cname.vercel-dns.com`
4. Aguarde a propagação DNS e verifique o status na Vercel.

---

## B) Deploy via GitHub Actions (CD no GitHub)
Este repositório já possui um workflow de deploy: `.github/workflows/vercel-deploy.yml`.

### 1) Criar secrets no GitHub
No repositório GitHub: Settings > Secrets and variables > Actions > New repository secret.
Crie os seguintes secrets:
- `VERCEL_TOKEN`: token da sua conta Vercel
- `VERCEL_ORG_ID`: ID da sua organização/conta Vercel
- `VERCEL_PROJECT_ID`: ID do projeto Vercel

Como obter:
- Token: Vercel Dashboard > Settings > Tokens (ou CLI: `vercel login` e em seguida `vercel tokens issue`)
- Org ID e Project ID:
  - Pela CLI: `vercel link` (gera `.vercel/project.json` com `orgId` e `projectId`)
  - Pelo Dashboard: Project > Settings > General > Project ID; Account/Org > Settings para Org ID

### 2) Fluxo
- Ao fazer push na branch `master`, o workflow executa: install -> build -> deploy `--prod` para a Vercel.
- Pull Requests podem manter o fluxo da CI (build/test); o deploy de produção é somente na `master`.

### 3) Troubleshooting
- Falhas de autenticação: verifique o `VERCEL_TOKEN`.
- Projeto/Org não encontrados: revise `VERCEL_PROJECT_ID` e `VERCEL_ORG_ID`.
- Build falha: rode localmente `npm ci && npm run build` para diagnosticar.

---

## C) Deploy via Vercel CLI (local)
1. Instale a CLI: `npm i -g vercel`
2. Faça login: `vercel login`
3. Link o projeto (na pasta raiz do repo): `vercel link`
   - Isso cria `.vercel/project.json` com `projectId` e `orgId`.
4. Deploy de preview: `vercel`
5. Deploy de produção: `vercel --prod`

Observações:
- O `vercel.json` já define `builds` (static-build) e `routes` para servir conteúdo estático.
- Em caso de alteração de diretório de saída, ajuste `distDir` no `vercel.json`.

---

## Configurações do projeto
- `package.json`
  - Build: `react-scripts build`
  - Diretório de saída: `build`
- `vercel.json`
  - `@vercel/static-build` com `distDir: build`
- CI (opcional)
  - `.github/workflows/ci.yml`: build e testes (Testing Library)
  - `.github/workflows/vercel-deploy.yml`: deploy de produção

## Serviços necessários
- Nenhum serviço backend é necessário para esta aplicação (100% estática).
- Opcional: Vercel Analytics (ativar em Settings > Analytics) para métricas.

## Checklist de validação pós-deploy
- Página carrega sem erros (200 OK)
- Busca funciona (rua, CEP, bairro) e destaca termos
- Mensagem de "Nenhum resultado" quando aplicável
- Acessibilidade: input tem label; lista anuncia contagem; navegação por teclado
- Lighthouse score aceitável (Performance/A11y/SEO)

## Rollback
- No Dashboard da Vercel, abra Deployments do projeto e promova um deploy anterior como produção
- Alternativamente, desfaça o commit na `master` para reverter via CD

## Dúvidas comuns
- "A build falha na Vercel": confirme Node versão padrão (Vercel usa recente; o CRA 5 funciona). Se necessário, adicione `engines` no `package.json`.
- "Onde altero título/meta?": `public/index.html`.
- "Como trocar o favicon?": Já apontamos para `public/image/logo.png`.
- "Preciso de variáveis de ambiente?": Não para este frontend. Se futuramente houver API externa, adicione em Project Settings > Environment Variables e re-deploy.
