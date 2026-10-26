const V = "nanda-v2";
const FILES = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(k => Promise.all(k.filter(n => n !== V).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || new URL(e.request.url).pathname.startsWith("/api/")) return;
  e.respondWith(
    caches.match(e.request).then(hit => {
      if (hit) return hit;
      return fetch(e.request)
        .then(r => {
          if (r && r.ok && new URL(e.request.url).origin === location.origin) {
            const copy = r.clone();
            caches.open(V).then(c => c.put(e.request, copy));
          }
          return r;
        })
        .catch(() => (e.request.mode === "navigate" ? caches.match("index.html") : undefined));
    })
  );
});
