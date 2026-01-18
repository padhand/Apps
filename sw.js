// Service Worker for Quiz Master App PWA

const CACHE_NAME = 'quiz-master-cache-v1';
const urlsToCache = [
  './index.html', // The main application file
  './manifest.json',
  // You would typically list all icon files here:
  // './icons/icon-72x72.png',
  // './icons/icon-192x192.png',
  // etc.
  // Add a placeholder for necessary icon files
];

// --- Installation ---
self.addEventListener('install', event => {
  console.log('[Service Worker] Install');
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.error('[Service Worker] Cache addAll failed:', err);
      })
  );
});

// --- Activation / Cleanup ---
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activate');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control of un-controlled clients immediately
  return self.clients.claim();
});

// --- Fetching / Caching Strategy (Cache-first) ---
self.addEventListener('fetch', event => {
  // Only cache GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        
        // No cache match - fetch from network
        return fetch(event.request)
          .then(res => {
            // Check if we received a valid response
            if(!res || res.status !== 200 || res.type !== 'basic') {
              return res;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and can only be consumed once.
            const responseToCache = res.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return res;
          })
          .catch(err => {
            console.error('[Service Worker] Fetch failed:', err);
            // Fallback for network failures (e.g., return an offline page, if you had one)
            // For now, it will just fail gracefully.
          });
      })
  );
});
