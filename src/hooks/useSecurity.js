import { useEffect, useCallback } from 'react';

export function useSecurity() {
  // Detectar tentativas de XSS
  const detectXSS = useCallback((input) => {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /on\w+\s*=/gi,
      /data:\s*text\/html/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
      /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
      /<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi
    ];

    for (const pattern of xssPatterns) {
      if (pattern.test(input)) {
        console.warn('[SECURITY] Potential XSS detected:', input);
        return true;
      }
    }

    return false;
  }, []);

  // Sanitizar entrada do usuário
  const sanitizeInput = useCallback((input) => {
    if (!input || typeof input !== 'string') {
      return input;
    }

    // Remover caracteres perigosos
    let sanitized = input
      .replace(/[<>]/g, '') // Remover < e >
      .replace(/javascript:/gi, '') // Remover javascript:
      .replace(/vbscript:/gi, '') // Remover vbscript:
      .replace(/on\w+=/gi, '') // Remover event handlers
      .replace(/data:/gi, '') // Remover data URLs
      .trim();

    // Limitar tamanho
    const maxLength = 1000;
    if (sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength);
    }

    return sanitized;
  }, []);

  // Validar CEP
  const validateCEP = useCallback((cep) => {
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
  }, []);

  // Validar cidade
  const validateCity = useCallback((city) => {
    if (!city || typeof city !== 'string') {
      return false;
    }

    // Sanitizar
    const sanitized = sanitizeInput(city);

    // Validar se contém apenas letras, espaços e caracteres especiais brasileiros
    if (!/^[a-zA-ZÀ-ÿ\s\-\.]+$/.test(sanitized)) {
      return false;
    }

    // Validar tamanho mínimo
    if (sanitized.length < 2) {
      return false;
    }

    return sanitized;
  }, [sanitizeInput]);

  // Validar estado
  const validateState = useCallback((state) => {
    if (!state || typeof state !== 'string') {
      return false;
    }

    const validStates = [
      'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
      'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
      'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
    ];

    return validStates.includes(state.toUpperCase());
  }, []);

  // Validar termo de busca
  const validateSearchTerm = useCallback((term) => {
    if (!term || typeof term !== 'string') {
      return false;
    }

    // Sanitizar
    const sanitized = sanitizeInput(term);

    // Validar tamanho mínimo
    if (sanitized.length < 2) {
      return false;
    }

    // Validar se não contém apenas caracteres especiais
    if (!/[a-zA-ZÀ-ÿ0-9]/.test(sanitized)) {
      return false;
    }

    return sanitized;
  }, [sanitizeInput]);

  // Detectar tentativas de ataque
  const detectAttack = useCallback((input) => {
    const attackPatterns = [
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
        console.warn('[SECURITY] Potential attack detected:', input);
        return true;
      }
    }

    return false;
  }, []);

  // Proteger contra clickjacking
  useEffect(() => {
    // Verificar se a página está sendo carregada em um iframe
    if (window.self !== window.top) {
      console.warn('[SECURITY] Page loaded in iframe - potential clickjacking');
      // Você pode redirecionar ou mostrar um aviso aqui
    }
  }, []);

  // Proteger contra ataques de timing
  const secureCompare = useCallback((a, b) => {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
  }, []);

  // Gerar token CSRF
  const generateCSRFToken = useCallback(() => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }, []);

  // Validar token CSRF
  const validateCSRFToken = useCallback((token) => {
    if (!token || typeof token !== 'string') {
      return false;
    }

    // Verificar formato (64 caracteres hexadecimais)
    if (!/^[a-f0-9]{64}$/.test(token)) {
      return false;
    }

    return true;
  }, []);

  // Proteger contra ataques de força bruta
  const rateLimitCheck = useCallback((action, maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
    const key = `rate_limit_${action}`;
    const attempts = JSON.parse(localStorage.getItem(key) || '[]');
    const now = Date.now();

    // Remover tentativas antigas
    const validAttempts = attempts.filter(timestamp => now - timestamp < windowMs);

    if (validAttempts.length >= maxAttempts) {
      console.warn('[SECURITY] Rate limit exceeded for:', action);
      return false;
    }

    // Adicionar nova tentativa
    validAttempts.push(now);
    localStorage.setItem(key, JSON.stringify(validAttempts));

    return true;
  }, []);

  // Limpar dados sensíveis
  const clearSensitiveData = useCallback(() => {
    // Limpar localStorage de dados sensíveis
    const sensitiveKeys = [
      'auth_token',
      'user_password',
      'session_data',
      'rate_limit_'
    ];

    sensitiveKeys.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
      }
    });

    // Limpar sessionStorage
    sessionStorage.clear();
  }, []);

  // Detectar ambiente inseguro
  const detectInsecureEnvironment = useCallback(() => {
    const warnings = [];

    // Verificar se não está usando HTTPS
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      warnings.push('Connection not secure (HTTP)');
    }

    // Verificar se está em modo de desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      warnings.push('Development environment detected');
    }

    // Verificar se há console aberto (básico)
    if (window.console && window.console.firebug) {
      warnings.push('Developer tools detected');
    }

    return warnings;
  }, []);

  return {
    detectXSS,
    sanitizeInput,
    validateCEP,
    validateCity,
    validateState,
    validateSearchTerm,
    detectAttack,
    secureCompare,
    generateCSRFToken,
    validateCSRFToken,
    rateLimitCheck,
    clearSensitiveData,
    detectInsecureEnvironment
  };
}
