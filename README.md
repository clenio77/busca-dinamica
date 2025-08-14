# Busca Dinâmica CEP 2.0

Sistema avançado de busca dinâmica de CEPs para Minas Gerais com agentes automatizados de coleta e atualização de dados.

## 🚀 Características

- **Busca Inteligente**: Busca por endereço, bairro, cidade ou CEP
- **Busca por Voz**: Reconhecimento de voz integrado (funciona sem acentos)
- **Sem Acentos**: Busca funciona com ou sem acentuação (ideal para busca por voz)
- **Agente Scraper**: Coleta automática de CEPs de APIs públicas
- **Atualização Semanal**: Agente que verifica e atualiza a base automaticamente
- **Backup Automático**: Sistema de backup diário com histórico
- **Painel Admin**: Interface de administração completa
- **API REST**: Endpoints para integração com outros sistemas
- **Interface Responsiva**: Funciona em desktop e mobile
- **Performance Otimizada**: Busca rápida com índices otimizados
- **Monitoramento**: Logs detalhados e métricas em tempo real

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn
- Docker (opcional para execução containerizada)

## 🔧 Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/clenio77/busca-dinamica.git
cd busca-dinamica
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure o ambiente**
```bash
cp .env.example .env
# Edite o arquivo .env conforme necessário
```

4. **Configure o banco de dados**
```bash
npm run setup-db
```

5. **Inicie o servidor**
```bash
npm start
```

O sistema estará disponível em `http://localhost:3000`

## 🤖 Agentes Automatizados

### Agente Scraper
Coleta CEPs de Minas Gerais usando APIs públicas:

```bash
# Coletar 1000 CEPs a partir do 30000000
npm run scraper -- --start=30000000 --max=1000

# Coletar CEPs de uma cidade específica
npm run scraper -- --city="Uberlandia" --max=2000
```

### Agente de Atualização Semanal
Executa automaticamente toda segunda-feira às 2h da manhã, mas pode ser executado manualmente:

```bash
npm run update
```

## 📡 API Endpoints

### Buscar Endereços
```
GET /api/cep/search?q=termo&limit=50&offset=0
```

### Buscar por CEP
```
GET /api/cep/38400-000
```

### Estatísticas
```
GET /api/cep/stats/info
```

### Admin – Estatísticas detalhadas (requer token)
```
GET /api/admin/stats/detailed
Authorization: Bearer <ADMIN_TOKEN>
```

### Admin – Executar scraper manual (requer token)
```
POST /api/admin/scraper/run
Content-Type: application/json
Authorization: Bearer <ADMIN_TOKEN>
{
  "startFrom": 30000000,
  "maxCEPs": 1000
}
```

## 🗂️ Estrutura do Projeto

```
busca-dinamica/
├── css/                    # Estilos CSS
├── js/                     # JavaScript frontend
├── image/                  # Imagens e logos
├── database/               # Configuração do banco
│   └── init.js            # Inicialização e schemas
├── routes/                 # Rotas da API
│   └── cep.js             # Endpoints de CEP
├── services/               # Serviços e agentes
│   ├── cep-scraper.js     # Agente de coleta
│   └── weekly-update.js   # Agente de atualização
├── scripts/                # Scripts utilitários
│   ├── scraper.js         # Script manual do scraper
│   ├── setup-database.js  # Configuração inicial
│   └── weekly-update.js   # Atualização manual
├── logs/                   # Logs do sistema
├── server.js              # Servidor principal
└── package.json           # Dependências
```

## 🎯 Solução para Busca por Voz

O sistema resolve o problema da acentuação mantendo duas versões de cada campo:
- **Com acentos**: Para exibição (`logradouro`, `bairro`, `cidade`)
- **Sem acentos**: Para busca (`logradouro_sem_acento`, `bairro_sem_acento`, `cidade_sem_acento`)

Isso permite que:
- Usuários digitem "sao joao" e encontrem "São João"
- Busca por voz funcione perfeitamente
- Resultados sejam exibidos com acentuação correta

## 🔄 Fluxo de Atualização

1. **Coleta Inicial**: Script de setup importa dados básicos
2. **Expansão**: Agente scraper coleta CEPs de MG usando APIs públicas
3. **Manutenção**: Agente semanal verifica mudanças e novos CEPs
4. **Monitoramento**: Logs e relatórios de todas as operações

## 🛠️ Comandos Disponíveis

```bash
npm start              # Iniciar servidor
npm run dev            # Modo desenvolvimento (nodemon)
npm run setup-db       # Configurar banco inicial
npm run scraper        # Executar scraper manual
npm run update         # Executar atualização manual
npm run lint           # Analisar código com ESLint
npm run format         # Formatar código com Prettier

docker build -t busca-cep .          # Build da imagem Docker
docker run -p 3000:3000 busca-cep    # Executar container
```

## 📊 Monitoramento

- Logs salvos em `./logs/`
- Relatórios de atualização em JSON
- Estatísticas disponíveis via API
- Console com progresso em tempo real

## 🔒 Segurança

- Rate limiting nas APIs
- Helmet para headers de segurança
- Validação de entrada
- Sanitização de dados

## 🚀 Performance

- Índices otimizados no banco
- Compressão gzip
- Cache de resultados
- Debounce na busca frontend
- Paginação de resultados

## 📝 Logs

O sistema gera logs detalhados:
- Operações de scraping
- Atualizações da base
- Erros e exceções
- Estatísticas de uso

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

MIT License - veja o arquivo LICENSE para detalhes.

## 👨‍💻 Autor

**Clênio Moura**
- Email: clenioti@gmail.com
- GitHub: [@clenio77](https://github.com/clenio77)

## 🙏 Agradecimentos

- APIs públicas: ViaCEP, BrasilAPI
- Comunidade open source
- Usuários e contribuidores

## 🔍 Qualidade de Código

- **ESLint**: Regras recomendadas + plugin `import` para organizar imports.
- **Prettier**: Formatação de código consistente.
- Scripts automáticos `npm run lint` e `npm run format`.
- Configurações em `.eslintrc.json` e `.prettierrc`.

## 🚀 Deploy na Vercel

Esta aplicação é um frontend React (Create React App) pronto para deploy na Vercel.

### Passo a passo
1. Acesse a Vercel e importe o repositório `clenio77/busca-dinamica`.
2. Framework: "Create React App" (detectado automaticamente).
3. Comando de build: `npm run build`
4. Diretório de saída: `build`
5. Variáveis de ambiente: não são necessárias para o frontend atual.

O arquivo `vercel.json` já está configurado para build estático.

### Deploy contínuo
- A cada push na branch `master`, a Vercel criará um novo deploy de produção.
- Pull Requests recebem previews automáticos.

## 🐳 Docker

Execute o projeto sem instalar Node.js localmente:
```bash
docker build -t busca-cep .
docker run -d -p 3000:3000 --env-file .env busca-cep
```
O serviço ficará acessível em `http://localhost:3000`.
