import { useEffect } from 'react';
import ReactGA from 'react-ga4';

// ID do Google Analytics (será configurado via variável de ambiente)
const GA_MEASUREMENT_ID = process.env.REACT_APP_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';

export function useAnalytics() {
  useEffect(() => {
    // Inicializa o GA4 apenas se o ID estiver configurado
    if (GA_MEASUREMENT_ID && GA_MEASUREMENT_ID !== 'G-XXXXXXXXXX') {
      ReactGA.initialize(GA_MEASUREMENT_ID);
      
      // Envia evento de pageview inicial
      ReactGA.send({ hitType: "pageview", page: window.location.pathname });
    }
  }, []);

  // Função para rastrear eventos de busca
  const trackSearch = (searchTerm, filters = {}) => {
    if (GA_MEASUREMENT_ID && GA_MEASUREMENT_ID !== 'G-XXXXXXXXXX') {
      ReactGA.event({
        category: 'Search',
        action: 'search',
        label: searchTerm,
        custom_parameters: {
          search_term: searchTerm,
          city: filters.city || 'all',
          state: filters.state || 'all',
          category: filters.category || 'all',
          results_count: filters.resultsCount || 0
        }
      });
    }
  };

  // Função para rastrear cliques em endereços
  const trackAddressClick = (address, position) => {
    if (GA_MEASUREMENT_ID && GA_MEASUREMENT_ID !== 'G-XXXXXXXXXX') {
      ReactGA.event({
        category: 'Address',
        action: 'click',
        label: address.cep,
        custom_parameters: {
          cep: address.cep,
          city: address.cidade,
          state: address.estado,
          position: position,
          search_term: address.searchTerm || ''
        }
      });
    }
  };

  // Função para rastrear mudanças de filtro
  const trackFilterChange = (filterType, value) => {
    if (GA_MEASUREMENT_ID && GA_MEASUREMENT_ID !== 'G-XXXXXXXXXX') {
      ReactGA.event({
        category: 'Filter',
        action: 'change',
        label: `${filterType}: ${value}`,
        custom_parameters: {
          filter_type: filterType,
          filter_value: value
        }
      });
    }
  };

  // Função para rastrear mudanças de tema
  const trackThemeChange = (theme) => {
    if (GA_MEASUREMENT_ID && GA_MEASUREMENT_ID !== 'G-XXXXXXXXXX') {
      ReactGA.event({
        category: 'UI',
        action: 'theme_change',
        label: theme,
        custom_parameters: {
          theme: theme
        }
      });
    }
  };

  // Função para rastrear instalação do PWA
  const trackPWAInstall = () => {
    if (GA_MEASUREMENT_ID && GA_MEASUREMENT_ID !== 'G-XXXXXXXXXX') {
      ReactGA.event({
        category: 'PWA',
        action: 'install',
        label: 'app_installed'
      });
    }
  };

  // Função para rastrear erros
  const trackError = (error, context = {}) => {
    if (GA_MEASUREMENT_ID && GA_MEASUREMENT_ID !== 'G-XXXXXXXXXX') {
      ReactGA.event({
        category: 'Error',
        action: 'error',
        label: error.message || error,
        custom_parameters: {
          error_message: error.message || error,
          error_stack: error.stack,
          context: JSON.stringify(context)
        }
      });
    }
  };

  return {
    trackSearch,
    trackAddressClick,
    trackFilterChange,
    trackThemeChange,
    trackPWAInstall,
    trackError
  };
}
