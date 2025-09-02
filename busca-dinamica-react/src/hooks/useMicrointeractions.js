import { useState, useEffect, useCallback, useRef } from 'react';

export const useMicrointeractions = () => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [hoveredElement, setHoveredElement] = useState(null);
  const [pressedElement, setPressedElement] = useState(null);
  const animationRef = useRef(null);

  // Detectar preferência de movimento reduzido
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Função para animar elementos
  const animateElement = useCallback((element, animation, duration = 300, easing = 'ease-out') => {
    if (prefersReducedMotion) return;

    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }

    setIsAnimating(true);

    element.style.transition = `all ${duration}ms ${easing}`;
    element.classList.add(animation);

    animationRef.current = setTimeout(() => {
      element.classList.remove(animation);
      setIsAnimating(false);
    }, duration);
  }, [prefersReducedMotion]);

  // Animação de entrada
  const animateIn = useCallback((element, type = 'fade') => {
    const animations = {
      fade: 'animate-fade-in',
      slide: 'animate-slide-in',
      scale: 'animate-scale-in',
      bounce: 'animate-bounce-in'
    };

    animateElement(element, animations[type] || animations.fade);
  }, [animateElement]);

  // Animação de saída
  const animateOut = useCallback((element, type = 'fade') => {
    const animations = {
      fade: 'animate-fade-out',
      slide: 'animate-slide-out',
      scale: 'animate-scale-out',
      bounce: 'animate-bounce-out'
    };

    animateElement(element, animations[type] || animations.fade);
  }, [animateElement]);

  // Feedback tátil (vibração)
  const hapticFeedback = useCallback((pattern = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [50],
        success: [20, 10, 20],
        error: [100, 50, 100],
        warning: [50, 100, 50]
      };

      navigator.vibrate(patterns[pattern] || patterns.light);
    }
  }, []);

  // Feedback visual
  const visualFeedback = useCallback((element, type = 'pulse') => {
    const feedbacks = {
      pulse: 'feedback-pulse',
      shake: 'feedback-shake',
      glow: 'feedback-glow',
      ripple: 'feedback-ripple'
    };

    animateElement(element, feedbacks[type] || feedbacks.pulse, 200);
  }, [animateElement]);

  // Loading states
  const createLoadingState = useCallback((element, text = 'Carregando...') => {
    const originalContent = element.innerHTML;
    const loadingSpinner = `
      <div class="loading-spinner">
        <div class="spinner"></div>
        <span class="loading-text">${text}</span>
      </div>
    `;

    element.innerHTML = loadingSpinner;
    element.classList.add('loading');

    return () => {
      element.innerHTML = originalContent;
      element.classList.remove('loading');
    };
  }, []);

  // Progress indicator
  const createProgressIndicator = useCallback((element, progress = 0) => {
    const progressBar = `
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${progress}%"></div>
        <span class="progress-text">${Math.round(progress)}%</span>
      </div>
    `;

    element.innerHTML = progressBar;
  }, []);

  // Hover effects
  const handleHover = useCallback((elementId, effect = 'lift') => {
    const element = document.getElementById(elementId);
    if (!element) return;

    const effects = {
      lift: 'hover-lift',
      glow: 'hover-glow',
      scale: 'hover-scale',
      border: 'hover-border'
    };

    element.classList.add(effects[effect] || effects.lift);
    setHoveredElement(elementId);

    return () => {
      element.classList.remove(effects[effect] || effects.lift);
      setHoveredElement(null);
    };
  }, []);

  // Press effects
  const handlePress = useCallback((elementId, effect = 'press') => {
    const element = document.getElementById(elementId);
    if (!element) return;

    const effects = {
      press: 'press-down',
      ripple: 'press-ripple',
      scale: 'press-scale'
    };

    element.classList.add(effects[effect] || effects.press);
    setPressedElement(elementId);

    return () => {
      element.classList.remove(effects[effect] || effects.press);
      setPressedElement(null);
    };
  }, []);

  // Success animation
  const showSuccess = useCallback((element, message = 'Sucesso!') => {
    const successElement = document.createElement('div');
    successElement.className = 'success-message';
    successElement.textContent = message;

    element.appendChild(successElement);
    animateIn(successElement, 'bounce');

    setTimeout(() => {
      animateOut(successElement, 'fade');
      setTimeout(() => {
        element.removeChild(successElement);
      }, 300);
    }, 2000);
  }, [animateIn, animateOut]);

  // Error animation
  const showError = useCallback((element, message = 'Erro!') => {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;

    element.appendChild(errorElement);
    animateIn(errorElement, 'shake');

    setTimeout(() => {
      animateOut(errorElement, 'fade');
      setTimeout(() => {
        element.removeChild(errorElement);
      }, 300);
    }, 3000);
  }, [animateIn, animateOut]);

  // Confetti effect
  const showConfetti = useCallback(() => {
    if (prefersReducedMotion) return;

    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'];
    const confettiCount = 50;

    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.left = Math.random() * 100 + 'vw';
      confetti.style.animationDelay = Math.random() * 3 + 's';
      confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';

      document.body.appendChild(confetti);

      setTimeout(() => {
        document.body.removeChild(confetti);
      }, 5000);
    }
  }, [prefersReducedMotion]);

  // Smooth scroll
  const smoothScrollTo = useCallback((elementId, offset = 0) => {
    const element = document.getElementById(elementId);
    if (!element) return;

    const elementPosition = element.offsetTop - offset;
    
    window.scrollTo({
      top: elementPosition,
      behavior: prefersReducedMotion ? 'auto' : 'smooth'
    });
  }, [prefersReducedMotion]);

  // Parallax effect
  const createParallaxEffect = useCallback((element, speed = 0.5) => {
    if (prefersReducedMotion) return;

    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const rate = scrolled * speed;
      element.style.transform = `translateY(${rate}px)`;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prefersReducedMotion]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, []);

  return {
    // Estado
    isAnimating,
    hoveredElement,
    pressedElement,
    prefersReducedMotion,

    // Animações
    animateElement,
    animateIn,
    animateOut,

    // Feedback
    hapticFeedback,
    visualFeedback,

    // Estados de loading
    createLoadingState,
    createProgressIndicator,

    // Efeitos de interação
    handleHover,
    handlePress,

    // Mensagens
    showSuccess,
    showError,

    // Efeitos especiais
    showConfetti,
    smoothScrollTo,
    createParallaxEffect
  };
};

// Componente de animação
export const AnimatedComponent = ({ children, animation = 'fade', delay = 0, ...props }) => {
  const { animateIn } = useMicrointeractions();
  const elementRef = useRef(null);

  useEffect(() => {
    if (elementRef.current) {
      const timer = setTimeout(() => {
        animateIn(elementRef.current, animation);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [animateIn, animation, delay]);

  return (
    <div ref={elementRef} {...props}>
      {children}
    </div>
  );
};

// Hook para transições de página
export const usePageTransition = () => {
  const [isTransitioning, setIsTransitioning] = useState(false);

  const transitionTo = useCallback((callback, duration = 300) => {
    setIsTransitioning(true);
    
    setTimeout(() => {
      callback();
      setTimeout(() => {
        setIsTransitioning(false);
      }, duration);
    }, duration);
  }, []);

  return {
    isTransitioning,
    transitionTo
  };
};
