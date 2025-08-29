# Sprint 01 — Quick Wins de Correção e UX Básica (BMAD)

## B — Background
Corrigir pequenos problemas que impactam usabilidade e confiabilidade imediata do MVP.

## M — Metas
- Garantir comportamento correto do input e feedback para usuário.
- Ter teste mínimo passando para evitar regressões simples.

## A — Ações
- [x] Corrigir atributo `autoComplete` no `SearchBar`.
- [x] Adicionar mensagem de estado vazio em `AddressList` quando não houver resultados.
- [x] Verificar asset `public/image/logo.png` e manter `alt` descritivo.
- [x] Atualizar `App.test.js` para refletir o app real (testar título do header).

## D — Definição de Pronto (DoD)
- Input sem autocompletar nativo, Enter limpa, sem warnings.
- Ao buscar e não encontrar, aparece mensagem "Nenhum resultado".
- Teste automatizado executa e passa localmente.

## Critérios de Aceite
- Digitar termo inexistente mostra mensagem de vazio.
- Título "Busca Dinâmica 2.0" é validado por teste.

## Riscos/Observações
- Test runner do CRA em watch: executar com `--watchAll=false` em CI.

## Estimativa
- 2–4h.

## Owner
- Clênio / responsável pelo repositório.
