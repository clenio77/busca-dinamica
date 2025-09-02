# 🚀 Busca Dinâmica 2.0

> **Sistema avançado de busca de endereços brasileiros com inteligência artificial e recursos modernos**

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/clenio77/busca-dinamica)
[![Test Coverage](https://img.shields.io/badge/coverage-85%25-brightgreen)](https://github.com/clenio77/busca-dinamica)
[![Security](https://img.shields.io/badge/security-A%2B-brightgreen)](https://github.com/clenio77/busca-dinamica)
[![License](https://img.shields.io/badge/license-MIT-blue)](https://github.com/clenio77/busca-dinamica)

## 🎯 **Visão Geral**

O **Busca Dinâmica 2.0** é uma aplicação web moderna e robusta para busca inteligente de endereços brasileiros. Desenvolvida com as melhores práticas de engenharia de software, oferece uma experiência de usuário excepcional com recursos avançados de segurança, performance e monitoramento.

### ✨ **Características Principais**

- 🔍 **Busca Inteligente**: Algoritmos avançados para busca de CEPs, ruas e endereços
- 🎨 **Interface Moderna**: Design responsivo com tema escuro/claro
- 📱 **PWA Completo**: Funcionalidade offline e instalação nativa
- 🔒 **Segurança Avançada**: Proteção contra XSS, SQL injection e ataques
- ⚡ **Performance Otimizada**: Lazy loading, code splitting e cache inteligente
- 📊 **Analytics Integrado**: Google Analytics 4 com métricas personalizadas
- 🧪 **Testes Automatizados**: Unitários, integração, E2E e performance
- 📈 **Monitoramento**: Logs estruturados, métricas em tempo real e alertas
- 🌐 **SEO Otimizado**: Meta tags dinâmicas, sitemap automático e Open Graph

## 🏗️ **Arquitetura**

```
busca-dinamica-react/
├── 📁 src/                    # Código fonte React
│   ├── 📁 components/         # Componentes React
│   ├── 📁 hooks/             # Custom hooks
│   ├── 📁 utils/             # Utilitários
│   └── 📁 config/            # Configurações
├── 📁 routes/                 # APIs Express
├── 📁 middleware/            # Middlewares de segurança
├── 📁 utils/                  # Utilitários do servidor
├── 📁 database/              # Configuração de banco
├── 📁 e2e/                   # Testes E2E (Playwright)
├── 📁 artillery/             # Testes de performance
└── 📁 docs/                  # Documentação
```

## 🚀 **Instalação e Configuração**

### **Pré-requisitos**

- Node.js 18+ 
- npm ou yarn
- PostgreSQL (opcional)
- Redis (opcional)

### **Instalação Rápida**

```bash
# Clone o repositório
git clone https://github.com/clenio77/busca-dinamica.git
cd busca-dinamica/busca-dinamica-react

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp env.example .env

# Inicie o servidor de desenvolvimento
npm start
```

### **Configuração de Ambiente**

Crie um arquivo `.env` baseado no `env.example`:

```env
# Servidor
PORT=3000
NODE_ENV=development

# Banco de dados
DATABASE_URL=postgresql://user:pass@localhost:5432/busca_dinamica
DB_TYPE=postgres

# Segurança
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:3000

# Analytics
REACT_APP_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Monitoramento
MONITORING_USERNAME=admin
MONITORING_PASSWORD=secure-password

# Redis (opcional)
REDIS_URL=redis://localhost:6379
```

## 🧪 **Testes**

### **Executar Todos os Testes**

```bash
# Testes unitários
npm run test:unit

# Testes de integração
npm run test:integration

# Testes E2E
npm run test:e2e

# Testes de performance
npm run test:performance

# Todos os testes
npm run test:all
```

### **Cobertura de Testes**

```bash
# Gerar relatório de cobertura
npm run test:coverage

# Ver relatório no navegador
open coverage/lcov-report/index.html
```

## 🔧 **Scripts Disponíveis**

| Script | Descrição |
|--------|-----------|
| `npm start` | Inicia servidor de desenvolvimento |
| `npm run build` | Build para produção |
| `npm run test` | Executa testes Jest |
| `npm run test:e2e` | Executa testes E2E |
| `npm run test:performance` | Testes de performance |
| `npm run lint` | Verifica código |
| `npm run lint:fix` | Corrige problemas de linting |
| `npm run security` | Auditoria de segurança |
| `npm run dev` | Modo desenvolvimento |

## 🔒 **Segurança**

### **Proteções Implementadas**

- ✅ **Content Security Policy (CSP)**
- ✅ **Rate Limiting** com Redis
- ✅ **Input Sanitization** com DOMPurify
- ✅ **XSS Protection** avançada
- ✅ **SQL Injection** prevention
- ✅ **CSRF Protection** com tokens
- ✅ **Helmet.js** para headers seguros
- ✅ **CORS** configurado
- ✅ **Audit de dependências** automático

### **Verificação de Segurança**

```bash
# Auditoria de segurança
npm run security

# Correção automática
npm run security:fix
```

## 📊 **Monitoramento e Logs**

### **Métricas Disponíveis**

- 📈 **Performance**: Core Web Vitals
- 🔍 **Busca**: Tempo de resposta, taxa de sucesso
- 👥 **Usuários**: Sessões, eventos, comportamento
- 🛡️ **Segurança**: Tentativas de ataque, rate limits
- 💾 **Sistema**: CPU, memória, uptime

### **Acessar Métricas**

```bash
# Health check básico
curl http://localhost:3000/health

# Health check detalhado
curl http://localhost:3000/health/detailed

# Métricas de monitoramento
curl -u admin:password http://localhost:3000/monitoring/summary
```

## 🚀 **Deploy**

### **Deploy Local**

```bash
# Build para produção
npm run build

# Iniciar servidor de produção
npm run dev:render
```

### **Deploy na Nuvem**

#### **Render.com (Recomendado)**

1. Conecte seu repositório GitHub
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

#### **Outras Plataformas**

- **Vercel**: Deploy automático
- **Netlify**: Build e deploy
- **Heroku**: App dyno
- **AWS**: EC2 ou Lambda

## 📚 **API Documentation**

### **Endpoints Principais**

#### **GET /api/cep/search**
Busca endereços por termo

```bash
curl "http://localhost:3000/api/cep/search?q=rua&cidade=São Paulo"
```

**Parâmetros:**
- `q` (string): Termo de busca (mín. 2 caracteres)
- `cidade` (string, opcional): Filtrar por cidade
- `estado` (string, opcional): Filtrar por estado

#### **GET /api/cep/:cep**
Busca endereço por CEP

```bash
curl "http://localhost:3000/api/cep/12345678"
```

#### **GET /api/cep/cities**
Lista todas as cidades

```bash
curl "http://localhost:3000/api/cep/cities"
```

#### **GET /api/cep/states**
Lista todos os estados

```bash
curl "http://localhost:3000/api/cep/states"
```

## 🤝 **Contribuição**

### **Como Contribuir**

1. **Fork** o projeto
2. **Crie** uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. **Push** para a branch (`git push origin feature/AmazingFeature`)
5. **Abra** um Pull Request

### **Padrões de Código**

- **ESLint** para linting
- **Prettier** para formatação
- **Conventional Commits** para commits
- **Testes** obrigatórios para novas features

## 📄 **Licença**

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🙏 **Agradecimentos**

- **React** pela biblioteca incrível
- **Express** pelo framework web
- **Tailwind CSS** pelo design system
- **Playwright** pelos testes E2E
- **Artillery** pelos testes de performance

## 📞 **Suporte**

- 📧 **Email**: suporte@buscadinamica.com
- 💬 **Discord**: [Servidor da Comunidade](https://discord.gg/buscadinamica)
- 📖 **Documentação**: [docs.buscadinamica.com](https://docs.buscadinamica.com)
- 🐛 **Issues**: [GitHub Issues](https://github.com/clenio77/busca-dinamica/issues)

---

**Desenvolvido com ❤️ pela equipe Busca Dinâmica**
