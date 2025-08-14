# Sprint 02 — Filtro Robusto e Reutilizável (BMAD)

## B — Background
A busca atual é case-insensitive, mas não remove acentos nem facilita testes isolados.

## M — Metas
- Extrair util de filtragem testável com normalização.
- Tornar filtragem eficiente e previsível.

## A — Ações
- [x] Criar `src/utils/filterAddresses.js` com `filterAddresses()` e `normalize()`.
- [x] Cobrir com testes unitários (casos com acentos, múltiplos campos, termo vazio).
- [x] Trocar `useEffect` por `useMemo` em `App.js` para derivar `filteredAddresses`.

## D — Definição de Pronto (DoD)
- Todos os testes da util passam.
- Render evita recomputações desnecessárias.

## Critérios de Aceite
- Termos com/sem acento retornam mesmos resultados.
- Termo vazio não lista tudo por padrão (exibe vazio até o usuário digitar).

## Riscos/Observações
- Mudança de semântica: decidir se termo vazio mostra tudo ou nada. Padrão: nada.

## Estimativa
- 4–8h.

## Owner
- Clênio.
