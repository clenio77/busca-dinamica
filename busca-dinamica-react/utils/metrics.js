// Sistema de Métricas em Tempo Real
const os = require('os');

class MetricsCollector {
  constructor() {
    this.metrics = {
      // Métricas de sistema
      system: {
        cpu: [],
        memory: [],
        uptime: [],
        loadAverage: []
      },
      
      // Métricas de aplicação
      application: {
        requests: {
          total: 0,
          success: 0,
          error: 0,
          byMethod: {},
          byEndpoint: {}
        },
        performance: {
          responseTime: [],
          searchTime: [],
          databaseTime: []
        },
        errors: {
          total: 0,
          byType: {},
          recent: []
        }
      },
      
      // Métricas de negócio
      business: {
        searches: {
          total: 0,
          successful: 0,
          failed: 0,
          byCity: {},
          byState: {}
        },
        users: {
          active: 0,
          unique: new Set(),
          sessions: []
        },
        content: {
          addresses: 0,
          cities: 0,
          states: 0
        }
      },
      
      // Métricas de segurança
      security: {
        attacks: {
          total: 0,
          byType: {},
          blocked: 0
        },
        rateLimits: {
          total: 0,
          byIP: {},
          byEndpoint: {}
        }
      }
    };
    
    this.startTime = Date.now();
    this.lastUpdate = Date.now();
    
    // Iniciar coleta automática
    this.startCollection();
  }
  
  // Coletar métricas do sistema
  collectSystemMetrics() {
    const cpuUsage = os.loadavg();
    const memUsage = process.memoryUsage();
    const uptime = process.uptime();
    
    this.metrics.system.cpu.push({
      timestamp: Date.now(),
      load1: cpuUsage[0],
      load5: cpuUsage[1],
      load15: cpuUsage[2]
    });
    
    this.metrics.system.memory.push({
      timestamp: Date.now(),
      rss: memUsage.rss,
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      external: memUsage.external
    });
    
    this.metrics.system.uptime.push({
      timestamp: Date.now(),
      uptime: uptime
    });
    
    // Manter apenas últimas 100 medições
    this.trimMetrics('system.cpu', 100);
    this.trimMetrics('system.memory', 100);
    this.trimMetrics('system.uptime', 100);
  }
  
  // Registrar requisição
  recordRequest(method, endpoint, statusCode, duration) {
    this.metrics.application.requests.total++;
    
    if (statusCode < 400) {
      this.metrics.application.requests.success++;
    } else {
      this.metrics.application.requests.error++;
    }
    
    // Métricas por método
    if (!this.metrics.application.requests.byMethod[method]) {
      this.metrics.application.requests.byMethod[method] = 0;
    }
    this.metrics.application.requests.byMethod[method]++;
    
    // Métricas por endpoint
    if (!this.metrics.application.requests.byEndpoint[endpoint]) {
      this.metrics.application.requests.byEndpoint[endpoint] = {
        total: 0,
        success: 0,
        error: 0,
        avgDuration: 0
      };
    }
    
    const endpointMetrics = this.metrics.application.requests.byEndpoint[endpoint];
    endpointMetrics.total++;
    
    if (statusCode < 400) {
      endpointMetrics.success++;
    } else {
      endpointMetrics.error++;
    }
    
    // Calcular duração média
    endpointMetrics.avgDuration = 
      (endpointMetrics.avgDuration * (endpointMetrics.total - 1) + duration) / endpointMetrics.total;
    
    // Registrar tempo de resposta
    this.metrics.application.performance.responseTime.push({
      timestamp: Date.now(),
      duration,
      method,
      endpoint,
      statusCode
    });
    
    this.trimMetrics('application.performance.responseTime', 1000);
  }
  
  // Registrar busca
  recordSearch(searchTerm, city, state, success, duration) {
    this.metrics.business.searches.total++;
    
    if (success) {
      this.metrics.business.searches.successful++;
    } else {
      this.metrics.business.searches.failed++;
    }
    
    // Métricas por cidade
    if (city) {
      if (!this.metrics.business.searches.byCity[city]) {
        this.metrics.business.searches.byCity[city] = 0;
      }
      this.metrics.business.searches.byCity[city]++;
    }
    
    // Métricas por estado
    if (state) {
      if (!this.metrics.business.searches.byState[state]) {
        this.metrics.business.searches.byState[state] = 0;
      }
      this.metrics.business.searches.byState[state]++;
    }
    
    // Registrar tempo de busca
    this.metrics.application.performance.searchTime.push({
      timestamp: Date.now(),
      duration,
      searchTerm,
      city,
      state,
      success
    });
    
    this.trimMetrics('application.performance.searchTime', 1000);
  }
  
  // Registrar erro
  recordError(error, context = {}) {
    this.metrics.application.errors.total++;
    
    const errorType = error.name || 'Unknown';
    if (!this.metrics.application.errors.byType[errorType]) {
      this.metrics.application.errors.byType[errorType] = 0;
    }
    this.metrics.application.errors.byType[errorType]++;
    
    // Registrar erro recente
    this.metrics.application.errors.recent.push({
      timestamp: Date.now(),
      type: errorType,
      message: error.message,
      stack: error.stack,
      context
    });
    
    // Manter apenas últimos 100 erros
    if (this.metrics.application.errors.recent.length > 100) {
      this.metrics.application.errors.recent = this.metrics.application.errors.recent.slice(-100);
    }
  }
  
  // Registrar ataque de segurança
  recordSecurityAttack(type, details = {}) {
    this.metrics.security.attacks.total++;
    
    if (!this.metrics.security.attacks.byType[type]) {
      this.metrics.security.attacks.byType[type] = 0;
    }
    this.metrics.security.attacks.byType[type]++;
    
    if (details.blocked) {
      this.metrics.security.attacks.blocked++;
    }
  }
  
  // Registrar rate limit
  recordRateLimit(endpoint, ip) {
    this.metrics.security.rateLimits.total++;
    
    if (!this.metrics.security.rateLimits.byEndpoint[endpoint]) {
      this.metrics.security.rateLimits.byEndpoint[endpoint] = 0;
    }
    this.metrics.security.rateLimits.byEndpoint[endpoint]++;
    
    if (!this.metrics.security.rateLimits.byIP[ip]) {
      this.metrics.security.rateLimits.byIP[ip] = 0;
    }
    this.metrics.security.rateLimits.byIP[ip]++;
  }
  
  // Registrar usuário ativo
  recordUserActivity(userId, sessionId) {
    this.metrics.business.users.unique.add(userId);
    this.metrics.business.users.active++;
    
    this.metrics.business.users.sessions.push({
      timestamp: Date.now(),
      userId,
      sessionId
    });
    
    // Manter apenas sessões das últimas 24 horas
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    this.metrics.business.users.sessions = 
      this.metrics.business.users.sessions.filter(session => session.timestamp > oneDayAgo);
  }
  
  // Atualizar conteúdo
  updateContentMetrics(addresses, cities, states) {
    this.metrics.business.content.addresses = addresses;
    this.metrics.business.content.cities = cities;
    this.metrics.business.content.states = states;
  }
  
  // Obter métricas resumidas
  getSummary() {
    const now = Date.now();
    const uptime = now - this.startTime;
    
    // Calcular médias de performance
    const responseTimes = this.metrics.application.performance.responseTime;
    const avgResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, rt) => sum + rt.duration, 0) / responseTimes.length 
      : 0;
    
    const searchTimes = this.metrics.application.performance.searchTime;
    const avgSearchTime = searchTimes.length > 0 
      ? searchTimes.reduce((sum, st) => sum + st.duration, 0) / searchTimes.length 
      : 0;
    
    // Calcular métricas de sistema
    const recentCPU = this.metrics.system.cpu.slice(-10);
    const avgCPU = recentCPU.length > 0 
      ? recentCPU.reduce((sum, cpu) => sum + cpu.load1, 0) / recentCPU.length 
      : 0;
    
    const recentMemory = this.metrics.system.memory.slice(-10);
    const avgMemory = recentMemory.length > 0 
      ? recentMemory.reduce((sum, mem) => sum + mem.heapUsed, 0) / recentMemory.length 
      : 0;
    
    return {
      uptime: {
        total: uptime,
        formatted: this.formatUptime(uptime)
      },
      system: {
        cpu: {
          current: os.loadavg()[0],
          average: avgCPU
        },
        memory: {
          current: process.memoryUsage(),
          average: avgMemory
        }
      },
      application: {
        requests: {
          total: this.metrics.application.requests.total,
          success: this.metrics.application.requests.success,
          error: this.metrics.application.requests.error,
          successRate: this.metrics.application.requests.total > 0 
            ? (this.metrics.application.requests.success / this.metrics.application.requests.total * 100).toFixed(2)
            : 0
        },
        performance: {
          avgResponseTime: Math.round(avgResponseTime),
          avgSearchTime: Math.round(avgSearchTime)
        },
        errors: {
          total: this.metrics.application.errors.total,
          recent: this.metrics.application.errors.recent.length
        }
      },
      business: {
        searches: {
          total: this.metrics.business.searches.total,
          successful: this.metrics.business.searches.successful,
          failed: this.metrics.business.searches.failed,
          successRate: this.metrics.business.searches.total > 0 
            ? (this.metrics.business.searches.successful / this.metrics.business.searches.total * 100).toFixed(2)
            : 0
        },
        users: {
          unique: this.metrics.business.users.unique.size,
          active: this.metrics.business.users.active
        },
        content: this.metrics.business.content
      },
      security: {
        attacks: {
          total: this.metrics.security.attacks.total,
          blocked: this.metrics.security.attacks.blocked,
          blockRate: this.metrics.security.attacks.total > 0 
            ? (this.metrics.security.attacks.blocked / this.metrics.security.attacks.total * 100).toFixed(2)
            : 0
        },
        rateLimits: {
          total: this.metrics.security.rateLimits.total
        }
      }
    };
  }
  
  // Obter métricas detalhadas
  getDetailedMetrics() {
    return {
      ...this.metrics,
      summary: this.getSummary()
    };
  }
  
  // Limpar métricas antigas
  trimMetrics(path, maxLength) {
    const pathParts = path.split('.');
    let current = this.metrics;
    
    for (let i = 0; i < pathParts.length - 1; i++) {
      current = current[pathParts[i]];
    }
    
    const lastPart = pathParts[pathParts.length - 1];
    if (Array.isArray(current[lastPart]) && current[lastPart].length > maxLength) {
      current[lastPart] = current[lastPart].slice(-maxLength);
    }
  }
  
  // Formatar uptime
  formatUptime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    return `${days}d ${hours % 24}h ${minutes % 60}m ${seconds % 60}s`;
  }
  
  // Iniciar coleta automática
  startCollection() {
    setInterval(() => {
      this.collectSystemMetrics();
      this.lastUpdate = Date.now();
    }, 5000); // Coletar a cada 5 segundos
  }
  
  // Resetar métricas
  reset() {
    this.metrics = {
      system: { cpu: [], memory: [], uptime: [], loadAverage: [] },
      application: {
        requests: { total: 0, success: 0, error: 0, byMethod: {}, byEndpoint: {} },
        performance: { responseTime: [], searchTime: [], databaseTime: [] },
        errors: { total: 0, byType: {}, recent: [] }
      },
      business: {
        searches: { total: 0, successful: 0, failed: 0, byCity: {}, byState: {} },
        users: { active: 0, unique: new Set(), sessions: [] },
        content: { addresses: 0, cities: 0, states: 0 }
      },
      security: {
        attacks: { total: 0, byType: {}, blocked: 0 },
        rateLimits: { total: 0, byIP: {}, byEndpoint: {} }
      }
    };
    this.startTime = Date.now();
  }
}

// Instância global
const metricsCollector = new MetricsCollector();

module.exports = {
  MetricsCollector,
  metricsCollector
};
