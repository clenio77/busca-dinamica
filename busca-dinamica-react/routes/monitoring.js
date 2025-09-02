// Rotas de Monitoramento e Métricas
const express = require('express');
const router = express.Router();
const { metricsCollector } = require('../utils/metrics');
const { alertSystem } = require('../utils/alerts');
const { logger } = require('../utils/advancedLogger');

// Middleware de autenticação básica para rotas de monitoramento
const basicAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Monitoring"');
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const credentials = Buffer.from(authHeader.split(' ')[1], 'base64').toString();
  const [username, password] = credentials.split(':');
  
  // Verificar credenciais (você pode usar variáveis de ambiente)
  const expectedUsername = process.env.MONITORING_USERNAME || 'admin';
  const expectedPassword = process.env.MONITORING_PASSWORD || 'monitoring123';
  
  if (username === expectedUsername && password === expectedPassword) {
    next();
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
};

// Rota principal de monitoramento
router.get('/', basicAuth, (req, res) => {
  try {
    const summary = metricsCollector.getSummary();
    const alertStatus = alertSystem.getStatus();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: summary.uptime,
      system: summary.system,
      application: summary.application,
      business: summary.business,
      security: summary.security,
      alerts: alertStatus
    });
  } catch (error) {
    logger.error('MONITORING_ERROR', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Métricas resumidas
router.get('/metrics', basicAuth, (req, res) => {
  try {
    const summary = metricsCollector.getSummary();
    res.json(summary);
  } catch (error) {
    logger.error('METRICS_ERROR', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Métricas detalhadas
router.get('/metrics/detailed', basicAuth, (req, res) => {
  try {
    const detailedMetrics = metricsCollector.getDetailedMetrics();
    res.json(detailedMetrics);
  } catch (error) {
    logger.error('DETAILED_METRICS_ERROR', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Alertas recentes
router.get('/alerts', basicAuth, (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const alerts = alertSystem.getRecentAlerts(limit);
    res.json(alerts);
  } catch (error) {
    logger.error('ALERTS_ERROR', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Alertas por severidade
router.get('/alerts/:severity', basicAuth, (req, res) => {
  try {
    const { severity } = req.params;
    const alerts = alertSystem.getAlertsBySeverity(severity);
    res.json(alerts);
  } catch (error) {
    logger.error('ALERTS_BY_SEVERITY_ERROR', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Estatísticas de alertas
router.get('/alerts/stats', basicAuth, (req, res) => {
  try {
    const stats = alertSystem.getAlertStats();
    res.json(stats);
  } catch (error) {
    logger.error('ALERT_STATS_ERROR', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Status do sistema de alertas
router.get('/alerts/status', basicAuth, (req, res) => {
  try {
    const status = alertSystem.getStatus();
    res.json(status);
  } catch (error) {
    logger.error('ALERT_STATUS_ERROR', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Controlar sistema de alertas
router.post('/alerts/control', basicAuth, (req, res) => {
  try {
    const { action } = req.body;
    
    switch (action) {
      case 'start':
        alertSystem.start();
        res.json({ message: 'Alert system started' });
        break;
      case 'stop':
        alertSystem.stop();
        res.json({ message: 'Alert system stopped' });
        break;
      case 'reset':
        metricsCollector.reset();
        res.json({ message: 'Metrics reset' });
        break;
      case 'cleanup':
        alertSystem.cleanupOldAlerts();
        res.json({ message: 'Old alerts cleaned up' });
        break;
      default:
        res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    logger.error('ALERT_CONTROL_ERROR', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Testar regra de alerta
router.post('/alerts/test', basicAuth, (req, res) => {
  try {
    const { ruleName } = req.body;
    
    if (!ruleName) {
      return res.status(400).json({ error: 'Rule name required' });
    }
    
    const isTriggered = alertSystem.testRule(ruleName);
    res.json({ ruleName, isTriggered });
  } catch (error) {
    logger.error('ALERT_TEST_ERROR', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// Adicionar regra personalizada
router.post('/alerts/rules', basicAuth, (req, res) => {
  try {
    const { name, condition, message, severity, cooldown } = req.body;
    
    if (!name || !condition || !message || !severity) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const rule = {
      name,
      condition: new Function('metrics', condition), // ⚠️ Cuidado com segurança
      message,
      severity,
      cooldown: cooldown || 5 * 60 * 1000
    };
    
    alertSystem.addRule(rule);
    res.json({ message: 'Rule added successfully' });
  } catch (error) {
    logger.error('ADD_RULE_ERROR', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remover regra
router.delete('/alerts/rules/:ruleName', basicAuth, (req, res) => {
  try {
    const { ruleName } = req.params;
    alertSystem.removeRule(ruleName);
    res.json({ message: 'Rule removed successfully' });
  } catch (error) {
    logger.error('REMOVE_RULE_ERROR', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check específico para monitoramento
router.get('/health', (req, res) => {
  try {
    const summary = metricsCollector.getSummary();
    const alertStatus = alertSystem.getStatus();
    
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: summary.uptime.formatted,
      system: {
        cpu: summary.system.cpu.current,
        memory: Math.round(summary.system.memory.current.heapUsed / 1024 / 1024) + 'MB'
      },
      application: {
        requests: summary.application.requests.total,
        successRate: summary.application.requests.successRate + '%',
        avgResponseTime: summary.application.performance.avgResponseTime + 'ms'
      },
      alerts: {
        total: alertStatus.alertsCount,
        recent: alertStatus.stats.recent
      }
    };
    
    res.json(healthStatus);
  } catch (error) {
    logger.error('MONITORING_HEALTH_ERROR', { error: error.message });
    res.status(500).json({ 
      status: 'unhealthy',
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

// Logs recentes (apenas em desenvolvimento)
router.get('/logs', basicAuth, (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ error: 'Logs endpoint only available in development' });
  }
  
  try {
    const fs = require('fs');
    const path = require('path');
    
    const logType = req.query.type || 'application';
    const logFile = path.join(__dirname, '..', 'logs', `${logType}-${new Date().toISOString().split('T')[0]}.log`);
    
    if (!fs.existsSync(logFile)) {
      return res.json({ logs: [], message: 'No logs found for today' });
    }
    
    const logs = fs.readFileSync(logFile, 'utf8')
      .split('\n')
      .filter(line => line.trim())
      .slice(-100) // Últimas 100 linhas
      .reverse();
    
    res.json({ logs });
  } catch (error) {
    logger.error('LOGS_ERROR', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
