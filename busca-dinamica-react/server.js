/* eslint-env node */
const express = require('express');
const path = require('path');
require('dotenv').config();

// Importar middlewares de segurança
const {
  generalLimiter,
  searchLimiter,
  adminLimiter,
  corsOptions,
  inputValidation,
  securityHeaders,
  auditMiddleware,
  validateCepFormat,
  bruteForceProtection,
  sanitizeInput
} = require('./middleware/security');

// Novos middlewares de segurança avançada
const { cspMiddleware, cspReportMiddleware } = require('./middleware/csp');
const { 
  sanitizeAll, 
  attackDetection, 
  validateCEP, 
  validateCity, 
  validateState, 
  validateSearchTerm 
} = require('./middleware/sanitization');
const { 
  createRateLimiters, 
  dynamicRateLimit, 
  routeSpecificRateLimit, 
  rateLimitMonitor 
} = require('./middleware/rateLimit');

// Importar sistema de logs
const { 
  logger, 
  expressLogger, 
  logError, 
  logPerformance,
  logBusiness 
} = require('./utils/logger');

// Importar rotas
const cepRoutes = require('./routes/cep');
const adminRoutes = require('./routes/admin');
const healthRoutes = require('./routes/health');
const monitoringRoutes = require('./routes/monitoring');

// Importar serviços
const { initDatabase } = require('./database/init');
const { startWeeklyUpdate } = require('./services/weekly-update');
const { startBackupService } = require('./services/backup-service');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de segurança (deve vir primeiro)
app.use(securityHeaders);
app.use(cors(corsOptions));

// Content Security Policy
app.use(cspMiddleware);

// Middleware de auditoria e proteção
app.use(auditMiddleware);
app.use(bruteForceProtection);

// Middleware de logs (deve vir antes das rotas)
app.use(expressLogger);

// Rate limiting dinâmico
app.use(dynamicRateLimit);
app.use(rateLimitMonitor);

// Middleware de sanitização e validação avançada
app.use(sanitizeAll);
app.use(attackDetection);
app.use(inputValidation);
app.use(sanitizeInput);

// Rate limiting específico por rota
app.use('/api/cep/search', searchLimiter);
app.use('/api/admin', adminLimiter);
app.use('/api/', generalLimiter);

// Middlewares para parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de validação de CEP para rotas relevantes
app.use('/api/cep/:cep', validateCepFormat);

// Servir arquivos estáticos com cache otimizado
app.use(express.static(path.join(__dirname, 'build'), {
  maxAge: '1d',
  etag: true,
  lastModified: true
}));

// Mover arquivos existentes para public
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/image', express.static(path.join(__dirname, 'image')));

// Rotas da API com logging de performance
app.use('/api/cep', (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logPerformance('CEP API Request', duration, {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode
    });
  });
  next();
}, cepRoutes);

app.use('/api/admin', (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logPerformance('Admin API Request', duration, {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode
    });
  });
  next();
}, adminRoutes);

// Rotas de health check
app.use('/health', healthRoutes);

// Rotas de monitoramento
app.use('/monitoring', monitoringRoutes);

// Rota para relatórios CSP
app.post('/api/csp-report', cspReportMiddleware);

// Rota principal - servir o index.html
app.get('/', (req, res) => {
  logBusiness('Homepage Access', {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Middleware para rotas não encontradas
app.use((req, res, next) => {
  logError(new Error('Route not found'), {
    method: req.method,
    url: req.url,
    ip: req.ip
  });
  
  res.status(404).json({ 
    success: false,
    message: 'Rota não encontrada',
    timestamp: new Date().toISOString()
  });
});

// Middleware de tratamento de erros centralizado
app.use((err, req, res, next) => {
  // Log do erro
  logError(err, {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Determinar status code apropriado
  let statusCode = 500;
  let message = 'Erro interno do servidor';
  
  if (err.status) {
    statusCode = err.status;
  }
  
  if (err.message) {
    message = err.message;
  }

  // Resposta de erro
  const errorResponse = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
    path: req.path
  };

  // Adicionar detalhes em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error = err.message;
    errorResponse.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
});

// Inicialização do servidor
async function startServer() {
  try {
    logger.info('🚀 Iniciando servidor...');
    
    // Inicializar banco de dados
    await initDatabase();
    logger.info('✅ Banco de dados inicializado');

    // Iniciar agente de atualização semanal (se não estiver desabilitado)
    if (!process.env.DISABLE_CRON) {
      startWeeklyUpdate();
      logger.info('✅ Agente de atualização semanal iniciado');
    } else {
      logger.info('⚠️ Agente de atualização semanal desabilitado');
    }

    // Iniciar serviço de backup (se não estiver desabilitado)
    if (!process.env.DISABLE_BACKUP) {
      startBackupService();
      logger.info('✅ Serviço de backup iniciado');
    } else {
      logger.info('⚠️ Serviço de backup desabilitado');
    }

    // Iniciar servidor
    app.listen(PORT, () => {
      logger.info(`🚀 Servidor rodando na porta ${PORT}`);
      logger.info(`📍 Acesse: http://localhost:${PORT}`);
      logger.info(`🔍 Health check: http://localhost:${PORT}/health`);
      
      // Log de métricas do sistema
      const memUsage = process.memoryUsage();
      logger.info('📊 Métricas do sistema:', {
        memory: {
          rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
          heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
          heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`
        },
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
      });
    });

  } catch (error) {
    logger.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('🔄 SIGTERM recebido, iniciando shutdown graceful...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('🔄 SIGINT recebido, iniciando shutdown graceful...');
  process.exit(0);
});

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  logger.error('💥 Erro não capturado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('💥 Promise rejeitada não tratada:', { reason, promise });
  process.exit(1);
});

startServer();