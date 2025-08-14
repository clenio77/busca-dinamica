# Busca Dinâmica 2.0 — Lógica do Projeto, Estado Atual e Próximos Passos

## Visão Geral
Aplicação React (Create React App) para busca dinâmica de endereços. O usuário digita um termo e a lista é filtrada localmente em tempo real por `rua` (street), `CEP` (cep) e `bairro` (neighborhood).

Estrutura principal:
- `src/App.js`: Orquestra estado, aplica filtro e compõe layout.
- `src/components/SearchBar.js`: Input controlado do termo de busca.
- `src/components/AddressList.js`: Renderiza lista filtrada.
- `src/components/AddressItem.js`: Item da lista (rua | CEP | bairro).
- `src/components/Header.js` e `Footer.js`: Apresentação.
- `src/data/addresses.js`: Fonte de dados local (array de objetos).
- `src/App.css`: Estilos globais e da página.

## Fluxo de Dados e Lógica
1. Estado em `App`:
   - `searchTerm`: string do input.
   - `filteredAddresses`: array filtrado (inicialmente igual aos dados).
2. Efeito de filtragem (`useEffect`):
   - Dependente de `searchTerm`.
   - Aplica `includes` case-insensitive sobre `street`, `cep`, `neighborhood`.
   - Atualiza `filteredAddresses` com o resultado.
3. Interação:
   - `SearchBar` recebe `searchTerm` e `onSearchChange`.
   - `onChange` atualiza `searchTerm`.
   - Pressionar Enter limpa o campo (reseta busca).
4. Renderização:
   - `AddressList` só mostra a lista quando `searchTerm.length > 0`.
   - Para cada item filtrado, renderiza `AddressItem`.

Pseudocódigo resumido:
```
state searchTerm = ''
state filtered = addresses

on searchTerm change:
  filtered = addresses.filter(a =>
    a.street.toUpperCase().includes(searchTerm.toUpperCase()) ||
    a.cep.toUpperCase().includes(searchTerm.toUpperCase()) ||
    a.neighborhood.toUpperCase().includes(searchTerm.toUpperCase())
  )

UI:
  Header
  SearchBar(searchTerm, setSearchTerm)
  if (searchTerm) AddressList(filtered)
  Footer
```

## Pontos de Implementação e Nível Atual
- Build tooling: CRA (`react-scripts@5`).
- React 19 ("^19.1.0").
- Testes: boilerplate padrão do CRA ainda não ajustado (teste procura "learn react"). Deve falhar pois não há esse texto.
- Dados: estáticos, embutidos no bundle (arquivo grande).
- Acessos externos: nenhum.
- Assets: logo referenciado como `image/logo.png` dentro de `public/image/` (pasta não monitorada pelo git no status inicial). É servido via caminho relativo do `public/`.
- Estilos: `App.css` com layout, responsividade básica.

Classificação de maturidade (alto nível):
- Funcionalidade core (busca local): pronta para protótipo/MVP.
- Testes: insuficientes/inexistentes para produção.
- Performance: aceitável para poucos milhares de registros; atenção ao tamanho do array e custo de renderização.
- Acessibilidade/i18n: mínimos.
- DevX/CI: sem lint/format/CI configurados explicitamente além do ESLint do CRA.

## O que falta para Produção
- Testes automatizados cobrindo:
  - Render básico do app.
  - Filtragem por rua, CEP e bairro (casos sensíveis e vazios).
  - Comportamento de Enter (limpar campo).
  - Estados vazios (nenhum resultado -> mensagem amigável).
- Tratamento de dados e UX:
  - Mensagem "Nenhum resultado".
  - Placeholders e instruções consistentes (corrigir `autocomplete` -> `autoComplete`).
  - Normalização/remover acentuação para busca robusta.
  - Highlight do termo nas correspondências (opcional, melhora UX).
- Otimização de performance:
  - `useMemo` para lista filtrada.
  - Virtualização de lista (`react-window`/`react-virtualized`) se volume grande.
  - Debounce do input (ex.: 150–250ms).
- Acessibilidade:
  - `label` associado ao input.
  - Semântica (usar `<nav>`/`<main>` adequados, `aria-live` para resultados).
  - Foco/teclado (seta navega resultados, Enter abre link real se existir).
- Qualidade de código:
  - Tipagem com TypeScript ou `prop-types`.
  - Extrair lógica de filtro para util testável (`src/utils/filterAddresses.js`).
- Build/deploy:
  - Meta tags, título e descrição ajustados.
  - Análise de bundle e split se necessário.
  - Configurar CI (build + test) e hospedagem (Vercel/Netlify/GH Pages).
- Observabilidade:
  - Monitoramento de erros (Sentry) e métricas Web Vitals.

## Sugestões de Melhoria (curto prazo)
1. Correções rápidas:
   - `SearchBar`: usar `autoComplete="off"` (atual está `autocomplete`).
   - `Header`: garantir existência do asset `public/image/logo.png` e uma `alt` descritiva.
   - `AddressList`: mostrar mensagem quando `shouldDisplayList` for verdadeiro e `addresses.length === 0`.
2. Lógica de filtro mais robusta:
   - Remover acentos e normalizar espaços/pontuação.
   - Suportar múltiplos termos (ex.: "oswaldo mansour").
3. UX:
   - Realçar match no texto.
   - Mostrar contagem de resultados.
   - Debounce no input.
4. Performance:
   - `useMemo` para evitar filtrar a cada render sem necessidade.
   - Virtualização de lista se > 2–3k itens.
5. Qualidade:
   - Migrar para TypeScript.
   - Adicionar testes de unidade e integração.
   - Adicionar linter/formatter (ESLint/Prettier) e hooks (Husky).

## Sugestões de Melhoria (médio prazo)
- Separar dados do bundle (API ou arquivo JSON externo carregado sob demanda).
- Paginação ou carregamento incremental.
- Cache local (`localStorage`/`IndexedDB`) e atualização offline (PWA).
- Pesquisa com índice (Fuse.js para fuzzy search) se necessário.

## Pontos de Extensão no Código
- `App.js`: mover filtro para `useMemo` e util dedicável.
- `src/utils/filterAddresses.js`: função pura `filterAddresses(addresses, query)` com normalização.
- `SearchBar`: adicionar `debounce` e `label` acessível.
- `AddressList`: estado vazio e highlight.

## Exemplo de Assinatura de Util para Filtro (proposto)
```js
// src/utils/filterAddresses.js
export function filterAddresses(addresses, query) {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return [];
  return addresses.filter((a) => {
    const street = normalize(a.street);
    const cep = normalize(a.cep);
    const neighborhood = normalize(a.neighborhood);
    return (
      street.includes(normalizedQuery) ||
      cep.includes(normalizedQuery) ||
      neighborhood.includes(normalizedQuery)
    );
  });
}

function normalize(text) {
  return (text || '')
    .toString()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toUpperCase()
    .trim();
}
```

## Riscos e Observações
- Array de endereços muito grande aumenta tamanho do bundle e custo do filtro. Considere mover para JSON externo + lazy load.
- Teste padrão do CRA falha; ajustar ou remover.
- Licenças/atribuições de dados e imagens devem ser avaliadas antes de publicar.

## Checklist sugerido
- [ ] Corrigir `autoComplete` no input
- [ ] Mensagem de "Nenhum resultado"
- [ ] Extrair util de filtro + testes
- [ ] Debounce do input
- [ ] `useMemo` para resultados
- [ ] Ajustar teste do CRA
- [ ] Título/descrição em `index.html`
- [ ] Verificar assets em `public/image/`
- [ ] Configurar CI (build+test)
