# 🛠️ Guia de Desenvolvimento

> **Guia completo para desenvolvedores que querem contribuir com o Busca Dinâmica 2.0**

## 📋 **Índice**

1. [Configuração do Ambiente](#configuração-do-ambiente)
2. [Estrutura do Projeto](#estrutura-do-projeto)
3. [Padrões de Código](#padrões-de-código)
4. [Fluxo de Desenvolvimento](#fluxo-de-desenvolvimento)
5. [Testes](#testes)
6. [Debugging](#debugging)
7. [Performance](#performance)
8. [Segurança](#segurança)
9. [Deploy](#deploy)

## 🚀 **Configuração do Ambiente**

### **Pré-requisitos**

```bash
# Node.js 18+
node --version  # v18.0.0 ou superior

# npm ou yarn
npm --version   # 8.0.0 ou superior

# Git
git --version   # 2.30.0 ou superior
```

### **Instalação Inicial**

```bash
# Clone o repositório
git clone https://github.com/clenio77/busca-dinamica.git
cd busca-dinamica/busca-dinamica-react

# Instale dependências
npm install

# Configure variáveis de ambiente
cp env.example .env

# Inicie o servidor de desenvolvimento
npm start
```

### **Ferramentas Recomendadas**

- **VS Code** com extensões:
  - ESLint
  - Prettier
  - Auto Rename Tag
  - Bracket Pair Colorizer
  - GitLens
  - Thunder Client (para testar APIs)

- **Navegadores**:
  - Chrome DevTools
  - Firefox Developer Tools
  - React Developer Tools

## 🏗️ **Estrutura do Projeto**

```
busca-dinamica-react/
├── 📁 src/                          # Código fonte React
│   ├── 📁 components/               # Componentes React
│   │   ├── 📁 __tests__/           # Testes dos componentes
│   │   ├── SearchBar.js            # Barra de busca principal
│   │   ├── Sidebar.js              # Menu lateral
│   │   ├── AddressList.js          # Lista de endereços
│   │   ├── ThemeToggle.js           # Alternador de tema
│   │   ├── OptimizedImage.js        # Imagem otimizada
│   │   ├── VoiceSearchButton.js    # Botão de busca por voz
│   │   ├── AdvancedActions.js      # Ações avançadas
│   │   └── PWAInstallPrompt.js     # Prompt de instalação PWA
│   ├── 📁 hooks/                   # Custom hooks
│   │   ├── 📁 __tests__/           # Testes dos hooks
│   │   ├── useAddressSearch.js     # Hook de busca
│   │   ├── useTheme.js             # Hook de tema
│   │   ├── useAnalytics.js         # Hook de analytics
│   │   ├── usePerformance.js       # Hook de performance
│   │   ├── useVoiceSearch.js       # Hook de busca por voz
│   │   ├── useSearchHistory.js     # Hook de histórico
│   │   ├── useSavedFilters.js      # Hook de filtros salvos
│   │   ├── useSEO.js               # Hook de SEO
│   │   └── useSecurity.js          # Hook de segurança
│   ├── 📁 utils/                   # Utilitários
│   │   ├── filterAddresses.js      # Filtros de endereços
│   │   ├── exportUtils.js          # Utilitários de exportação
│   │   └── sitemapGenerator.js      # Gerador de sitemap
│   ├── 📁 config/                  # Configurações
│   │   └── analytics.js            # Configuração de analytics
│   ├── App.js                      # Componente principal
│   ├── App.css                     # Estilos principais
│   └── index.js                    # Ponto de entrada
├── 📁 routes/                      # APIs Express
│   ├── 📁 __tests__/               # Testes das APIs
│   ├── cep.js                      # Endpoints de CEP
│   ├── admin.js                    # Endpoints administrativos
│   ├── health.js                   # Health checks
│   └── monitoring.js               # Endpoints de monitoramento
├── 📁 middleware/                  # Middlewares
│   ├── csp.js                      # Content Security Policy
│   ├── sanitization.js             # Sanitização de entrada
│   └── rateLimit.js                # Rate limiting
├── 📁 utils/                       # Utilitários do servidor
│   ├── advancedLogger.js            # Sistema de logs
│   ├── metrics.js                   # Coleta de métricas
│   └── alerts.js                    # Sistema de alertas
├── 📁 database/                    # Configuração de banco
│   ├── init.js                     # Inicialização
│   ├── connection.js               # Conexão SQLite
│   └── postgres-init.js            # Inicialização PostgreSQL
├── 📁 e2e/                         # Testes E2E
│   ├── search.spec.js              # Testes de busca
│   ├── global-setup.js             # Setup global
│   └── global-teardown.js          # Teardown global
├── 📁 artillery/                   # Testes de performance
│   └── performance.yml             # Configuração Artillery
├── 📁 docs/                        # Documentação
│   ├── api-swagger.yaml            # Documentação da API
│   ├── DEVELOPMENT.md              # Este guia
│   └── DEPLOYMENT.md               # Guia de deploy
├── 📁 public/                      # Arquivos públicos
│   ├── manifest.json               # Manifest PWA
│   ├── sw.js                       # Service Worker
│   ├── robots.txt                  # Robots.txt
│   └── sitemap.xml                 # Sitemap
├── server.js                       # Servidor Express
├── package.json                    # Dependências e scripts
├── jest.config.js                  # Configuração Jest
├── playwright.config.js             # Configuração Playwright
└── README.md                       # Documentação principal
```

## 📝 **Padrões de Código**

### **JavaScript/React**

```javascript
// ✅ Bom - Componente funcional com hooks
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const SearchBar = ({ onSearch, placeholder }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Lógica do useEffect
  }, [query]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setIsLoading(true);
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="search-form">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="search-input"
        disabled={isLoading}
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Buscando...' : 'Buscar'}
      </button>
    </form>
  );
};

SearchBar.propTypes = {
  onSearch: PropTypes.func.isRequired,
  placeholder: PropTypes.string
};

SearchBar.defaultProps = {
  placeholder: 'Digite para buscar...'
};

export default SearchBar;
```

### **CSS/Styling**

```css
/* ✅ Bom - Usando CSS variables para temas */
:root {
  --primary-color: #3b82f6;
  --secondary-color: #64748b;
  --background-color: #ffffff;
  --text-color: #1f2937;
  --border-color: #e5e7eb;
}

[data-theme="dark"] {
  --primary-color: #60a5fa;
  --secondary-color: #94a3b8;
  --background-color: #1f2937;
  --text-color: #f9fafb;
  --border-color: #374151;
}

.search-form {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  background-color: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
}

.search-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  background-color: var(--background-color);
  color: var(--text-color);
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
```

### **API Endpoints**

```javascript
// ✅ Bom - Endpoint com validação e tratamento de erro
const express = require('express');
const { body, validationResult } = require('express-validator');

router.get('/api/cep/search', [
  query('q')
    .isLength({ min: 2, max: 100 })
    .withMessage('Termo de busca deve ter entre 2 e 100 caracteres')
    .trim()
    .escape(),
  query('cidade')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Nome da cidade muito longo')
    .trim()
    .escape(),
  query('estado')
    .optional()
    .matches(/^[A-Z]{2}$/)
    .withMessage('Estado deve ser uma sigla de 2 letras')
], async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Erro de validação',
        errors: errors.array()
      });
    }

    const { q, cidade, estado, limit = 50, offset = 0 } = req.query;

    // Buscar endereços
    const addresses = await searchAddresses(q, { cidade, estado, limit, offset });

    res.json({
      success: true,
      data: addresses,
      total: addresses.length,
      query: q
    });

  } catch (error) {
    logger.error('Erro na busca de endereços:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});
```

## 🔄 **Fluxo de Desenvolvimento**

### **1. Preparação**

```bash
# Atualize sua branch
git checkout master
git pull origin master

# Crie uma nova branch
git checkout -b feature/nova-funcionalidade
```

### **2. Desenvolvimento**

```bash
# Inicie o servidor de desenvolvimento
npm start

# Em outro terminal, execute linting em watch mode
npm run lint:watch

# Execute testes em watch mode
npm run test:watch
```

### **3. Testes**

```bash
# Execute todos os testes
npm run test:all

# Verifique cobertura
npm run test:coverage

# Execute testes E2E
npm run test:e2e

# Execute testes de performance
npm run test:performance
```

### **4. Commit e Push**

```bash
# Adicione arquivos
git add .

# Commit com mensagem descritiva
git commit -m "feat: adicionar busca por voz

- Implementar reconhecimento de voz
- Adicionar botão de microfone
- Integrar com Web Speech API
- Adicionar testes unitários
- Atualizar documentação"

# Push para o repositório
git push origin feature/nova-funcionalidade
```

### **5. Pull Request**

1. Crie um Pull Request no GitHub
2. Preencha o template de PR
3. Adicione screenshots se necessário
4. Aguarde review e CI/CD

## 🧪 **Testes**

### **Testes Unitários**

```javascript
// ✅ Bom - Teste completo de componente
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from '../SearchBar';

describe('SearchBar', () => {
  const mockOnSearch = jest.fn();

  beforeEach(() => {
    mockOnSearch.mockClear();
  });

  it('deve renderizar corretamente', () => {
    render(<SearchBar onSearch={mockOnSearch} />);
    
    expect(screen.getByPlaceholderText('Digite para buscar...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('deve chamar onSearch quando formulário for submetido', async () => {
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const input = screen.getByPlaceholderText('Digite para buscar...');
    const button = screen.getByRole('button');
    
    await userEvent.type(input, 'avenida paulista');
    fireEvent.click(button);
    
    expect(mockOnSearch).toHaveBeenCalledWith('avenida paulista');
  });

  it('não deve chamar onSearch com query vazia', () => {
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(mockOnSearch).not.toHaveBeenCalled();
  });
});
```

### **Testes de Integração**

```javascript
// ✅ Bom - Teste de API
const request = require('supertest');
const app = require('../server');

describe('CEP API', () => {
  describe('GET /api/cep/search', () => {
    it('deve retornar endereços para busca válida', async () => {
      const response = await request(app)
        .get('/api/cep/search')
        .query({ q: 'rua' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('deve retornar erro para busca muito curta', async () => {
      const response = await request(app)
        .get('/api/cep/search')
        .query({ q: 'a' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('mínimo');
    });
  });
});
```

### **Testes E2E**

```javascript
// ✅ Bom - Teste E2E com Playwright
const { test, expect } = require('@playwright/test');

test('deve realizar busca e mostrar resultados', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Digitar termo de busca
  await page.fill('input[placeholder*="buscar"]', 'rua');
  
  // Aguardar resultados
  await page.waitForSelector('text=resultados encontrados', { timeout: 10000 });
  
  // Verificar que há resultados
  const resultsText = await page.locator('text=resultados encontrados').textContent();
  expect(resultsText).toMatch(/\d+ resultados encontrados/);
});
```

## 🐛 **Debugging**

### **Debugging Frontend**

```javascript
// ✅ Bom - Debugging com console estruturado
const debugSearch = (query, filters) => {
  console.group('🔍 Busca de Endereços');
  console.log('Query:', query);
  console.log('Filtros:', filters);
  console.log('Timestamp:', new Date().toISOString());
  console.groupEnd();
};

// ✅ Bom - Debugging de performance
const debugPerformance = (operation, startTime) => {
  const duration = performance.now() - startTime;
  console.log(`⚡ ${operation}: ${duration.toFixed(2)}ms`);
};
```

### **Debugging Backend**

```javascript
// ✅ Bom - Logging estruturado
const logger = require('../utils/advancedLogger');

const searchAddresses = async (query, filters) => {
  logger.info('Iniciando busca de endereços', {
    query,
    filters,
    timestamp: new Date().toISOString()
  });

  try {
    const results = await performSearch(query, filters);
    
    logger.info('Busca concluída com sucesso', {
      query,
      resultsCount: results.length,
      duration: Date.now() - startTime
    });

    return results;
  } catch (error) {
    logger.error('Erro na busca de endereços', {
      query,
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
};
```

### **Ferramentas de Debug**

```bash
# Debug do React
npm run start:debug

# Debug do servidor
node --inspect server.js

# Debug dos testes
npm run test:debug
```

## ⚡ **Performance**

### **Otimizações Frontend**

```javascript
// ✅ Bom - Lazy loading de componentes
const LazyAddressList = React.lazy(() => import('./AddressList'));

// ✅ Bom - Memoização de componentes
const MemoizedSearchBar = React.memo(SearchBar);

// ✅ Bom - Debounce para busca
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
```

### **Otimizações Backend**

```javascript
// ✅ Bom - Cache com Redis
const cacheSearch = async (query, results) => {
  const key = `search:${query}`;
  await redis.setex(key, 3600, JSON.stringify(results)); // 1 hora
};

// ✅ Bom - Paginação eficiente
const getAddressesPaginated = async (query, page = 1, limit = 50) => {
  const offset = (page - 1) * limit;
  
  const [results, total] = await Promise.all([
    db.all(`
      SELECT * FROM addresses 
      WHERE logradouro LIKE ? 
      LIMIT ? OFFSET ?
    `, [`%${query}%`, limit, offset]),
    db.get('SELECT COUNT(*) as total FROM addresses WHERE logradouro LIKE ?', [`%${query}%`])
  ]);

  return {
    data: results,
    total: total.total,
    page,
    totalPages: Math.ceil(total.total / limit)
  };
};
```

## 🔒 **Segurança**

### **Validação de Entrada**

```javascript
// ✅ Bom - Sanitização de entrada
const sanitizeInput = (input) => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
};

// ✅ Bom - Validação de CEP
const validateCEP = (cep) => {
  const cleanCEP = cep.replace(/\D/g, '');
  return /^\d{8}$/.test(cleanCEP) ? cleanCEP : false;
};
```

### **Rate Limiting**

```javascript
// ✅ Bom - Rate limiting configurável
const rateLimit = require('express-rate-limit');

const searchLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: {
    success: false,
    message: 'Muitas requisições. Tente novamente em 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false
});
```

## 🚀 **Deploy**

### **Deploy Local**

```bash
# Build para produção
npm run build

# Teste local da build
npm run dev:render
```

### **Deploy na Nuvem**

```bash
# Render.com
git push origin master  # Deploy automático

# Vercel
vercel --prod

# Netlify
netlify deploy --prod
```

### **Verificação Pós-Deploy**

```bash
# Health check
curl https://seu-app.com/health

# Testes de smoke
npm run test:smoke

# Verificar métricas
curl -u admin:password https://seu-app.com/monitoring/summary
```

## 📚 **Recursos Adicionais**

### **Documentação**

- [React Docs](https://react.dev/)
- [Express.js Docs](https://expressjs.com/)
- [Jest Docs](https://jestjs.io/)
- [Playwright Docs](https://playwright.dev/)

### **Ferramentas**

- [ESLint](https://eslint.org/)
- [Prettier](https://prettier.io/)
- [Postman](https://www.postman.com/)
- [Chrome DevTools](https://developers.google.com/web/tools/chrome-devtools)

### **Comunidade**

- [GitHub Issues](https://github.com/clenio77/busca-dinamica/issues)
- [Discord](https://discord.gg/buscadinamica)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/busca-dinamica)

---

**Boa sorte no desenvolvimento! 🚀**
