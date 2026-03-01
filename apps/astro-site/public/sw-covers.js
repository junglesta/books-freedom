const CACHE_NAME = 'book-freeddom-thumb-cache-v1';
const COVER_HOSTS = new Set(['covers.openlibrary.org']);

function isThumbRequest(request) {
  if (request.method !== 'GET') return false;
  if (request.destination !== 'image') return false;
  try {
    const url = new URL(request.url);
    return COVER_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  if (!isThumbRequest(event.request)) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(event.request);
      if (cached) return cached;

      const response = await fetch(event.request);
      if (response.ok) {
        cache.put(event.request, response.clone());
      }
      return response;
    }),
  );
});
