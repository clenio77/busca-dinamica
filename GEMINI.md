# Gemini Project Information

# Lógica do Projeto (BMad-Method)

O BMad-Method (Breakthrough Method of Agile AI-driven Development) é um framework que combina agentes de IA com metodologias de desenvolvimento Ágil.

## Como Funciona

1.  **Você Direciona, a IA Executa**: Você fornece a visão e as decisões; os agentes cuidam dos detalhes da implementação.
2.  **Agentes Especializados**: Cada agente domina uma função (PM, Desenvolvedor, Arquiteto, etc.).
3.  **Workflows Estruturados**: Padrões comprovados guiam você desde a ideia até o código implantado.
4.  **Handoffs Limpos**: Novas janelas de contexto garantem que os agentes permaneçam focados e eficazes.

## Fluxo de Trabalho de Desenvolvimento Completo

### Fase de Planejamento (Recomendado via Web UI)

1.  **Análise Opcional**: `/analyst` - Pesquisa de mercado, análise competitiva.
2.  **Briefing do Projeto**: Criação do documento base.
3.  **Criação do PRD**: `/pm create-doc prd` - Requisitos do produto.
4.  **Design da Arquitetura**: `/architect create-doc architecture` - Base técnica.
5.  **Validação e Alinhamento**: `/po` executa o checklist mestre.
6.  **Preparação dos Documentos**: Copiar documentos finais para `docs/prd.md` and `docs/architecture.md`.

### Transição Crítica: Web UI para IDE

- **Por quê**: O fluxo de trabalho de desenvolvimento requer operações de arquivo, integração de projeto em tempo real e fragmentação de documentos.
- **Arquivos Necessários**: Garanta que `docs/prd.md` e `docs/architecture.md` existam no seu projeto.

### Fluxo de Trabalho de Desenvolvimento no IDE

1.  **Fragmentação de Documentos (Passo CRÍTICO)**:
    - Documentos criados pelo PM/Arquiteto DEVEM ser fragmentados para o desenvolvimento.
    - Use a tarefa `shard-doc`.

2.  **Ciclo de Desenvolvimento** (Sequencial, uma estória de cada vez):
    - **Criação da Estória**: `@sm` -> `*create`
    - **Implementação da Estória**: `@dev`
    - **Revisão Sênior de QA**: `@qa`
    - **Repetir**: Continue o ciclo SM -> Dev -> QA até que todas as estórias do épico estejam completas.