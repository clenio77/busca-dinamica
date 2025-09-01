// Configurações do Google Analytics 4
export const ANALYTICS_CONFIG = {
  // ID de medição do GA4 (configurado via variável de ambiente)
  MEASUREMENT_ID: process.env.REACT_APP_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX',
  
  // Configurações de debug
  DEBUG_MODE: process.env.NODE_ENV === 'development',
  
  // Eventos personalizados
  EVENTS: {
    SEARCH: {
      category: 'Search',
      actions: {
        PERFORM: 'search_perform',
        CLEAR: 'search_clear',
        SUGGESTION: 'search_suggestion'
      }
    },
    FILTER: {
      category: 'Filter',
      actions: {
        CITY_CHANGE: 'city_change',
        STATE_CHANGE: 'state_change',
        CATEGORY_CHANGE: 'category_change',
        CLEAR_ALL: 'clear_all_filters'
      }
    },
    ADDRESS: {
      category: 'Address',
      actions: {
        CLICK: 'address_click',
        COPY: 'address_copy',
        SHARE: 'address_share'
      }
    },
    UI: {
      category: 'UI',
      actions: {
        THEME_CHANGE: 'theme_change',
        SIDEBAR_TOGGLE: 'sidebar_toggle',
        MOBILE_VIEW: 'mobile_view',
        DESKTOP_VIEW: 'desktop_view'
      }
    },
    PWA: {
      category: 'PWA',
      actions: {
        INSTALL: 'pwa_install',
        INSTALL_PROMPT: 'install_prompt_shown',
        INSTALL_DECLINE: 'install_decline'
      }
    },
    PERFORMANCE: {
      category: 'Performance',
      actions: {
        PAGE_LOAD: 'page_load',
        SEARCH_LOAD: 'search_load',
        ERROR: 'error_occurred'
      }
    }
  },
  
  // Dimensões personalizadas
  CUSTOM_DIMENSIONS: {
    USER_THEME: 'user_theme',
    SEARCH_TERM: 'search_term',
    FILTER_COMBINATION: 'filter_combination',
    DEVICE_TYPE: 'device_type',
    SCREEN_SIZE: 'screen_size'
  },
  
  // Métricas personalizadas
  CUSTOM_METRICS: {
    SEARCH_RESULTS_COUNT: 'search_results_count',
    SEARCH_TIME: 'search_time_ms',
    PAGE_LOAD_TIME: 'page_load_time_ms',
    USER_SESSION_DURATION: 'session_duration_seconds'
  }
};

// Função para verificar se o Analytics está habilitado
export const isAnalyticsEnabled = () => {
  return ANALYTICS_CONFIG.MEASUREMENT_ID && 
         ANALYTICS_CONFIG.MEASUREMENT_ID !== 'G-XXXXXXXXXX' &&
         typeof window !== 'undefined' &&
         !window.location.hostname.includes('localhost');
};

// Função para obter informações do dispositivo
export const getDeviceInfo = () => {
  const userAgent = navigator.userAgent;
  const screen = window.screen;
  
  return {
    deviceType: /Mobile|Android|iPhone|iPad/.test(userAgent) ? 'mobile' : 'desktop',
    screenSize: `${screen.width}x${screen.height}`,
    userAgent: userAgent,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  };
};

// Função para obter informações da sessão
export const getSessionInfo = () => {
  return {
    sessionId: sessionStorage.getItem('sessionId') || generateSessionId(),
    pageLoadTime: performance.now(),
    referrer: document.referrer,
    url: window.location.href
  };
};

// Função para gerar ID de sessão
const generateSessionId = () => {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  sessionStorage.setItem('sessionId', sessionId);
  return sessionId;
};
