const SW_VERSION = "sitepulse-v3";
const CACHE_PREFIX = "sitepulse-";
const PAGE_CACHE = `${CACHE_PREFIX}pages-${SW_VERSION}`;
const STATIC_CACHE = `${CACHE_PREFIX}static-${SW_VERSION}`;
const CORE_STATIC_ASSETS = ["/manifest.webmanifest", "/sitepulse-icon.svg", "/sitepulse-maskable.svg"];

function canCacheResponse(response) {
  return Boolean(response) && response.status >= 200 && response.status < 400;
}

function isStaticAssetPath(pathname) {
  return (
    pathname.startsWith("/_next/static/") ||
    /\.(?:js|css|png|jpg|jpeg|svg|webp|ico|woff2?|ttf|map)$/i.test(pathname)
  );
}

function shouldBypass(pathname) {
  return pathname.startsWith("/api/") || pathname === "/sw.js";
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const fresh = await fetch(request);
    if (canCacheResponse(fresh)) {
      await cache.put(request, fresh.clone());
    }
    return fresh;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw error;
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const networkFetch = fetch(request)
    .then(async (response) => {
      if (canCacheResponse(response)) {
        await cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  if (cached) {
    networkFetch.catch(() => null);
    return cached;
  }

  const fresh = await networkFetch;
  if (fresh) return fresh;
  return Response.error();
}

async function handleNavigate(request) {
  const cache = await caches.open(PAGE_CACHE);
  try {
    const fresh = await fetch(request);
    if (canCacheResponse(fresh)) {
      await cache.put(request, fresh.clone());
    }
    return fresh;
  } catch {
    const cachedPage = await cache.match(request);
    if (cachedPage) return cachedPage;
    const cachedHome = await cache.match("/");
    if (cachedHome) return cachedHome;
    return Response.error();
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(CORE_STATIC_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith(CACHE_PREFIX))
            .filter((key) => key !== PAGE_CACHE && key !== STATIC_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (shouldBypass(url.pathname)) return;

  if (request.mode === "navigate") {
    event.respondWith(handleNavigate(request));
    return;
  }

  if (isStaticAssetPath(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
    return;
  }

  event.respondWith(networkFirst(request, PAGE_CACHE));
});
