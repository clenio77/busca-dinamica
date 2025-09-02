const express = require('express');
const router = express.Router();
const os = require('os');
const { getDatabase } = require('../database/postgres-init');

// Função para verificar saúde do banco de dados
async function checkDatabaseHealth() {
  try {
    const db = await getDatabase();
    await db.query('SELECT 1');
    return { status: 'healthy', responseTime: Date.now() };
  } catch (error) {
    return { 
      status: 'unhealthy', 
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// Função para obter métricas do sistema
function getSystemMetrics() {
  const memUsage = process.memoryUsage();
  const uptime = process.uptime();
  
  return {
    memory: {
      rss: Math.round(memUsage.rss / 1024 / 1024), // MB
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
      external: Math.round(memUsage.external / 1024 / 1024) // MB
    },
    cpu: {
      uptime: Math.round(uptime), // segundos
      loadAverage: os.loadavg(),
      platform: os.platform(),
      arch: os.arch()
    },
    process: {
      pid: process.pid,
      version: process.version,
      nodeEnv: process.env.NODE_ENV || 'development'
    }
  };
}

// Health check básico
router.get('/', async (req, res) => {
  const startTime = Date.now();
  
  try {
    // Verificar banco de dados
    const dbHealth = await checkDatabaseHealth();
    
    // Obter métricas do sistema
    const systemMetrics = getSystemMetrics();
    
    const responseTime = Date.now() - startTime;
    
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      responseTime: `${responseTime}ms`,
      database: dbHealth,
      system: systemMetrics,
      version: process.env.npm_package_version || '0.2.0'
    };

    // Se o banco estiver unhealthy, retornar 503
    if (dbHealth.status === 'unhealthy') {
      healthStatus.status = 'degraded';
      return res.status(503).json(healthStatus);
    }

    res.status(200).json(healthStatus);
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      responseTime: `${responseTime}ms`
    });
  }
});

// Health check detalhado
router.get('/detailed', async (req, res) => {
  const startTime = Date.now();
  
  try {
    // Verificar banco de dados
    const dbHealth = await checkDatabaseHealth();
    
    // Obter métricas do sistema
    const systemMetrics = getSystemMetrics();
    
    // Verificar conectividade com APIs externas (se houver)
    const externalServices = {
      status: 'healthy',
      checks: []
    };

    // Verificar se o sistema está respondendo
    const responseTime = Date.now() - startTime;
    
    const detailedHealth = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      responseTime: `${responseTime}ms`,
      database: dbHealth,
      system: systemMetrics,
      externalServices,
      version: process.env.npm_package_version || '0.2.0',
      environment: process.env.NODE_ENV || 'development'
    };

    // Determinar status geral
    if (dbHealth.status === 'unhealthy') {
      detailedHealth.status = 'degraded';
    }

    const statusCode = detailedHealth.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(detailedHealth);
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      responseTime: `${responseTime}ms`,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Health check simples para load balancers
router.get('/ping', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Health check para readiness (pronto para receber tráfego)
router.get('/ready', async (req, res) => {
  try {
    const dbHealth = await checkDatabaseHealth();
    
    if (dbHealth.status === 'healthy') {
      res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        status: 'not_ready',
        reason: 'Database connection failed',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'not_ready',
      reason: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Health check para liveness (aplicação está rodando)
router.get('/live', (req, res) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    pid: process.pid
  });
});

module.exports = router;
