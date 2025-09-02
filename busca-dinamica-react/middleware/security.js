const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const { logSecurity } = require('../utils/logger');

// Rate limiting por IP
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message,
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logSecurity('Rate limit exceeded', {
        ip: req.ip,
        url: req.url,
        method: req.method,
        userAgent: req.get('User-Agent')
      });
      
      res.status(429).json({
        success: false,
        message,
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });
};

// Rate limiters específicos
const generalLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutos
  100, // 100 requests por IP
  'Muitas requisições deste IP, tente novamente em 15 minutos.'
);

const searchLimiter = createRateLimiter(
  1 * 60 * 1000, // 1 minuto
  30, // 30 buscas por minuto
  'Muitas buscas, aguarde um minuto antes de continuar.'
);

const adminLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutos
  10, // 10 tentativas por 15 minutos
  'Muitas tentativas de acesso admin, tente novamente em 15 minutos.'
);

// Configuração do CORS
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requests sem origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://seu-dominio.com', // Substitua pelo seu domínio
      'https://*.onrender.com' // Para Render
    ];
    
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin.includes('*')) {
        return origin.endsWith(allowedOrigin.replace('*.', ''));
      }
      return origin === allowedOrigin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      logSecurity('CORS blocked', {
        origin,
        ip: process.env.REQUEST_IP || 'unknown'
      });
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control'
  ]
};

// Middleware de validação de entrada
const inputValidation = (req, res, next) => {
  // Sanitizar query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key].trim();
      }
    });
  }
  
  // Sanitizar body parameters
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });
  }
  
  next();
};

// Middleware de proteção contra ataques comuns
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true,
  frameguard: { action: 'deny' }
});

// Middleware de auditoria
const auditMiddleware = (req, res, next) => {
  // Log de tentativas de acesso suspeitas
  const suspiciousPatterns = [
    /\.\.\//, // Path traversal
    /<script/i, // XSS básico
    /javascript:/i, // JavaScript injection
    /union\s+select/i, // SQL injection básico
    /exec\(/i, // Command injection
    /eval\(/i // Code injection
  ];
  
  const url = req.url.toLowerCase();
  const userAgent = req.get('User-Agent') || '';
  
  const isSuspicious = suspiciousPatterns.some(pattern => 
    pattern.test(url) || pattern.test(userAgent)
  );
  
  if (isSuspicious) {
    logSecurity('Suspicious request detected', {
      ip: req.ip,
      url: req.url,
      userAgent,
      method: req.method,
      headers: req.headers
    });
  }
  
  next();
};

// Middleware de validação de CEP
const validateCepFormat = (req, res, next) => {
  const cep = req.params.cep || req.query.cep;
  
  if (cep) {
    const cepPattern = /^\d{5}-?\d{3}$/;
    if (!cepPattern.test(cep)) {
      logSecurity('Invalid CEP format', {
        ip: req.ip,
        cep,
        url: req.url
      });
      
      return res.status(400).json({
        success: false,
        message: 'Formato de CEP inválido'
      });
    }
  }
  
  next();
};

// Middleware de proteção contra brute force
const bruteForceProtection = (req, res, next) => {
  const clientIP = req.ip;
  const endpoint = req.path;
  
  // Implementar lógica de proteção contra brute force
  // Por exemplo, bloquear IPs que fazem muitas requisições para endpoints sensíveis
  
  if (endpoint.includes('/admin') || endpoint.includes('/api/admin')) {
    // Log de tentativas de acesso admin
    logSecurity('Admin access attempt', {
      ip: clientIP,
      endpoint,
      method: req.method,
      userAgent: req.get('User-Agent')
    });
  }
  
  next();
};

// Middleware de sanitização de dados
const sanitizeInput = (req, res, next) => {
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    
    return str
      .replace(/[<>]/g, '') // Remove < e >
      .replace(/javascript:/gi, '') // Remove javascript:
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  };
  
  // Sanitizar query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitizeString(req.query[key]);
      }
    });
  }
  
  // Sanitizar body parameters
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeString(req.body[key]);
      }
    });
  }
  
  next();
};

module.exports = {
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
};
