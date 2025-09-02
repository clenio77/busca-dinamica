import React, { Suspense, lazy } from 'react';

// Loading component otimizado
const LoadingSpinner = () => (
  <div className="flex justify-center items-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    <span className="ml-2 text-gray-600 dark:text-gray-400">Carregando...</span>
  </div>
);

// Error boundary para lazy components
const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <div className="text-red-500 text-4xl mb-4">⚠️</div>
    <h3 className="text-lg font-semibold mb-2">Algo deu errado</h3>
    <p className="text-gray-600 dark:text-gray-400 mb-4">
      Não foi possível carregar este componente
    </p>
    <button
      onClick={resetErrorBoundary}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
    >
      Tentar novamente
    </button>
  </div>
);

// Lazy components com preloading
const AddressList = lazy(() => 
  import('./AddressList').then(module => ({
    default: module.default
  }))
);

const AdvancedActions = lazy(() => 
  import('./AdvancedActions').then(module => ({
    default: module.default
  }))
);

const VoiceSearchButton = lazy(() => 
  import('./VoiceSearchButton').then(module => ({
    default: module.default
  }))
);

const PWAInstallPrompt = lazy(() => 
  import('./PWAInstallPrompt').then(module => ({
    default: module.default
  }))
);

// Preload functions para melhor performance
export const preloadAddressList = () => {
  const AddressListPromise = import('./AddressList');
  return AddressListPromise;
};

export const preloadAdvancedActions = () => {
  const AdvancedActionsPromise = import('./AdvancedActions');
  return AdvancedActionsPromise;
};

export const preloadVoiceSearch = () => {
  const VoiceSearchPromise = import('./VoiceSearchButton');
  return VoiceSearchPromise;
};

// Wrapper components com Suspense
export const LazyAddressList = (props) => (
  <Suspense fallback={<LoadingSpinner />}>
    <AddressList {...props} />
  </Suspense>
);

export const LazyAdvancedActions = (props) => (
  <Suspense fallback={<LoadingSpinner />}>
    <AdvancedActions {...props} />
  </Suspense>
);

export const LazyVoiceSearchButton = (props) => (
  <Suspense fallback={<LoadingSpinner />}>
    <VoiceSearchButton {...props} />
  </Suspense>
);

export const LazyPWAInstallPrompt = (props) => (
  <Suspense fallback={<LoadingSpinner />}>
    <PWAInstallPrompt {...props} />
  </Suspense>
);

// Intersection Observer para lazy loading baseado em visibilidade
export const useIntersectionObserver = (ref, options = {}) => {
  const [isIntersecting, setIsIntersecting] = React.useState(false);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref, options]);

  return isIntersecting;
};

// Componente com lazy loading baseado em visibilidade
export const LazyLoadOnVisible = ({ children, fallback = <LoadingSpinner /> }) => {
  const [shouldLoad, setShouldLoad] = React.useState(false);
  const ref = React.useRef();

  const isVisible = useIntersectionObserver(ref);

  React.useEffect(() => {
    if (isVisible && !shouldLoad) {
      setShouldLoad(true);
    }
  }, [isVisible, shouldLoad]);

  return (
    <div ref={ref}>
      {shouldLoad ? children : fallback}
    </div>
  );
};

export default {
  LazyAddressList,
  LazyAdvancedActions,
  LazyVoiceSearchButton,
  LazyPWAInstallPrompt,
  LazyLoadOnVisible,
  preloadAddressList,
  preloadAdvancedActions,
  preloadVoiceSearch
};
