// Écouteur d'installation (permet à l'application de s'installer)
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Écouteur d'activation
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Écouteur de requêtes (OBLIGATOIRE pour que Chrome propose "Installer")
self.addEventListener('fetch', (event) => {
  // On laisse le navigateur gérer les requêtes normalement
  event.respondWith(
    fetch(event.request).catch(() => {
      return new Response("Vous êtes hors ligne.");
    })
  );
});
