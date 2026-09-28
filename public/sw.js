/**
 * Service Worker Souverain - L'Œil de l'Atelier / ALPHABETTE SASU
 * 
 * Stratégies de mise en cache :
 * 1. Cache-First pour les assets statiques (scripts, styles, polices, icônes, images)
 * 2. Network-First with Offline Fallback pour les formulaires d'intervention artisan et API (/api/artisan/*)
 * 3. Gestion de la synchronisation en arrière-plan et reprise à la reconnexion.
 */

const CACHE_VERSION = 'v1.4.2';
const STATIC_CACHE_NAME = `alphabette-atelier-static-${CACHE_VERSION}`;
const API_CACHE_NAME = `alphabette-atelier-api-${CACHE_VERSION}`;

// Assets prioritaires mis en cache dès l'installation
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
];

// Patterns d'assets statiques éligibles au Cache-First
const STATIC_ASSET_REGEX = /\.(?:js|css|woff2?|ttf|png|jpe?g|gif|svg|ico|webp)(?:\?.*)?$/i;

// 1. Installation du Service Worker : mise en cache immédiate des assets vitaux
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then(async (cache) => {
      try {
        await cache.addAll(PRECACHE_ASSETS);
      } catch (err) {
        console.warn('[SW] Pré-cache partiel des assets :', err);
      }
      return self.skipWaiting();
    })
  );
});

// 2. Activation : purge des anciens caches obsolètes et prise de contrôle immédiate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE_NAME && name !== API_CACHE_NAME)
          .map((name) => {
            console.log('[SW] Nettoyage ancien cache :', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Routage des requêtes HTTP (Fetch)
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Ignorer les requêtes non-GET pour le cache natif HTTP (les formulaires POST sont gérés par Network-First avec fallback)
  if (request.method === 'POST') {
    if (url.pathname.startsWith('/api/artisan/')) {
      // Network-First avec Offline Fallback pour les soumissions de formulaires d'interventions
      event.respondWith(handleArtisanFormPost(request));
    }
    return;
  }

  // A. Formulaires & API Artisan GET : Stratégie Network-First with Offline Fallback
  if (url.pathname.startsWith('/api/artisan/')) {
    event.respondWith(handleNetworkFirstWithFallback(request));
    return;
  }

  // B. Assets statiques (JS, CSS, images, fontes) : Stratégie Cache-First
  if (STATIC_ASSET_REGEX.test(url.pathname) || url.pathname.startsWith('/assets/')) {
    event.respondWith(handleCacheFirst(request));
    return;
  }

  // C. Navigations HTML / SPA : Stale-While-Revalidate avec fallback /index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(STATIC_CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const fallback = await caches.match('/index.html');
          return fallback || new Response('Application hors ligne disponible', {
            status: 200,
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
          });
        })
    );
    return;
  }

  // D. Autres requêtes : réseau direct avec secours cache
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

/**
 * Stratégie Cache-First pour les assets
 */
async function handleCacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    // Renvoyer immédiatement le cache, et mettre à jour en arrière-plan (revalidation)
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          caches.open(STATIC_CACHE_NAME).then((cache) => cache.put(request, networkResponse));
        }
      })
      .catch(() => { /* Hors-ligne : le cache a déjà été fourni */ });
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const responseClone = networkResponse.clone();
      caches.open(STATIC_CACHE_NAME).then((cache) => cache.put(request, responseClone));
    }
    return networkResponse;
  } catch (err) {
    // Si l'asset n'est pas disponible et hors-ligne
    return new Response('', { status: 408, statusText: 'Offline Asset Unavailable' });
  }
}

/**
 * Stratégie Network-First with Offline Fallback pour les formulaires d'intervention artisan
 */
async function handleNetworkFirstWithFallback(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const responseClone = networkResponse.clone();
      caches.open(API_CACHE_NAME).then((cache) => cache.put(request, responseClone));
      return networkResponse;
    }
    throw new Error('Réponse réseau non optimale');
  } catch (err) {
    // Secours hors-ligne : tenter de récupérer depuis le cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Réponse de secours synthétique avec indicateur offline
    return new Response(
      JSON.stringify({
        offline: true,
        fallback: true,
        message: 'Mode atelier hors-ligne actif. Vos données locales sont préservées dans IndexedDB.',
        timestamp: Date.now()
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      }
    );
  }
}

/**
 * Gestion des requêtes POST de formulaire d'intervention en cas de coupure réseau
 */
async function handleArtisanFormPost(request) {
  try {
    return await fetch(request.clone());
  } catch (err) {
    // Le serveur est injoignable, on signale au client que la requête a été captée hors ligne
    // Le module local IndexedDB (artisanInterventionDb) assurera la persistance complète
    return new Response(
      JSON.stringify({
        success: true,
        offlineQueued: true,
        message: 'Fiche intervention enregistrée localement en mode hors-ligne. Synchronisation automatique à la reconnexion.',
        timestamp: Date.now()
      }),
      {
        status: 202,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      }
    );
  }
}

// 4. Reprise automatique à la reconnexion via Background Sync ou postMessage
self.addEventListener('sync', (event) => {
  if (event.tag === 'artisan-sync-interventions') {
    event.waitUntil(notifyClientsToSync());
  }
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CHECK_OFFLINE_SYNC') {
    notifyClientsToSync();
  }
});

async function notifyClientsToSync() {
  const allClients = await self.clients.matchAll({ includeUncontrolled: true });
  for (const client of allClients) {
    client.postMessage({
      type: 'RESUME_OFFLINE_SYNC',
      message: 'Reconnexion détectée : synchronisation automatique des interventions et photos de chantier.'
    });
  }
}
