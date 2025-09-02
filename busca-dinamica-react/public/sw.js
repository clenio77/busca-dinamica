const CACHE_NAME = 'busca-dinamica-v2.1.0';
const STATIC_CACHE = 'static-v2.1.0';
const DYNAMIC_CACHE = 'dynamic-v2.1.0';
const API_CACHE = 'api-v2.1.0';

// Estratégias de cache
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only'
};

// Recursos estáticos para cache
const STATIC_RESOURCES = [
  '/',
  '/index.html',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png'
];

// APIs para cache
const API_ENDPOINTS = [
  '/api/cep/search',
  '/api/cep/cities',
  '/api/cep/states'
];

// Configuração de cache
const CACHE_CONFIG = {
  [STATIC_CACHE]: {
    strategy: CACHE_STRATEGIES.CACHE_FIRST,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
    maxEntries: 50
  },
  [DYNAMIC_CACHE]: {
    strategy: CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
    maxAge: 24 * 60 * 60 * 1000, // 24 horas
    maxEntries: 100
  },
  [API_CACHE]: {
    strategy: CACHE_STRATEGIES.NETWORK_FIRST,
    maxAge: 60 * 60 * 1000, // 1 hora
    maxEntries: 200
  }
};

// Utilitários de cache
const cacheUtils = {
  async openCache(cacheName) {
    return await caches.open(cacheName);
  },

  async addToCache(cacheName, request, response) {
    const cache = await this.openCache(cacheName);
    await cache.put(request, response.clone());
    return response;
  },

  async getFromCache(cacheName, request) {
    const cache = await this.openCache(cacheName);
    return await cache.match(request);
  },

  async deleteOldCaches() {
    const cacheNames = await caches.keys();
    const oldCaches = cacheNames.filter(name => 
      name !== STATIC_CACHE && 
      name !== DYNAMIC_CACHE && 
      name !== API_CACHE
    );
    
    await Promise.all(
      oldCaches.map(name => caches.delete(name))
    );
  },

  async cleanupCache(cacheName, maxEntries) {
    const cache = await this.openCache(cacheName);
    const keys = await cache.keys();
    
    if (keys.length > maxEntries) {
      const keysToDelete = keys.slice(0, keys.length - maxEntries);
      await Promise.all(
        keysToDelete.map(key => cache.delete(key))
      );
    }
  }
};

// Estratégias de cache
const cacheStrategies = {
  async cacheFirst(request, cacheName) {
    const cachedResponse = await cacheUtils.getFromCache(cacheName, request);
    
    if (cachedResponse) {
      return cachedResponse;
    }

    try {
      const networkResponse = await fetch(request);
      if (networkResponse.ok) {
        await cacheUtils.addToCache(cacheName, request, networkResponse);
      }
      return networkResponse;
    } catch (error) {
      console.error('Cache first strategy failed:', error);
      return new Response('Offline content not available', {
        status: 503,
        statusText: 'Service Unavailable'
      });
    }
  },

  async networkFirst(request, cacheName) {
    try {
      const networkResponse = await fetch(request);
      if (networkResponse.ok) {
        await cacheUtils.addToCache(cacheName, request, networkResponse.clone());
      }
      return networkResponse;
    } catch (error) {
      console.log('Network failed, trying cache:', error);
      const cachedResponse = await cacheUtils.getFromCache(cacheName, request);
      
      if (cachedResponse) {
        return cachedResponse;
      }
      
      return new Response('Network error and no cached content', {
        status: 503,
        statusText: 'Service Unavailable'
      });
    }
  },

  async staleWhileRevalidate(request, cacheName) {
    const cachedResponse = await cacheUtils.getFromCache(cacheName, request);
    
    const fetchPromise = fetch(request).then(networkResponse => {
      if (networkResponse.ok) {
        cacheUtils.addToCache(cacheName, request, networkResponse.clone());
      }
      return networkResponse;
    }).catch(() => cachedResponse);

    return cachedResponse || fetchPromise;
  }
};

// Interceptação de requisições
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Pular requisições não-GET
  if (request.method !== 'GET') {
    return;
  }

  // Pular requisições de analytics
  if (url.pathname.includes('google-analytics') || url.pathname.includes('gtag')) {
    return;
  }

  // Estratégia baseada no tipo de recurso
  if (STATIC_RESOURCES.includes(url.pathname)) {
    event.respondWith(
      cacheStrategies.cacheFirst(request, STATIC_CACHE)
    );
  } else if (API_ENDPOINTS.some(endpoint => url.pathname.includes(endpoint))) {
    event.respondWith(
      cacheStrategies.networkFirst(request, API_CACHE)
    );
  } else if (url.pathname.startsWith('/static/') || url.pathname.includes('.')) {
    event.respondWith(
      cacheStrategies.staleWhileRevalidate(request, DYNAMIC_CACHE)
    );
  } else {
    event.respondWith(
      cacheStrategies.networkFirst(request, DYNAMIC_CACHE)
    );
  }
});

// Instalação do Service Worker
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache de recursos estáticos
      caches.open(STATIC_CACHE).then(cache => {
        return cache.addAll(STATIC_RESOURCES);
      }),
      // Limpar caches antigos
      cacheUtils.deleteOldCaches()
    ])
  );
  
  self.skipWaiting();
});

// Ativação do Service Worker
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    Promise.all([
      // Limpar caches antigos
      cacheUtils.deleteOldCaches(),
      // Limpar entradas antigas dos caches
      cacheUtils.cleanupCache(STATIC_CACHE, CACHE_CONFIG[STATIC_CACHE].maxEntries),
      cacheUtils.cleanupCache(DYNAMIC_CACHE, CACHE_CONFIG[DYNAMIC_CACHE].maxEntries),
      cacheUtils.cleanupCache(API_CACHE, CACHE_CONFIG[API_CACHE].maxEntries),
      // Tomar controle imediatamente
      self.clients.claim()
    ])
  );
});

// Background sync para requisições offline
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Sincronizar dados offline
      syncOfflineData()
    );
  }
});

// Push notifications
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'Nova atualização disponível!',
    icon: '/logo192.png',
    badge: '/logo192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver agora',
        icon: '/logo192.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/logo192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Busca Dinâmica', options)
  );
});

// Click em notificação
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Função para sincronizar dados offline
async function syncOfflineData() {
  try {
    // Implementar lógica de sincronização
    console.log('Sincronizando dados offline...');
  } catch (error) {
    console.error('Erro na sincronização:', error);
  }
}

// Mensagens do Service Worker
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Performance monitoring
self.addEventListener('fetch', event => {
  const startTime = performance.now();
  
  event.waitUntil(
    (async () => {
      try {
        await event.respondWith(fetch(event.request));
        const duration = performance.now() - startTime;
        
        // Log de performance
        console.log(`Fetch ${event.request.url}: ${duration.toFixed(2)}ms`);
      } catch (error) {
        console.error('Fetch error:', error);
      }
    })()
  );
});
