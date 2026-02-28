const CACHE_NAME = "books-freedom-v3";
const OFFLINE_FALLBACK = "/offline.html";
const PRECACHE = [
  "/",
  OFFLINE_FALLBACK,
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/favicon.svg",
];
const CACHEABLE_DESTINATIONS = new Set(["document", "script", "style", "image", "font"]);

function isSameOrigin(url) {
  return url.origin === self.location.origin;
}

function isCacheableRequest(request) {
  if (request.method !== "GET") return false;
  const url = new URL(request.url);
  if (!isSameOrigin(url)) return false;
  if (url.pathname.startsWith("/api")) return false;
  if (request.destination && !CACHEABLE_DESTINATIONS.has(request.destination)) return false;
  return true;
}

function isCacheableResponse(response) {
  if (!response || !response.ok) return false;
  // Cache only same-origin "basic" responses.
  return response.type === "basic";
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const fresh = await fetch(request);
    if (isCacheableResponse(fresh)) {
      await cache.put(request, fresh.clone());
    }
    return fresh;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    if (request.mode === "navigate") {
      const fallback = await cache.match(OFFLINE_FALLBACK);
      if (fallback) return fallback;
    }
    throw new Error("Network and cache unavailable");
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  const revalidate = fetch(request)
    .then(async (response) => {
      if (isCacheableResponse(response)) {
        await cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached);

  return cached || revalidate;
}

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    Promise.all([
      caches
        .keys()
        .then((keys) =>
          Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))),
        ),
      self.registration.navigationPreload?.enable?.(),
    ]),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  if (!isCacheableRequest(e.request)) return;

  const isDocument = e.request.mode === "navigate" || e.request.destination === "document";
  e.respondWith(isDocument ? networkFirst(e.request) : staleWhileRevalidate(e.request));
});

self.addEventListener("message", (e) => {
  if (e.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
