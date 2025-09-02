import { renderHook, act } from '@testing-library/react';
import { useSecurity } from '../useSecurity';

// Mock do console.warn para evitar spam nos testes
const originalWarn = console.warn;
beforeAll(() => {
  console.warn = jest.fn();
});

afterAll(() => {
  console.warn = originalWarn;
});

describe('useSecurity', () => {
  beforeEach(() => {
    // Limpar localStorage antes de cada teste
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('detectXSS', () => {
    it('deve detectar scripts maliciosos', () => {
      const { result } = renderHook(() => useSecurity());
      
      expect(result.current.detectXSS('<script>alert("xss")</script>')).toBe(true);
      expect(result.current.detectXSS('javascript:alert("xss")')).toBe(true);
      expect(result.current.detectXSS('<iframe src="malicious.com"></iframe>')).toBe(true);
    });

    it('não deve detectar texto normal', () => {
      const { result } = renderHook(() => useSecurity());
      
      expect(result.current.detectXSS('texto normal')).toBe(false);
      expect(result.current.detectXSS('123456')).toBe(false);
      expect(result.current.detectXSS('')).toBe(false);
    });
  });

  describe('sanitizeInput', () => {
    it('deve sanitizar entrada maliciosa', () => {
      const { result } = renderHook(() => useSecurity());
      
      const sanitized = result.current.sanitizeInput('<script>alert("xss")</script>');
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('javascript:');
    });

    it('deve limitar tamanho da entrada', () => {
      const { result } = renderHook(() => useSecurity());
      
      const longInput = 'a'.repeat(2000);
      const sanitized = result.current.sanitizeInput(longInput);
      expect(sanitized.length).toBeLessThanOrEqual(1000);
    });

    it('deve retornar entrada válida inalterada', () => {
      const { result } = renderHook(() => useSecurity());
      
      const validInput = 'texto válido 123';
      const sanitized = result.current.sanitizeInput(validInput);
      expect(sanitized).toBe(validInput);
    });
  });

  describe('validateCEP', () => {
    it('deve validar CEPs válidos', () => {
      const { result } = renderHook(() => useSecurity());
      
      expect(result.current.validateCEP('12345678')).toBe('12345678');
      expect(result.current.validateCEP('12.345-678')).toBe('12345678');
      expect(result.current.validateCEP('12 345 678')).toBe('12345678');
    });

    it('deve rejeitar CEPs inválidos', () => {
      const { result } = renderHook(() => useSecurity());
      
      expect(result.current.validateCEP('1234567')).toBe(false); // Muito curto
      expect(result.current.validateCEP('123456789')).toBe(false); // Muito longo
      expect(result.current.validateCEP('abcdefgh')).toBe(false); // Letras
      expect(result.current.validateCEP('')).toBe(false); // Vazio
      expect(result.current.validateCEP(null)).toBe(false); // Null
    });
  });

  describe('validateCity', () => {
    it('deve validar cidades válidas', () => {
      const { result } = renderHook(() => useSecurity());
      
      expect(result.current.validateCity('São Paulo')).toBe('São Paulo');
      expect(result.current.validateCity('Rio de Janeiro')).toBe('Rio de Janeiro');
      expect(result.current.validateCity('Belo Horizonte')).toBe('Belo Horizonte');
    });

    it('deve rejeitar cidades inválidas', () => {
      const { result } = renderHook(() => useSecurity());
      
      expect(result.current.validateCity('S@o Paulo')).toBe(false); // Caracteres especiais
      expect(result.current.validateCity('123')).toBe(false); // Números
      expect(result.current.validateCity('A')).toBe(false); // Muito curto
      expect(result.current.validateCity('')).toBe(false); // Vazio
    });
  });

  describe('validateState', () => {
    it('deve validar estados válidos', () => {
      const { result } = renderHook(() => useSecurity());
      
      expect(result.current.validateState('SP')).toBe(true);
      expect(result.current.validateState('RJ')).toBe(true);
      expect(result.current.validateState('MG')).toBe(true);
      expect(result.current.validateState('sp')).toBe(true); // Case insensitive
    });

    it('deve rejeitar estados inválidos', () => {
      const { result } = renderHook(() => useSecurity());
      
      expect(result.current.validateState('XX')).toBe(false);
      expect(result.current.validateState('ABC')).toBe(false);
      expect(result.current.validateState('')).toBe(false);
      expect(result.current.validateState(null)).toBe(false);
    });
  });

  describe('validateSearchTerm', () => {
    it('deve validar termos de busca válidos', () => {
      const { result } = renderHook(() => useSecurity());
      
      expect(result.current.validateSearchTerm('rua')).toBe('rua');
      expect(result.current.validateSearchTerm('avenida 123')).toBe('avenida 123');
      expect(result.current.validateSearchTerm('São João')).toBe('São João');
    });

    it('deve rejeitar termos de busca inválidos', () => {
      const { result } = renderHook(() => useSecurity());
      
      expect(result.current.validateSearchTerm('a')).toBe(false); // Muito curto
      expect(result.current.validateSearchTerm('')).toBe(false); // Vazio
      expect(result.current.validateSearchTerm('   ')).toBe(false); // Apenas espaços
    });
  });

  describe('detectAttack', () => {
    it('deve detectar tentativas de SQL injection', () => {
      const { result } = renderHook(() => useSecurity());
      
      expect(result.current.detectAttack('union select')).toBe(true);
      expect(result.current.detectAttack('drop table')).toBe(true);
      expect(result.current.detectAttack('insert into')).toBe(true);
    });

    it('deve detectar tentativas de XSS', () => {
      const { result } = renderHook(() => useSecurity());
      
      expect(result.current.detectAttack('document.cookie')).toBe(true);
      expect(result.current.detectAttack('window.location')).toBe(true);
      expect(result.current.detectAttack('innerHTML')).toBe(true);
    });

    it('não deve detectar texto normal', () => {
      const { result } = renderHook(() => useSecurity());
      
      expect(result.current.detectAttack('texto normal')).toBe(false);
      expect(result.current.detectAttack('123456')).toBe(false);
    });
  });

  describe('secureCompare', () => {
    it('deve comparar strings de forma segura', () => {
      const { result } = renderHook(() => useSecurity());
      
      expect(result.current.secureCompare('abc', 'abc')).toBe(true);
      expect(result.current.secureCompare('abc', 'def')).toBe(false);
      expect(result.current.secureCompare('', '')).toBe(true);
    });

    it('deve lidar com strings de tamanhos diferentes', () => {
      const { result } = renderHook(() => useSecurity());
      
      expect(result.current.secureCompare('abc', 'abcd')).toBe(false);
      expect(result.current.secureCompare('abcd', 'abc')).toBe(false);
    });
  });

  describe('generateCSRFToken', () => {
    it('deve gerar tokens únicos', () => {
      const { result } = renderHook(() => useSecurity());
      
      const token1 = result.current.generateCSRFToken();
      const token2 = result.current.generateCSRFToken();
      
      expect(token1).not.toBe(token2);
      expect(token1).toHaveLength(64);
      expect(token2).toHaveLength(64);
      expect(token1).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  describe('validateCSRFToken', () => {
    it('deve validar tokens válidos', () => {
      const { result } = renderHook(() => useSecurity());
      
      const validToken = 'a'.repeat(64);
      expect(result.current.validateCSRFToken(validToken)).toBe(true);
    });

    it('deve rejeitar tokens inválidos', () => {
      const { result } = renderHook(() => useSecurity());
      
      expect(result.current.validateCSRFToken('short')).toBe(false);
      expect(result.current.validateCSRFToken('a'.repeat(65))).toBe(false);
      expect(result.current.validateCSRFToken('')).toBe(false);
      expect(result.current.validateCSRFToken(null)).toBe(false);
    });
  });

  describe('rateLimitCheck', () => {
    it('deve permitir tentativas dentro do limite', () => {
      const { result } = renderHook(() => useSecurity());
      
      expect(result.current.rateLimitCheck('test_action', 5, 1000)).toBe(true);
      expect(result.current.rateLimitCheck('test_action', 5, 1000)).toBe(true);
      expect(result.current.rateLimitCheck('test_action', 5, 1000)).toBe(true);
      expect(result.current.rateLimitCheck('test_action', 5, 1000)).toBe(true);
      expect(result.current.rateLimitCheck('test_action', 5, 1000)).toBe(true);
    });

    it('deve bloquear após exceder o limite', () => {
      const { result } = renderHook(() => useSecurity());
      
      // Fazer 5 tentativas (dentro do limite)
      for (let i = 0; i < 5; i++) {
        result.current.rateLimitCheck('test_action_2', 5, 1000);
      }
      
      // A 6ª tentativa deve ser bloqueada
      expect(result.current.rateLimitCheck('test_action_2', 5, 1000)).toBe(false);
    });
  });

  describe('clearSensitiveData', () => {
    it('deve limpar dados sensíveis', () => {
      const { result } = renderHook(() => useSecurity());
      
      // Adicionar dados sensíveis
      localStorage.setItem('auth_token', 'sensitive_token');
      localStorage.setItem('user_password', 'sensitive_password');
      sessionStorage.setItem('session_data', 'sensitive_session');
      
      // Limpar dados
      act(() => {
        result.current.clearSensitiveData();
      });
      
      // Verificar se foram removidos
      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(localStorage.getItem('user_password')).toBeNull();
      expect(sessionStorage.getItem('session_data')).toBeNull();
    });
  });

  describe('detectInsecureEnvironment', () => {
    it('deve detectar ambiente inseguro', () => {
      const { result } = renderHook(() => useSecurity());
      
      // Mock do window.location
      const originalLocation = window.location;
      delete window.location;
      window.location = {
        protocol: 'http:',
        hostname: 'example.com'
      };
      
      const warnings = result.current.detectInsecureEnvironment();
      expect(warnings).toContain('Connection not secure (HTTP)');
      
      // Restaurar
      window.location = originalLocation;
    });

    it('deve detectar ambiente de desenvolvimento', () => {
      const { result } = renderHook(() => useSecurity());
      
      // Mock do process.env
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const warnings = result.current.detectInsecureEnvironment();
      expect(warnings).toContain('Development environment detected');
      
      // Restaurar
      process.env.NODE_ENV = originalEnv;
    });
  });
});
