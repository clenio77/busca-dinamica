# 🏢 IMPLEMENTAÇÃO - INTEGRAÇÃO COM REDE INTERNA DOS CORREIOS

## 📋 **OBJETIVO**
Integrar o `useAddressSearch.js` com a rede interna dos Correios (`buscacepintra.correios.com.br`) para acessar a base completa e mais atualizada de CEPs do Brasil.

## 🎯 **ESTRATÉGIA HÍBRIDA**
Sistema inteligente que detecta automaticamente onde está rodando e usa a melhor fonte disponível:

1. **🔴 Rede Interna dos Correios** → Base completa (prioridade)
2. **🟡 ViaCEP API** → Fallback público
3. **🟢 Arquivo Local** → Cache offline

---

## 🔧 **IMPLEMENTAÇÃO TÉCNICA**

### **1. Criar Serviço de Detecção de Rede**

```javascript
// src/services/networkDetector.js
export class NetworkDetector {
  static async isInternalNetwork() {
    try {
      const response = await fetch('https://buscacepintra.correios.com.br/app/endereco/index.php', {
        method: 'HEAD',
        timeout: 3000,
        mode: 'no-cors'
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}
```

### **2. Criar Serviço de Scraping Interno**

```javascript
// src/services/correiosInternalScraper.js
export class CorreiosInternalScraper {
  constructor() {
    this.baseUrl = 'https://buscacepintra.correios.com.br';
    this.cache = new Map();
  }

  async searchCEP(cep) {
    if (this.cache.has(cep)) {
      return this.cache.get(cep);
    }

    try {
      const response = await fetch(`${this.baseUrl}/app/endereco/index.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `endereco=${cep}&btn_pesquisar=Pesquisar`
      });

      const html = await response.text();
      const data = this.parseHTML(html);
      
      if (data) {
        this.cache.set(cep, data);
      }
      
      return data;
    } catch (error) {
      console.error('Erro ao buscar CEP na rede interna:', error);
      return null;
    }
  }

  parseHTML(html) {
    // Parser específico para extrair dados da página dos Correios
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Lógica de extração baseada na estrutura da página interna
    const logradouro = doc.querySelector('[data-field="logradouro"]')?.textContent?.trim();
    const bairro = doc.querySelector('[data-field="bairro"]')?.textContent?.trim();
    const cidade = doc.querySelector('[data-field="cidade"]')?.textContent?.trim();
    const estado = doc.querySelector('[data-field="uf"]')?.textContent?.trim();
    
    if (logradouro && cidade) {
      return {
        logradouro,
        bairro: bairro || '',
        cidade,
        estado: estado || 'MG',
        complemento: '',
        fonte: 'rede-interna'
      };
    }
    
    return null;
  }
}
```

### **3. Modificar useAddressSearch.js**

```javascript
// Adicionar no início do arquivo
import { NetworkDetector } from '../services/networkDetector';
import { CorreiosInternalScraper } from '../services/correiosInternalScraper';

export function useAddressSearch() {
  // Estados existentes...
  const [networkType, setNetworkType] = useState('unknown'); // 'internal', 'external', 'unknown'
  const [internalScraper, setInternalScraper] = useState(null);

  // Detectar tipo de rede na inicialização
  useEffect(() => {
    async function detectNetwork() {
      const isInternal = await NetworkDetector.isInternalNetwork();
      setNetworkType(isInternal ? 'internal' : 'external');
      
      if (isInternal) {
        setInternalScraper(new CorreiosInternalScraper());
        console.log('🔴 Rede interna dos Correios detectada - usando base completa');
      } else {
        console.log('🌐 Rede externa detectada - usando ViaCEP + cache local');
      }
    }
    
    detectNetwork();
  }, []);

  // Função de busca híbrida
  const searchWithHybridStrategy = async (term) => {
    if (networkType === 'internal' && internalScraper) {
      // Estratégia 1: Rede interna - busca em tempo real
      return await searchInInternalNetwork(term);
    } else {
      // Estratégia 2: Rede externa - usar cache local + ViaCEP
      return searchInLocalCache(term);
    }
  };

  const searchInInternalNetwork = async (term) => {
    // Implementar busca na rede interna
    // Pode fazer múltiplas consultas para diferentes padrões de CEP
    const results = [];
    
    // Se o termo parece um CEP, buscar diretamente
    if (/^\d{5}-?\d{3}$/.test(term)) {
      const result = await internalScraper.searchCEP(term);
      if (result) results.push(result);
    }
    
    // Implementar outras estratégias de busca...
    return results;
  };
}
```

---

## 🚀 **ESTRATÉGIAS DE BUSCA NA REDE INTERNA**

### **A. Busca por CEP Direto**
```javascript
// Quando usuário digita CEP completo
if (/^\d{5}-?\d{3}$/.test(searchTerm)) {
  const result = await internalScraper.searchCEP(searchTerm);
  return result ? [result] : [];
}
```

### **B. Busca por Faixa de CEPs**
```javascript
// Para termos como "Uberlândia", gerar CEPs conhecidos da cidade
const knownRanges = {
  'uberlandia': ['38400-000', '38420-999'],
  'belo horizonte': ['30000-000', '32999-999']
};

if (knownRanges[searchTerm.toLowerCase()]) {
  return await searchCEPRange(knownRanges[searchTerm.toLowerCase()]);
}
```

### **C. Busca por Logradouro**
```javascript
// Usar endpoint de busca por logradouro
const searchByStreet = async (street, city) => {
  const response = await fetch(`${baseUrl}/app/localidade_logradouro/index.php`, {
    method: 'POST',
    body: `localidade=${city}&logradouro=${street}&btn_pesquisar=Pesquisar`
  });
  // Parser específico para resultados de logradouro
};
```

---

## 📊 **CONFIGURAÇÃO DE CACHE INTELIGENTE**

```javascript
// src/services/smartCache.js
export class SmartCache {
  constructor() {
    this.memoryCache = new Map();
    this.localStorageKey = 'correios-cache';
    this.maxAge = 24 * 60 * 60 * 1000; // 24 horas
  }

  set(key, data, source = 'unknown') {
    const entry = {
      data,
      timestamp: Date.now(),
      source,
      hits: 0
    };
    
    this.memoryCache.set(key, entry);
    this.saveToLocalStorage(key, entry);
  }

  get(key) {
    let entry = this.memoryCache.get(key);
    
    if (!entry) {
      entry = this.loadFromLocalStorage(key);
      if (entry) {
        this.memoryCache.set(key, entry);
      }
    }
    
    if (entry && !this.isExpired(entry)) {
      entry.hits++;
      return entry.data;
    }
    
    return null;
  }

  isExpired(entry) {
    return Date.now() - entry.timestamp > this.maxAge;
  }
}
```

---

## 🎯 **INDICADORES VISUAIS PARA O USUÁRIO**

```javascript
// Adicionar no componente
const getDataSourceIndicator = () => {
  switch (networkType) {
    case 'internal':
      return (
        <div className="flex items-center text-green-600 text-sm">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
          Base Completa dos Correios (Rede Interna)
        </div>
      );
    case 'external':
      return (
        <div className="flex items-center text-blue-600 text-sm">
          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
          ViaCEP + Cache Local
        </div>
      );
    default:
      return (
        <div className="flex items-center text-gray-600 text-sm">
          <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
          Detectando rede...
        </div>
      );
  }
};
```

---

## ⚡ **OTIMIZAÇÕES DE PERFORMANCE**

### **1. Rate Limiting Inteligente**
```javascript
class RateLimiter {
  constructor(requestsPerSecond = 2) {
    this.requests = [];
    this.maxRequests = requestsPerSecond;
  }

  async throttle() {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < 1000);
    
    if (this.requests.length >= this.maxRequests) {
      const waitTime = 1000 - (now - this.requests[0]);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.requests.push(now);
  }
}
```

### **2. Busca Preditiva**
```javascript
// Pré-carregar CEPs baseado no padrão de uso
const predictiveLoader = {
  async preloadCommonCEPs(city) {
    const commonPatterns = this.getCommonPatterns(city);
    for (const pattern of commonPatterns) {
      await this.loadCEPRange(pattern.start, pattern.end, 10);
    }
  }
};
```

---

## 🔧 **IMPLEMENTAÇÃO GRADUAL**

### **Fase 1: Detecção de Rede**
- [ ] Implementar `NetworkDetector`
- [ ] Adicionar indicador visual de fonte de dados
- [ ] Testar detecção automática

### **Fase 2: Scraper Básico**
- [ ] Implementar `CorreiosInternalScraper`
- [ ] Busca por CEP direto
- [ ] Cache em memória

### **Fase 3: Busca Avançada**
- [ ] Busca por logradouro
- [ ] Busca por faixa de CEPs
- [ ] Cache persistente

### **Fase 4: Otimizações**
- [ ] Rate limiting
- [ ] Busca preditiva
- [ ] Métricas de performance

---

## 🚨 **CONSIDERAÇÕES IMPORTANTES**

1. **Compliance:** Verificar políticas de uso da rede interna
2. **Rate Limiting:** Não sobrecarregar os servidores internos
3. **Fallback:** Sempre ter alternativa se rede interna falhar
4. **Cache:** Armazenar resultados para reduzir requisições
5. **Monitoramento:** Logs para acompanhar performance e erros

---

## 📝 **PRÓXIMOS PASSOS**

1. **Testar conectividade** na rede interna dos Correios
2. **Analisar estrutura HTML** das páginas de resultado
3. **Implementar parser** específico para cada tipo de busca
4. **Criar testes** para validar funcionamento
5. **Documentar APIs** internas descobertas

**🎯 Esta implementação dará acesso à base COMPLETA e mais atualizada do Brasil quando rodando na rede dos Correios!**
