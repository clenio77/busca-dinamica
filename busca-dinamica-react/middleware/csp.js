// Content Security Policy Middleware
const helmet = require('helmet');

// Configuração CSP personalizada
const cspConfig = {
  directives: {
    // Scripts permitidos
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-inline'", // Necessário para React
      "'unsafe-eval'",   // Necessário para React em desenvolvimento
      "https://www.googletagmanager.com",
      "https://www.google-analytics.com",
      "https://www.gstatic.com",
      "https://api.qrserver.com"
    ],
    
    // Estilos permitidos
    'style-src': [
      "'self'",
      "'unsafe-inline'", // Necessário para Tailwind CSS
      "https://fonts.googleapis.com",
      "https://fonts.gstatic.com"
    ],
    
    // Fontes permitidas
    'font-src': [
      "'self'",
      "https://fonts.gstatic.com",
      "https://fonts.googleapis.com",
      "data:"
    ],
    
    // Imagens permitidas
    'img-src': [
      "'self'",
      "data:",
      "blob:",
      "https:",
      "https://api.qrserver.com",
      "https://www.google-analytics.com",
      "https://www.googletagmanager.com"
    ],
    
    // Conectividade permitida
    'connect-src': [
      "'self'",
      "https://www.google-analytics.com",
      "https://analytics.google.com",
      "https://api.qrserver.com",
      "https://www.google.com",
      "https://www.bing.com",
      "wss://localhost:*", // WebSocket para desenvolvimento
      "ws://localhost:*"   // WebSocket para desenvolvimento
    ],
    
    // Frames permitidos
    'frame-src': [
      "'self'",
      "https://www.google.com",
      "https://www.bing.com"
    ],
    
    // Objetos permitidos
    'object-src': ["'none'"],
    
    // Media permitido
    'media-src': ["'self'"],
    
    // Manifest permitido
    'manifest-src': ["'self'"],
    
    // Worker permitido
    'worker-src': [
      "'self'",
      "blob:"
    ],
    
    // Form action permitido
    'form-action': ["'self'"],
    
    // Base URI
    'base-uri': ["'self'"],
    
    // Upgrade insecure requests
    'upgrade-insecure-requests': []
  },
  
  // Relatório de violações
  reportOnly: process.env.NODE_ENV === 'development',
  reportUri: process.env.CSP_REPORT_URI || '/api/csp-report'
};

// Middleware CSP
const cspMiddleware = helmet({
  contentSecurityPolicy: cspConfig,
  
  // Headers de segurança adicionais
  crossOriginEmbedderPolicy: false, // Necessário para algumas APIs
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  crossOriginResourcePolicy: { policy: "cross-origin" },
  
  // Headers de segurança do navegador
  dnsPrefetchControl: { allow: false },
  frameguard: { action: "deny" },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  ieNoOpen: true,
  noSniff: true,
  permittedCrossDomainPolicies: { permittedPolicies: "none" },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true
});

// Middleware para relatórios CSP
const cspReportMiddleware = (req, res) => {
  if (req.body) {
    console.log('[CSP Violation]', JSON.stringify(req.body, null, 2));
    
    // Aqui você pode salvar em banco de dados ou enviar para serviço de monitoramento
    // Exemplo: enviar para Sentry, LogRocket, etc.
  }
  
  res.status(204).send();
};

module.exports = {
  cspMiddleware,
  cspReportMiddleware,
  cspConfig
};
