// Rate Limiting Middleware Avançado
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redis = require('redis');

// Configurações de rate limiting
const rateLimitConfig = {
  // Rate limit geral
  general: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máximo 100 requests por IP
    message: {
      error: 'Too many requests',
      message: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  },
  
  // Rate limit para busca
  search: {
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 30, // máximo 30 buscas por IP por minuto
    message: {
      error: 'Search rate limit exceeded',
      message: 'Too many search requests. Please wait before trying again.',
      retryAfter: '1 minute'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  },
  
  // Rate limit para API
  api: {
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 50, // máximo 50 requests por IP
    message: {
      error: 'API rate limit exceeded',
      message: 'Too many API requests. Please try again later.',
      retryAfter: '5 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  },
  
  // Rate limit para autenticação
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // máximo 5 tentativas de login
    message: {
      error: 'Authentication rate limit exceeded',
      message: 'Too many authentication attempts. Please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    skipFailedRequests: false
  },
  
  // Rate limit para uploads
  upload: {
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 10, // máximo 10 uploads por IP por hora
    message: {
      error: 'Upload rate limit exceeded',
      message: 'Too many upload attempts. Please try again later.',
      retryAfter: '1 hour'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  }
};

// Função para obter chave do rate limit
const getRateLimitKey = (req) => {
  // Usar IP real se estiver atrás de proxy
  const ip = req.headers['x-forwarded-for'] || 
            req.headers['x-real-ip'] || 
            req.connection.remoteAddress || 
            req.socket.remoteAddress ||
            req.ip;
  
  // Adicionar User-Agent para mais granularidade
  const userAgent = req.get('User-Agent') || 'unknown';
  
  // Adicionar rota específica
  const route = req.route ? req.route.path : req.path;
  
  return `${ip}:${userAgent}:${route}`;
};

// Função para obter chave do rate limit por tipo
const getRateLimitKeyByType = (req, type) => {
  const ip = req.headers['x-forwarded-for'] || 
            req.headers['x-real-ip'] || 
            req.connection.remoteAddress || 
            req.socket.remoteAddress ||
            req.ip;
  
  return `${type}:${ip}`;
};

// Rate limiters
const createRateLimiters = () => {
  const limiters = {};
  
  // Rate limiter geral
  limiters.general = rateLimit({
    ...rateLimitConfig.general,
    keyGenerator: getRateLimitKey,
    handler: (req, res) => {
      console.log('[RATE LIMIT] General limit exceeded:', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.url,
        method: req.method
      });
      
      res.status(429).json(rateLimitConfig.general.message);
    }
  });
  
  // Rate limiter para busca
  limiters.search = rateLimit({
    ...rateLimitConfig.search,
    keyGenerator: (req) => getRateLimitKeyByType(req, 'search'),
    handler: (req, res) => {
      console.log('[RATE LIMIT] Search limit exceeded:', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        searchTerm: req.query.q || req.body.searchTerm,
        url: req.url
      });
      
      res.status(429).json(rateLimitConfig.search.message);
    }
  });
  
  // Rate limiter para API
  limiters.api = rateLimit({
    ...rateLimitConfig.api,
    keyGenerator: (req) => getRateLimitKeyByType(req, 'api'),
    handler: (req, res) => {
      console.log('[RATE LIMIT] API limit exceeded:', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        endpoint: req.path,
        method: req.method
      });
      
      res.status(429).json(rateLimitConfig.api.message);
    }
  });
  
  // Rate limiter para autenticação
  limiters.auth = rateLimit({
    ...rateLimitConfig.auth,
    keyGenerator: (req) => getRateLimitKeyByType(req, 'auth'),
    handler: (req, res) => {
      console.log('[RATE LIMIT] Auth limit exceeded:', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        username: req.body.username || req.body.email,
        url: req.url
      });
      
      res.status(429).json(rateLimitConfig.auth.message);
    }
  });
  
  // Rate limiter para uploads
  limiters.upload = rateLimit({
    ...rateLimitConfig.upload,
    keyGenerator: (req) => getRateLimitKeyByType(req, 'upload'),
    handler: (req, res) => {
      console.log('[RATE LIMIT] Upload limit exceeded:', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        fileSize: req.headers['content-length'],
        url: req.url
      });
      
      res.status(429).json(rateLimitConfig.upload.message);
    }
  });
  
  return limiters;
};

// Middleware para rate limit dinâmico
const dynamicRateLimit = (req, res, next) => {
  const userAgent = req.get('User-Agent') || '';
  const ip = req.ip;
  
  // Detectar bots e crawlers
  const isBot = /bot|crawler|spider|crawling/i.test(userAgent);
  
  // Detectar proxies e VPNs
  const isProxy = req.headers['x-forwarded-for'] || 
                 req.headers['x-real-ip'] || 
                 req.headers['x-client-ip'];
  
  // Ajustar limites baseado no tipo de cliente
  if (isBot) {
    // Limites mais restritivos para bots
    req.rateLimit = {
      windowMs: 60 * 60 * 1000, // 1 hora
      max: 10 // máximo 10 requests por hora
    };
  } else if (isProxy) {
    // Limites moderados para proxies
    req.rateLimit = {
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: 50 // máximo 50 requests por 15 minutos
    };
  } else {
    // Limites normais para usuários
    req.rateLimit = {
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: 100 // máximo 100 requests por 15 minutos
    };
  }
  
  next();
};

// Middleware para rate limit por rota
const routeSpecificRateLimit = (routeType) => {
  return (req, res, next) => {
    const limiters = createRateLimiters();
    const limiter = limiters[routeType];
    
    if (limiter) {
      limiter(req, res, next);
    } else {
      next();
    }
  };
};

// Função para resetar rate limit
const resetRateLimit = async (key) => {
  try {
    // Se estiver usando Redis
    if (process.env.REDIS_URL) {
      const client = redis.createClient({
        url: process.env.REDIS_URL
      });
      
      await client.connect();
      await client.del(key);
      await client.disconnect();
    }
    
    console.log('[RATE LIMIT] Reset for key:', key);
  } catch (error) {
    console.error('[RATE LIMIT] Error resetting limit:', error);
  }
};

// Middleware para monitoramento de rate limit
const rateLimitMonitor = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    if (res.statusCode === 429) {
      console.log('[RATE LIMIT MONITOR] Rate limit hit:', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
      });
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};

module.exports = {
  createRateLimiters,
  dynamicRateLimit,
  routeSpecificRateLimit,
  resetRateLimit,
  rateLimitMonitor,
  rateLimitConfig,
  getRateLimitKey,
  getRateLimitKeyByType
};
