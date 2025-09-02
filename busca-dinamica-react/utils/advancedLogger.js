// Sistema de Logs Estruturados Avançado
const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const { format } = winston;

// Configurações de ambiente
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// Formatos personalizados
const logFormat = format.combine(
  format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS'
  }),
  format.errors({ stack: true }),
  format.json(),
  format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `${timestamp} [${level.toUpperCase()}]: ${message} ${metaStr}`;
  })
);

const consoleFormat = format.combine(
  format.colorize(),
  format.timestamp({
    format: 'HH:mm:ss'
  }),
  format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} [${level}]: ${message}${metaStr}`;
  })
);

// Configuração de transportes
const transports = [];

// Console transport (desenvolvimento)
if (isDevelopment) {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
      level: 'debug'
    })
  );
}

// File transports (produção)
if (isProduction) {
  // Logs gerais
  transports.push(
    new DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      level: 'info',
      format: logFormat
    })
  );

  // Logs de erro
  transports.push(
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      level: 'error',
      format: logFormat
    })
  );

  // Logs de segurança
  transports.push(
    new DailyRotateFile({
      filename: 'logs/security-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '90d',
      level: 'warn',
      format: logFormat
    })
  );

  // Logs de performance
  transports.push(
    new DailyRotateFile({
      filename: 'logs/performance-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '7d',
      level: 'info',
      format: logFormat
    })
  );
}

// Criar logger principal
const logger = winston.createLogger({
  level: isDevelopment ? 'debug' : 'info',
  format: logFormat,
  transports,
  exitOnError: false
});

// Loggers especializados
const securityLogger = winston.createLogger({
  level: 'warn',
  format: logFormat,
  transports: [
    new DailyRotateFile({
      filename: 'logs/security-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '90d'
    })
  ]
});

const performanceLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  transports: [
    new DailyRotateFile({
      filename: 'logs/performance-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '7d'
    })
  ]
});

const businessLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  transports: [
    new DailyRotateFile({
      filename: 'logs/business-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d'
    })
  ]
});

// Funções de log especializadas
const logSecurity = (event, details = {}) => {
  securityLogger.warn('SECURITY_EVENT', {
    event,
    timestamp: new Date().toISOString(),
    ip: details.ip,
    userAgent: details.userAgent,
    url: details.url,
    method: details.method,
    ...details
  });
};

const logPerformance = (operation, duration, details = {}) => {
  performanceLogger.info('PERFORMANCE_METRIC', {
    operation,
    duration,
    timestamp: new Date().toISOString(),
    ...details
  });
};

const logBusiness = (event, details = {}) => {
  businessLogger.info('BUSINESS_EVENT', {
    event,
    timestamp: new Date().toISOString(),
    ...details
  });
};

const logError = (error, context = {}) => {
  logger.error('ERROR', {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    ...context
  });
};

const logRequest = (req, res, duration) => {
  const logData = {
    method: req.method,
    url: req.url,
    statusCode: res.statusCode,
    duration,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  };

  if (res.statusCode >= 400) {
    logger.warn('REQUEST_ERROR', logData);
  } else {
    logger.info('REQUEST', logData);
  }
};

// Middleware de logging para Express
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logRequest(req, res, duration);
  });
  
  next();
};

// Função para limpar logs antigos
const cleanupOldLogs = async () => {
  const fs = require('fs').promises;
  const path = require('path');
  
  try {
    const logsDir = path.join(__dirname, 'logs');
    const files = await fs.readdir(logsDir);
    
    const now = new Date();
    const cutoffDate = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000)); // 90 dias
    
    for (const file of files) {
      const filePath = path.join(logsDir, file);
      const stats = await fs.stat(filePath);
      
      if (stats.mtime < cutoffDate) {
        await fs.unlink(filePath);
        logger.info('LOG_CLEANUP', { file, deleted: true });
      }
    }
  } catch (error) {
    logger.error('LOG_CLEANUP_ERROR', { error: error.message });
  }
};

// Agendar limpeza de logs (diariamente)
if (isProduction) {
  setInterval(cleanupOldLogs, 24 * 60 * 60 * 1000); // 24 horas
}

module.exports = {
  logger,
  securityLogger,
  performanceLogger,
  businessLogger,
  logSecurity,
  logPerformance,
  logBusiness,
  logError,
  logRequest,
  requestLogger,
  cleanupOldLogs
};
