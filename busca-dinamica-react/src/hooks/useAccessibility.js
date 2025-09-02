import { useState, useEffect, useCallback } from 'react';

export const useAccessibility = () => {
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [isScreenReaderActive, setIsScreenReaderActive] = useState(false);
  const [focusVisible, setFocusVisible] = useState(false);

  // Detectar preferências do usuário
  useEffect(() => {
    const mediaQueryHighContrast = window.matchMedia('(prefers-contrast: high)');
    const mediaQueryReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleHighContrastChange = (e) => setIsHighContrast(e.matches);
    const handleReducedMotionChange = (e) => setIsReducedMotion(e.matches);

    setIsHighContrast(mediaQueryHighContrast.matches);
    setIsReducedMotion(mediaQueryReducedMotion.matches);

    mediaQueryHighContrast.addEventListener('change', handleHighContrastChange);
    mediaQueryReducedMotion.addEventListener('change', handleReducedMotionChange);

    return () => {
      mediaQueryHighContrast.removeEventListener('change', handleHighContrastChange);
      mediaQueryReducedMotion.removeEventListener('change', handleReducedMotionChange);
    };
  }, []);

  // Detectar screen reader
  useEffect(() => {
    const detectScreenReader = () => {
      const isScreenReader = 
        window.navigator.userAgent.includes('NVDA') ||
        window.navigator.userAgent.includes('JAWS') ||
        window.navigator.userAgent.includes('VoiceOver') ||
        document.documentElement.getAttribute('aria-hidden') === 'true';
      
      setIsScreenReaderActive(isScreenReader);
    };

    detectScreenReader();
  }, []);

  // Gerenciar foco visível
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        setFocusVisible(true);
      }
    };

    const handleMouseDown = () => {
      setFocusVisible(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  // Funções utilitárias
  const announceToScreenReader = useCallback((message, priority = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  const focusElement = useCallback((elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.focus();
      announceToScreenReader(`Focado em ${element.getAttribute('aria-label') || element.textContent}`);
    }
  }, [announceToScreenReader]);

  const trapFocus = useCallback((containerRef, shouldTrap = true) => {
    if (!shouldTrap) return;

    const container = containerRef.current;
    if (!container) return;

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const skipToContent = useCallback(() => {
    const mainContent = document.querySelector('main') || document.querySelector('#main-content');
    if (mainContent) {
      mainContent.focus();
      announceToScreenReader('Pulado para o conteúdo principal');
    }
  }, [announceToScreenReader]);

  const toggleHighContrast = useCallback(() => {
    setIsHighContrast(prev => !prev);
    document.documentElement.classList.toggle('high-contrast');
    announceToScreenReader(
      isHighContrast ? 'Modo de alto contraste desativado' : 'Modo de alto contraste ativado'
    );
  }, [isHighContrast, announceToScreenReader]);

  const toggleReducedMotion = useCallback(() => {
    setIsReducedMotion(prev => !prev);
    document.documentElement.classList.toggle('reduced-motion');
    announceToScreenReader(
      isReducedMotion ? 'Movimento reduzido desativado' : 'Movimento reduzido ativado'
    );
  }, [isReducedMotion, announceToScreenReader]);

  // Gerar IDs únicos para elementos
  const generateId = useCallback((prefix = 'element') => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Validar ARIA labels
  const validateAriaLabel = useCallback((label, elementType) => {
    if (!label || label.trim() === '') {
      console.warn(`Elemento ${elementType} deve ter um aria-label`);
      return false;
    }
    return true;
  }, []);

  // Configurar navegação por teclado
  const setupKeyboardNavigation = useCallback((elementRef, onEnter, onEscape, onArrowKeys) => {
    const element = elementRef.current;
    if (!element) return;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault();
          onEnter?.();
          break;
        case 'Escape':
          onEscape?.();
          break;
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':
          onArrowKeys?.(e.key);
          break;
      }
    };

    element.addEventListener('keydown', handleKeyDown);
    return () => element.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    // Estado
    isHighContrast,
    isReducedMotion,
    isScreenReaderActive,
    focusVisible,

    // Funções
    announceToScreenReader,
    focusElement,
    trapFocus,
    skipToContent,
    toggleHighContrast,
    toggleReducedMotion,
    generateId,
    validateAriaLabel,
    setupKeyboardNavigation,

    // Classes CSS condicionais
    accessibilityClasses: {
      'high-contrast': isHighContrast,
      'reduced-motion': isReducedMotion,
      'focus-visible': focusVisible,
      'screen-reader-active': isScreenReaderActive
    }
  };
};

// Componente Skip Link
export const SkipLink = () => {
  const { skipToContent } = useAccessibility();

  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded z-50"
      onClick={(e) => {
        e.preventDefault();
        skipToContent();
      }}
    >
      Pular para o conteúdo principal
    </a>
  );
};

// Hook para gerenciar foco
export const useFocusManagement = () => {
  const [focusedElement, setFocusedElement] = useState(null);

  const focusElement = useCallback((elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.focus();
      setFocusedElement(elementId);
    }
  }, []);

  const focusNext = useCallback(() => {
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const currentIndex = Array.from(focusableElements).findIndex(
      el => el === document.activeElement
    );
    
    const nextIndex = (currentIndex + 1) % focusableElements.length;
    focusableElements[nextIndex].focus();
  }, []);

  const focusPrevious = useCallback(() => {
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const currentIndex = Array.from(focusableElements).findIndex(
      el => el === document.activeElement
    );
    
    const previousIndex = currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1;
    focusableElements[previousIndex].focus();
  }, []);

  return {
    focusedElement,
    focusElement,
    focusNext,
    focusPrevious
  };
};
