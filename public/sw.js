const CACHE = "socialrush-static-v1";
const STATIC_ASSETS = ["/", "/offline"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET" || request.url.includes("/api/") || request.url.includes("supabase")) return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  // Navigation is deliberately network-first: dashboard, wallet and orders are never shown stale.
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match("/offline")));
    return;
  }
  if (url.pathname.startsWith("/_next/static/") || /\.(?:png|jpg|jpeg|webp|svg|ico)$/i.test(url.pathname)) {
    event.respondWith(caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      const copy = response.clone(); caches.open(CACHE).then((cache) => cache.put(request, copy)); return response;
    })));
  }
});
