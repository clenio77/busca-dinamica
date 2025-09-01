import React, { Suspense } from 'react';

// Loading component para Suspense
const LoadingFallback = ({ className = "flex items-center justify-center p-4" }) => (
  <div className={className}>
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <span className="ml-2 text-gray-600 dark:text-gray-400">Carregando...</span>
  </div>
);

// Componentes lazy loaded
export const LazyAddressList = React.lazy(() => import('./AddressList'));
export const LazyStatsCard = React.lazy(() => import('./StatsCard'));
export const LazySidebar = React.lazy(() => import('./Sidebar'));
export const LazyTopSearchBar = React.lazy(() => import('./TopSearchBar'));

// Wrapper com Suspense
export const withSuspense = (Component, fallback = <LoadingFallback />) => (props) => (
  <Suspense fallback={fallback}>
    <Component {...props} />
  </Suspense>
);

// Componentes com Suspense pré-configurado
export const AddressListWithSuspense = withSuspense(LazyAddressList);
export const StatsCardWithSuspense = withSuspense(LazyStatsCard);
export const SidebarWithSuspense = withSuspense(LazySidebar);
export const TopSearchBarWithSuspense = withSuspense(LazyTopSearchBar);
