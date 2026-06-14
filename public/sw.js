/* 通書擇日 service worker — offline-capable, but always updates when online.
   v2 fixes a cache-first trap that froze returning visitors on an old build:
     • navigations are NETWORK-FIRST, so a new deploy loads immediately (offline → cached shell);
     • other same-origin GETs (hashed assets, art, icons) use stale-while-revalidate;
     • bumping CACHE purges the stale v1 cache on activate.
   If you ever change caching strategy again, bump this version string. */
const CACHE = 'tongshu-v2';
const CORE = ['./', './index.html', './manifest.webmanifest'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  // Navigations / the app shell: network-first so a fresh deploy (new asset hashes) is picked up at once;
  // fall back to the cached shell when offline.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put('./', copy)); return res; })
        .catch(() => caches.match(req).then((hit) => hit || caches.match('./')))
    );
    return;
  }

  // Everything else (content-hashed JS/CSS, art, icons): stale-while-revalidate.
  e.respondWith(
    caches.match(req).then((hit) => {
      const net = fetch(req).then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
        return res;
      }).catch(() => hit);
      return hit || net;
    })
  );
});
