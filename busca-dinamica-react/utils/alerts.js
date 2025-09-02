// Sistema de Alertas Automáticos
const { logger } = require('./advancedLogger');
const { metricsCollector } = require('./metrics');

class AlertSystem {
  constructor() {
    this.alerts = [];
    this.rules = [
      // Regras de performance
      {
        name: 'high_response_time',
        condition: (metrics) => {
          const avgResponseTime = metrics.application.performance.avgResponseTime;
          return avgResponseTime > 2000; // Mais de 2 segundos
        },
        message: 'Tempo de resposta alto detectado',
        severity: 'warning',
        cooldown: 5 * 60 * 1000 // 5 minutos
      },
      
      {
        name: 'high_error_rate',
        condition: (metrics) => {
          const errorRate = parseFloat(metrics.application.requests.successRate);
          return errorRate < 95; // Menos de 95% de sucesso
        },
        message: 'Taxa de erro alta detectada',
        severity: 'critical',
        cooldown: 2 * 60 * 1000 // 2 minutos
      },
      
      {
        name: 'high_cpu_usage',
        condition: (metrics) => {
          const cpuUsage = metrics.system.cpu.current;
          return cpuUsage > 80; // Mais de 80% de CPU
        },
        message: 'Uso de CPU alto detectado',
        severity: 'warning',
        cooldown: 3 * 60 * 1000 // 3 minutos
      },
      
      {
        name: 'high_memory_usage',
        condition: (metrics) => {
          const memUsage = metrics.system.memory.current;
          const heapUsed = memUsage.heapUsed;
          const heapTotal = memUsage.heapTotal;
          const usagePercent = (heapUsed / heapTotal) * 100;
          return usagePercent > 85; // Mais de 85% de memória
        },
        message: 'Uso de memória alto detectado',
        severity: 'warning',
        cooldown: 3 * 60 * 1000 // 3 minutos
      },
      
      // Regras de segurança
      {
        name: 'security_attack_detected',
        condition: (metrics) => {
          const recentAttacks = metrics.security.attacks.total;
          return recentAttacks > 10; // Mais de 10 ataques
        },
        message: 'Múltiplos ataques de segurança detectados',
        severity: 'critical',
        cooldown: 1 * 60 * 1000 // 1 minuto
      },
      
      {
        name: 'rate_limit_exceeded',
        condition: (metrics) => {
          const rateLimits = metrics.security.rateLimits.total;
          return rateLimits > 50; // Mais de 50 rate limits
        },
        message: 'Múltiplos rate limits excedidos',
        severity: 'warning',
        cooldown: 2 * 60 * 1000 // 2 minutos
      },
      
      // Regras de negócio
      {
        name: 'low_search_success_rate',
        condition: (metrics) => {
          const searchSuccessRate = parseFloat(metrics.business.searches.successRate);
          return searchSuccessRate < 80; // Menos de 80% de sucesso nas buscas
        },
        message: 'Taxa de sucesso nas buscas baixa',
        severity: 'warning',
        cooldown: 5 * 60 * 1000 // 5 minutos
      },
      
      {
        name: 'no_user_activity',
        condition: (metrics) => {
          const activeUsers = metrics.business.users.active;
          return activeUsers === 0; // Nenhum usuário ativo
        },
        message: 'Nenhum usuário ativo detectado',
        severity: 'info',
        cooldown: 30 * 60 * 1000 // 30 minutos
      }
    ];
    
    this.lastAlertTimes = {};
    this.isRunning = false;
  }
  
  // Iniciar sistema de alertas
  start() {
    if (this.isRunning) {
      return;
    }
    
    this.isRunning = true;
    logger.info('ALERT_SYSTEM_STARTED', { timestamp: new Date().toISOString() });
    
    // Verificar alertas a cada 30 segundos
    setInterval(() => {
      this.checkAlerts();
    }, 30 * 1000);
  }
  
  // Parar sistema de alertas
  stop() {
    this.isRunning = false;
    logger.info('ALERT_SYSTEM_STOPPED', { timestamp: new Date().toISOString() });
  }
  
  // Verificar alertas
  checkAlerts() {
    if (!this.isRunning) {
      return;
    }
    
    try {
      const metrics = metricsCollector.getSummary();
      const now = Date.now();
      
      for (const rule of this.rules) {
        const lastAlertTime = this.lastAlertTimes[rule.name] || 0;
        const timeSinceLastAlert = now - lastAlertTime;
        
        // Verificar se passou tempo suficiente desde o último alerta
        if (timeSinceLastAlert < rule.cooldown) {
          continue;
        }
        
        // Verificar condição
        if (rule.condition(metrics)) {
          this.triggerAlert(rule, metrics);
          this.lastAlertTimes[rule.name] = now;
        }
      }
    } catch (error) {
      logger.error('ALERT_CHECK_ERROR', { error: error.message });
    }
  }
  
  // Disparar alerta
  triggerAlert(rule, metrics) {
    const alert = {
      id: `${rule.name}_${Date.now()}`,
      name: rule.name,
      message: rule.message,
      severity: rule.severity,
      timestamp: new Date().toISOString(),
      metrics: metrics
    };
    
    // Adicionar à lista de alertas
    this.alerts.push(alert);
    
    // Manter apenas últimos 100 alertas
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }
    
    // Log do alerta
    logger.warn('ALERT_TRIGGERED', alert);
    
    // Executar ações baseadas na severidade
    this.executeAlertActions(alert);
  }
  
  // Executar ações do alerta
  executeAlertActions(alert) {
    switch (alert.severity) {
      case 'critical':
        this.handleCriticalAlert(alert);
        break;
      case 'warning':
        this.handleWarningAlert(alert);
        break;
      case 'info':
        this.handleInfoAlert(alert);
        break;
    }
  }
  
  // Tratar alerta crítico
  handleCriticalAlert(alert) {
    // Log crítico
    logger.error('CRITICAL_ALERT', alert);
    
    // Aqui você pode adicionar:
    // - Notificação por email
    // - Notificação por Slack/Discord
    // - Restart automático de serviços
    // - Escalação para equipe
    
    console.error(`🚨 ALERTA CRÍTICO: ${alert.message}`);
  }
  
  // Tratar alerta de aviso
  handleWarningAlert(alert) {
    // Log de aviso
    logger.warn('WARNING_ALERT', alert);
    
    // Aqui você pode adicionar:
    // - Notificação por email
    // - Log detalhado
    // - Monitoramento adicional
    
    console.warn(`⚠️ ALERTA: ${alert.message}`);
  }
  
  // Tratar alerta informativo
  handleInfoAlert(alert) {
    // Log informativo
    logger.info('INFO_ALERT', alert);
    
    // Aqui você pode adicionar:
    // - Log simples
    // - Métricas adicionais
    
    console.info(`ℹ️ INFO: ${alert.message}`);
  }
  
  // Adicionar regra personalizada
  addRule(rule) {
    this.rules.push(rule);
    logger.info('ALERT_RULE_ADDED', { rule: rule.name });
  }
  
  // Remover regra
  removeRule(ruleName) {
    const index = this.rules.findIndex(rule => rule.name === ruleName);
    if (index !== -1) {
      this.rules.splice(index, 1);
      logger.info('ALERT_RULE_REMOVED', { rule: ruleName });
    }
  }
  
  // Obter alertas recentes
  getRecentAlerts(limit = 10) {
    return this.alerts.slice(-limit).reverse();
  }
  
  // Obter alertas por severidade
  getAlertsBySeverity(severity) {
    return this.alerts.filter(alert => alert.severity === severity);
  }
  
  // Obter estatísticas de alertas
  getAlertStats() {
    const stats = {
      total: this.alerts.length,
      bySeverity: {
        critical: 0,
        warning: 0,
        info: 0
      },
      recent: this.alerts.filter(alert => {
        const alertTime = new Date(alert.timestamp).getTime();
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        return alertTime > oneHourAgo;
      }).length
    };
    
    for (const alert of this.alerts) {
      stats.bySeverity[alert.severity]++;
    }
    
    return stats;
  }
  
  // Limpar alertas antigos
  cleanupOldAlerts(maxAge = 7 * 24 * 60 * 60 * 1000) { // 7 dias
    const cutoffTime = Date.now() - maxAge;
    this.alerts = this.alerts.filter(alert => {
      const alertTime = new Date(alert.timestamp).getTime();
      return alertTime > cutoffTime;
    });
    
    logger.info('ALERTS_CLEANUP', { 
      removed: this.alerts.length,
      maxAge: maxAge 
    });
  }
  
  // Testar regra
  testRule(ruleName) {
    const rule = this.rules.find(r => r.name === ruleName);
    if (!rule) {
      throw new Error(`Regra não encontrada: ${ruleName}`);
    }
    
    const metrics = metricsCollector.getSummary();
    return rule.condition(metrics);
  }
  
  // Obter status do sistema
  getStatus() {
    return {
      isRunning: this.isRunning,
      rulesCount: this.rules.length,
      alertsCount: this.alerts.length,
      lastCheck: new Date().toISOString(),
      stats: this.getAlertStats()
    };
  }
}

// Instância global
const alertSystem = new AlertSystem();

// Iniciar sistema automaticamente em produção
if (process.env.NODE_ENV === 'production') {
  alertSystem.start();
}

module.exports = {
  AlertSystem,
  alertSystem
};
