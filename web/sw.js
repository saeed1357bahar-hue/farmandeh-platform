const CACHE_VERSION = "farmandeh-v0.4.3";

// Activate this service worker immediately.
self.addEventListener("install", () => {
  self.skipWaiting();
});

// Delete old caches and take control immediately.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_VERSION)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Always prefer fresh files from the network.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request, { cache: "no-store" })
      .catch(() => caches.match(event.request))
  );
});
