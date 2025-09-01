import { useEffect, useRef } from 'react';

export function usePerformance() {
  const performanceRef = useRef({
    pageLoadTime: 0,
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    cumulativeLayoutShift: 0,
    firstInputDelay: 0
  });

  useEffect(() => {
    // Métricas de carregamento da página
    const measurePageLoad = () => {
      if ('performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
          performanceRef.current.pageLoadTime = navigation.loadEventEnd - navigation.loadEventStart;
        }
      }
    };

    // First Contentful Paint (FCP)
    const measureFCP = () => {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.name === 'first-contentful-paint') {
              performanceRef.current.firstContentfulPaint = entry.startTime;
            }
          });
        });
        observer.observe({ entryTypes: ['paint'] });
      }
    };

    // Largest Contentful Paint (LCP)
    const measureLCP = () => {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          performanceRef.current.largestContentfulPaint = lastEntry.startTime;
        });
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      }
    };

    // Cumulative Layout Shift (CLS)
    const measureCLS = () => {
      if ('PerformanceObserver' in window) {
        let clsValue = 0;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          performanceRef.current.cumulativeLayoutShift = clsValue;
        });
        observer.observe({ entryTypes: ['layout-shift'] });
      }
    };

    // First Input Delay (FID)
    const measureFID = () => {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            performanceRef.current.firstInputDelay = entry.processingStart - entry.startTime;
          });
        });
        observer.observe({ entryTypes: ['first-input'] });
      }
    };

    // Medir tempo de busca
    const measureSearchTime = (startTime) => {
      const endTime = performance.now();
      const searchTime = endTime - startTime;
      
      // Enviar métrica para analytics se disponível
      if (window.gtag) {
        window.gtag('event', 'search_performance', {
          search_time_ms: Math.round(searchTime),
          custom_metric_1: Math.round(searchTime)
        });
      }
      
      return searchTime;
    };

    // Medir tempo de renderização de componentes
    const measureRenderTime = (componentName, startTime) => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      console.log(`[Performance] ${componentName} renderizado em ${Math.round(renderTime)}ms`);
      
      // Enviar métrica para analytics se disponível
      if (window.gtag) {
        window.gtag('event', 'component_render', {
          component_name: componentName,
          render_time_ms: Math.round(renderTime),
          custom_metric_2: Math.round(renderTime)
        });
      }
      
      return renderTime;
    };

    // Monitorar uso de memória
    const measureMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = performance.memory;
        const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
        const totalMB = Math.round(memory.totalJSHeapSize / 1024 / 1024);
        
        console.log(`[Performance] Memória: ${usedMB}MB / ${totalMB}MB`);
        
        // Enviar métrica para analytics se disponível
        if (window.gtag) {
          window.gtag('event', 'memory_usage', {
            used_memory_mb: usedMB,
            total_memory_mb: totalMB,
            custom_metric_3: usedMB
          });
        }
        
        return { used: usedMB, total: totalMB };
      }
      return null;
    };

    // Monitorar performance de rede
    const measureNetworkPerformance = () => {
      if ('connection' in navigator) {
        const connection = navigator.connection;
        const effectiveType = connection.effectiveType || 'unknown';
        const downlink = connection.downlink || 0;
        const rtt = connection.rtt || 0;
        
        console.log(`[Performance] Rede: ${effectiveType}, ${downlink}Mbps, ${rtt}ms RTT`);
        
        // Enviar métrica para analytics se disponível
        if (window.gtag) {
          window.gtag('event', 'network_performance', {
            effective_type: effectiveType,
            downlink_mbps: downlink,
            rtt_ms: rtt,
            custom_metric_4: rtt
          });
        }
        
        return { effectiveType, downlink, rtt };
      }
      return null;
    };

    // Inicializar medições
    measurePageLoad();
    measureFCP();
    measureLCP();
    measureCLS();
    measureFID();

    // Medir performance periodicamente
    const interval = setInterval(() => {
      measureMemoryUsage();
      measureNetworkPerformance();
    }, 30000); // A cada 30 segundos

    // Limpar intervalo
    return () => {
      clearInterval(interval);
    };
  }, []);

  // Funções expostas
  const getPerformanceMetrics = () => {
    return { ...performanceRef.current };
  };

  const startSearchTimer = () => {
    return performance.now();
  };

  const endSearchTimer = (startTime) => {
    return performance.now() - startTime;
  };

  const startRenderTimer = (componentName) => {
    return { componentName, startTime: performance.now() };
  };

  const endRenderTimer = (timer) => {
    const endTime = performance.now();
    const renderTime = endTime - timer.startTime;
    
    console.log(`[Performance] ${timer.componentName} renderizado em ${Math.round(renderTime)}ms`);
    
    return renderTime;
  };

  return {
    getPerformanceMetrics,
    startSearchTimer,
    endSearchTimer,
    startRenderTimer,
    endRenderTimer
  };
}
