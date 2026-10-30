
/* ACADOMAX — Service Worker (Phase 2)
   Rôle : rendre l'application installable + servir la coquille en cache.
   Ne touche JAMAIS au contenu de l'iframe GAS (script.google.com). */

const CACHE = 'acadomax-shell-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// Installation : mise en cache de la coquille
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activation : nettoyage des anciennes versions du cache
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Interception des requêtes
self.addEventListener('fetch', event => {
  const req = event.request;

  // Ne pas intercepter le contenu de l'iframe GAS (cross-origin)
  if (req.url.includes('script.google.com') ||
      req.url.includes('googleusercontent.com') ||
      req.url.includes('placehold.co') ||
      req.url.includes('fonts.googleapis.com') ||
      req.url.includes('fonts.gstatic.com')) {
    return;
  }

  // Stratégie : cache-first pour la coquille, réseau sinon
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(resp => {
        if (req.url.startsWith(self.location.origin) && resp.ok) {
          const clone = resp.clone();
          caches.open(CACHE).then(c => c.put(req, clone));
        }
        return resp;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
