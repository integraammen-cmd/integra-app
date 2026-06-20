// [FIX v0.2.5]: Service Worker — network-first, no cachea redirects, más robusto
const CACHE_NAME = "integra-v0.2.5";

// No pre-cachear HTML (pueden devolver redirect a /login sin auth)
// Solo cachear en runtime las respuestas exitosas

self.addEventListener("install", (event) => {
  // Skip waiting para activar inmediatamente
  self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  // Solo interceptar navegación (HTML) y assets estáticos
  if (event.request.mode !== "navigate") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Solo cachear respuestas 200 (no redirects a /login)
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      })
      .catch(() => {
        // Offline: devolver del cache si existe
        return caches.match(event.request) as Promise<Response>;
      })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
});
