/**
 * MST Service Worker
 * 
 * Offline-first strategie:
 * - Cache First pro statické assety
 * - Network First pro API (s fallback na cache)
 * - Stale While Revalidate pro HTML
 */

const CACHE_NAME = 'mst-v1';
const STATIC_CACHE = 'mst-static-v1';
const DYNAMIC_CACHE = 'mst-dynamic-v1';

/**
 * Statické assety k pre-cache
 */
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

/**
 * Install - pre-cache statických assetů
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Pre-caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Install complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Install failed:', error);
      })
  );
});

/**
 * Activate - cleanup starých cache
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => {
              // Smazat cache které nejsou aktuální
              return name !== STATIC_CACHE && 
                     name !== DYNAMIC_CACHE &&
                     name.startsWith('mst-');
            })
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Activate complete');
        return self.clients.claim();
      })
  );
});

/**
 * Fetch - routing strategie
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorovat non-GET requesty
  if (request.method !== 'GET') {
    return;
  }

  // Ignorovat chrome-extension a jiné protokoly
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Routing podle typu requestu
  if (isStaticAsset(url)) {
    // Cache First pro statické assety
    event.respondWith(cacheFirst(request));
  } else if (isApiRequest(url)) {
    // Network First pro API
    event.respondWith(networkFirst(request));
  } else {
    // Stale While Revalidate pro HTML a ostatní
    event.respondWith(staleWhileRevalidate(request));
  }
});

/**
 * Helpers - detekce typu requestu
 */
function isStaticAsset(url) {
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.svg', '.ico', '.woff', '.woff2'];
  return staticExtensions.some((ext) => url.pathname.endsWith(ext));
}

function isApiRequest(url) {
  return url.pathname.startsWith('/api/') || 
         url.hostname.includes('firebaseio.com') ||
         url.hostname.includes('googleapis.com');
}

/**
 * Cache First Strategy
 * - Vrátí z cache pokud existuje
 * - Jinak fetch a uložit do cache
 */
async function cacheFirst(request) {
  const cached = await caches.match(request);
  
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.error('[SW] Cache First failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

/**
 * Network First Strategy
 * - Zkusí síť
 * - Fallback na cache při selhání
 */
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    
    const cached = await caches.match(request);
    
    if (cached) {
      return cached;
    }
    
    // Offline response pro API
    return new Response(
      JSON.stringify({ 
        error: 'offline',
        message: 'Jste offline. Data budou synchronizována po obnovení připojení.'
      }),
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * Stale While Revalidate Strategy
 * - Vrátí z cache okamžitě
 * - Paralelně aktualizuje cache ze sítě
 */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => {
      // Síť selhala, nic nedělat
    });

  // Vrátit cached nebo počkat na fetch
  return cached || fetchPromise;
}

/**
 * Background Sync - pro offline operace
 */
self.addEventListener('sync', (event) => {
  console.log('[SW] Sync event:', event.tag);

  if (event.tag === 'sync-work-records') {
    event.waitUntil(syncWorkRecords());
  }
});

/**
 * Sync work records když je online
 */
async function syncWorkRecords() {
  console.log('[SW] Syncing work records...');
  
  // Tato funkce bude volána z aplikace
  // Prozatím jen logujeme
  const clients = await self.clients.matchAll();
  
  clients.forEach((client) => {
    client.postMessage({
      type: 'SYNC_REQUESTED',
      payload: { tag: 'sync-work-records' }
    });
  });
}

/**
 * Push notifications (pro budoucí použití)
 */
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);

  if (!event.data) {
    return;
  }

  const data = event.data.json();
  
  const options = {
    body: data.body || 'Nová notifikace',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: data.data || {},
    actions: data.actions || [],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'MST', options)
  );
});

/**
 * Notification click
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event);
  
  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({ type: 'window' })
      .then((clientList) => {
        // Fokus na existující okno nebo otevřít nové
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        
        if (self.clients.openWindow) {
          return self.clients.openWindow('/');
        }
      })
  );
});

/**
 * Message handler - komunikace s aplikací
 */
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);

  const { type, payload } = event.data;

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CACHE_URLS':
      cacheUrls(payload.urls);
      break;
      
    case 'CLEAR_CACHE':
      clearCache(payload.cacheName);
      break;
      
    default:
      console.log('[SW] Unknown message type:', type);
  }
});

/**
 * Cache specific URLs
 */
async function cacheUrls(urls) {
  const cache = await caches.open(DYNAMIC_CACHE);
  await cache.addAll(urls);
  console.log('[SW] Cached URLs:', urls);
}

/**
 * Clear specific cache
 */
async function clearCache(cacheName) {
  if (cacheName) {
    await caches.delete(cacheName);
    console.log('[SW] Cleared cache:', cacheName);
  } else {
    const names = await caches.keys();
    await Promise.all(names.map((name) => caches.delete(name)));
    console.log('[SW] Cleared all caches');
  }
}

console.log('[SW] Service Worker loaded');
