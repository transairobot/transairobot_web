// Service Worker for TransAIRobot Website
// Provides caching and offline support

const CACHE_NAME = 'transairobot-cache-v1';
const RUNTIME_CACHE = 'transairobot-runtime-v1';

// Resources to cache on install
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/css/app.css',
  '/js/app.js',
  '/js/chunk-vendors.js',
  '/offline.html'
];

// Install event - precache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Pre-caching resources');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const currentCaches = [CACHE_NAME, RUNTIME_CACHE];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
    }).then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (event.request.url.startsWith(self.location.origin)) {
    // For API requests, use network first, then cache
    if (event.request.url.includes('/api/')) {
      event.respondWith(
        fetch(event.request)
          .then(response => {
            // Clone the response for caching
            const responseToCache = response.clone();
            
            caches.open(RUNTIME_CACHE)
              .then(cache => {
                // Only cache successful responses
                if (response.status === 200) {
                  cache.put(event.request, responseToCache);
                }
              });
            
            return response;
          })
          .catch(() => {
            // If network fails, try to serve from cache
            return caches.match(event.request)
              .then(cachedResponse => {
                if (cachedResponse) {
                  return cachedResponse;
                }
                
                // If no cached API response, return offline JSON
                if (event.request.headers.get('accept').includes('application/json')) {
                  return new Response(
                    JSON.stringify({ error: 'You are offline' }),
                    { 
                      headers: { 'Content-Type': 'application/json' },
                      status: 503
                    }
                  );
                }
              });
          })
      );
    } 
    // For HTML navigation requests, use cache first for fast loading, then update cache
    else if (event.request.mode === 'navigate') {
      event.respondWith(
        caches.match(event.request)
          .then(cachedResponse => {
            // Return cached response immediately if available
            const fetchPromise = fetch(event.request)
              .then(networkResponse => {
                // Update the cache with the new response
                caches.open(CACHE_NAME)
                  .then(cache => {
                    cache.put(event.request, networkResponse.clone());
                  });
                return networkResponse;
              })
              .catch(() => {
                // If both cache and network fail, show offline page
                return caches.match('/offline.html');
              });
            
            return cachedResponse || fetchPromise;
          })
      );
    }
    // For other requests (assets, etc.), use cache first strategy
    else {
      event.respondWith(
        caches.match(event.request)
          .then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // If not in cache, fetch from network and cache for future
            return fetch(event.request)
              .then(response => {
                // Clone the response for caching
                const responseToCache = response.clone();
                
                caches.open(RUNTIME_CACHE)
                  .then(cache => {
                    // Only cache successful responses
                    if (response.status === 200) {
                      cache.put(event.request, responseToCache);
                    }
                  });
                
                return response;
              })
              .catch(() => {
                // If it's an image request, return a placeholder
                if (event.request.destination === 'image') {
                  return caches.match('/assets/images/placeholder.png');
                }
              });
          })
      );
    }
  }
});

// Handle push notifications
self.addEventListener('push', event => {
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/assets/icons/notification-icon.png',
    badge: '/assets/icons/badge-icon.png',
    data: {
      url: data.url
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});
