const CACHE_NAME = 'appdock-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json',
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Caching shell assets');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) {
                    console.log('[Service Worker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    // 1. Blob URLs are handled by the browser directly (IndexedDB content), pass through.
    if (event.request.url.startsWith('blob:')) {
        return;
    }

    // 2. Cache First strategy for the App Shell
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).then((networkResponse) => {
                // Optional: Cache new requests dynamically if needed
                return networkResponse;
            });
        })
    );
});
