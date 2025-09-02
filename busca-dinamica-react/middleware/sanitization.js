// Input Sanitization Middleware
const DOMPurify = require('isomorphic-dompurify');
const xss = require('xss');

// Configurações de sanitização
const sanitizationConfig = {
  // Configurações DOMPurify
  domPurify: {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'br'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_DOM_IMPORT_NODE: false,
    RETURN_TRUSTED_TYPE: false,
    FORCE_BODY: false,
    SANITIZE_DOM: true,
    WHOLE_DOCUMENT: false,
    RETURN_TRUSTED_TYPE: false,
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur']
  },
  
  // Configurações XSS
  xss: {
    whiteList: {
      a: ['href', 'title', 'target'],
      img: ['src', 'alt'],
      b: [],
      i: [],
      em: [],
      strong: [],
      br: []
    },
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script', 'style', 'iframe', 'object', 'embed']
  }
};

// Função para sanitizar strings
const sanitizeString = (input, options = {}) => {
  if (!input || typeof input !== 'string') {
    return input;
  }

  const config = { ...sanitizationConfig, ...options };
  
  // Remover caracteres perigosos
  let sanitized = input
    .replace(/[<>]/g, '') // Remover < e >
    .replace(/javascript:/gi, '') // Remover javascript:
    .replace(/vbscript:/gi, '') // Remover vbscript:
    .replace(/on\w+=/gi, '') // Remover event handlers
    .replace(/data:/gi, '') // Remover data URLs
    .trim();

  // Aplicar XSS filter
  sanitized = xss(sanitized, config.xss);
  
  // Aplicar DOMPurify
  sanitized = DOMPurify.sanitize(sanitized, config.domPurify);
  
  // Limitar tamanho
  const maxLength = options.maxLength || 1000;
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
};

// Função para sanitizar objetos
const sanitizeObject = (obj, options = {}) => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const sanitized = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value, options);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value, options);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

// Função para validar CEP
const validateCEP = (cep) => {
  if (!cep || typeof cep !== 'string') {
    return false;
  }
  
  // Remover caracteres não numéricos
  const cleanCEP = cep.replace(/\D/g, '');
  
  // Validar formato brasileiro (8 dígitos)
  if (cleanCEP.length !== 8) {
    return false;
  }
  
  // Validar se são apenas números
  if (!/^\d{8}$/.test(cleanCEP)) {
    return false;
  }
  
  return cleanCEP;
};

// Função para validar cidade
const validateCity = (city) => {
  if (!city || typeof city !== 'string') {
    return false;
  }
  
  // Sanitizar e validar
  const sanitized = sanitizeString(city, { maxLength: 100 });
  
  // Validar se contém apenas letras, espaços e caracteres especiais brasileiros
  if (!/^[a-zA-ZÀ-ÿ\s\-\.]+$/.test(sanitized)) {
    return false;
  }
  
  // Validar tamanho mínimo
  if (sanitized.length < 2) {
    return false;
  }
  
  return sanitized;
};

// Função para validar estado
const validateState = (state) => {
  if (!state || typeof state !== 'string') {
    return false;
  }
  
  const validStates = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];
  
  return validStates.includes(state.toUpperCase());
};

// Função para validar termo de busca
const validateSearchTerm = (term) => {
  if (!term || typeof term !== 'string') {
    return false;
  }
  
  // Sanitizar
  const sanitized = sanitizeString(term, { maxLength: 200 });
  
  // Validar tamanho mínimo
  if (sanitized.length < 2) {
    return false;
  }
  
  // Validar se não contém apenas caracteres especiais
  if (!/[a-zA-ZÀ-ÿ0-9]/.test(sanitized)) {
    return false;
  }
  
  return sanitized;
};

// Middleware para sanitizar body
const sanitizeBody = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeObject(req.body, {
      maxLength: 1000
    });
  }
  next();
};

// Middleware para sanitizar query parameters
const sanitizeQuery = (req, res, next) => {
  if (req.query) {
    req.query = sanitizeObject(req.query, {
      maxLength: 500
    });
  }
  next();
};

// Middleware para sanitizar params
const sanitizeParams = (req, res, next) => {
  if (req.params) {
    req.params = sanitizeObject(req.params, {
      maxLength: 200
    });
  }
  next();
};

// Middleware completo de sanitização
const sanitizeAll = (req, res, next) => {
  sanitizeBody(req, res, () => {
    sanitizeQuery(req, res, () => {
      sanitizeParams(req, res, next);
    });
  });
};

// Função para detectar ataques comuns
const detectAttack = (input) => {
  const attackPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /on\w+\s*=/gi,
    /data:\s*text\/html/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
    /<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi,
    /union\s+select/gi,
    /drop\s+table/gi,
    /insert\s+into/gi,
    /delete\s+from/gi,
    /update\s+set/gi,
    /exec\s*\(/gi,
    /eval\s*\(/gi,
    /document\.cookie/gi,
    /window\.location/gi,
    /document\.write/gi,
    /innerHTML/gi
  ];

  for (const pattern of attackPatterns) {
    if (pattern.test(input)) {
      return true;
    }
  }

  return false;
};

// Middleware para detectar ataques
const attackDetection = (req, res, next) => {
  const checkInput = (input) => {
    if (typeof input === 'string' && detectAttack(input)) {
      return true;
    }
    if (typeof input === 'object' && input !== null) {
      for (const value of Object.values(input)) {
        if (checkInput(value)) {
          return true;
        }
      }
    }
    return false;
  };

  if (checkInput(req.body) || checkInput(req.query) || checkInput(req.params)) {
    console.log('[SECURITY] Potential attack detected:', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method
    });
    
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Potentially malicious input detected'
    });
  }

  next();
};

module.exports = {
  sanitizeString,
  sanitizeObject,
  validateCEP,
  validateCity,
  validateState,
  validateSearchTerm,
  sanitizeBody,
  sanitizeQuery,
  sanitizeParams,
  sanitizeAll,
  detectAttack,
  attackDetection,
  sanitizationConfig
};
