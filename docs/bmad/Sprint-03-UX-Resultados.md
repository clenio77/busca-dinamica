# Sprint 03 — UX de Resultados (BMAD)

## B — Background
Melhorar a percepção do usuário sobre o que está acontecendo durante a busca.

## M — Metas
- Tornar a busca mais fluida e informativa.

## A — Ações
- [ ] Implementar debounce (150–250ms) no input.
- [ ] Realçar (highlight) o termo encontrado em rua/CEP/bairro.
- [ ] Exibir contagem de resultados.

## D — Definição de Pronto (DoD)
- Input não dispara filtro a cada tecla rapidamente.
- Matches destacados visualmente.
- Contagem de resultados visível ao digitar.

## Critérios de Aceite
- Debounce perceptível em dispositivos mais lentos.
- A contagem atualiza conforme o filtro.

## Riscos/Observações
- Highlight com HTML perigoso: usar abordagem segura (split + wrap).

## Estimativa
- 6–10h.

## Owner
- Clênio.
