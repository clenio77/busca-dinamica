# Sprint 05 — Performance para Listas Grandes (BMAD)

## B — Background
Listas muito grandes podem deteriorar performance.

## M — Metas
- Evitar renderização de itens fora da viewport.

## A — Ações
- [ ] Integrar `react-window` para virtualização condicional (> 2k itens).
- [ ] Medir antes/depois (FPS ou simples profiling).

## D — Definição de Pronto (DoD)
- Scrolling suave com datasets grandes simulados.

## Critérios de Aceite
- Sem jank perceptível em 5k itens.

## Riscos/Observações
- Virtualização impacta acessibilidade; validar comportamento com teclado.

## Estimativa
- 6–12h.

## Owner
- Clênio.
