/**
 * Service Worker Souverain InfoPerso — ALPHABETTE SASU
 * 
 * Stratégie de mise en cache haute résilience propulsée par Workbox :
 * - Mode 100% Souverain : modules Workbox hébergés localement (/workbox/) avec fallback CDN
 * - App Shell & Navigations : Stale-While-Revalidate / Network-First avec repli /index.html
 * - Flux d'actualités & API News (/api/rss/*, /api/articles/*) : Network-First avec repli cache (infoperso-news-feed-v1)
 * - Photothèque & Images d'articles (Unsplash, Wikimedia) : Cache-First avec expiration (infoperso-news-images-v1)
 * - Polices & Assets statiques (JS, CSS, Fontes) : Cache-First & Stale-While-Revalidate
 * - Synchronisation et préchauffage de médias via postMessage
 */

const CACHE_VERSION = 'v2.5.0';
const STATIC_CACHE_NAME = `infoperso-static-${CACHE_VERSION}`;
const NEWS_FEED_CACHE_NAME = `infoperso-news-feed-${CACHE_VERSION}`;
const NEWS_IMAGES_CACHE_NAME = `infoperso-news-images-${CACHE_VERSION}`;

// Assets indispensables de l'App Shell
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/favicon.ico',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png',
  '/apple-touch-icon.png'
];

// 1. Chargement de Workbox (local souverain /workbox-sw.js puis fallback CDN)
let isWorkboxLoaded = false;
try {
  importScripts('/workbox-sw.js');
  if (typeof workbox !== 'undefined' && workbox) {
    isWorkboxLoaded = true;
    // Configurer le chargement des modules Workbox en local prioritaire
    workbox.setConfig({
      modulePathPrefix: '/workbox/',
      debug: false
    });
  }
} catch (e1) {
  try {
    importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.4.1/workbox-sw.js');
    if (typeof workbox !== 'undefined' && workbox) {
      isWorkboxLoaded = true;
      workbox.setConfig({ debug: false });
    }
  } catch (e2) {
    console.warn('[SW InfoPerso] Workbox non disponible, activation du gestionnaire natif autonome');
  }
}

// Placeholder SVG soigné pour les images manquantes en mode hors-ligne
const OFFLINE_IMAGE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="340" viewBox="0 0 600 340">
  <rect width="600" height="340" fill="#0f172a" />
  <circle cx="300" cy="140" r="45" fill="#1e293b" />
  <path d="M 285 140 L 315 140 M 300 125 L 300 155" stroke="#38bdf8" stroke-width="4" stroke-linecap="round" />
  <text x="300" y="215" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="16" text-anchor="middle" font-weight="600">
    InfoPerso — Image préservée hors-ligne
  </text>
  <text x="300" y="240" fill="#64748b" font-family="system-ui, sans-serif" font-size="13" text-anchor="middle">
    Actualité consultable sans connexion internet
  </text>
</svg>`.trim();

// ============================================================================
// CONFIGURATION WORKBOX
// ============================================================================
if (isWorkboxLoaded && typeof workbox !== 'undefined' && workbox) {
  try {
    const { routing, strategies, expiration, cacheableResponse } = workbox;
    const { registerRoute, setCatchHandler } = routing;
    const { NetworkFirst, CacheFirst, StaleWhileRevalidate } = strategies;
    const { ExpirationPlugin } = expiration;
    const { CacheableResponsePlugin } = cacheableResponse;

    console.log('[SW InfoPerso] Initialisation du moteur Workbox local souverain');

    // A. FLUX D'ACTUALITÉS & API : Network-First avec timeout rapide (2.5s) puis repli cache
    registerRoute(
      ({ url }) => {
        return (
          url.pathname.startsWith('/api/rss/') ||
          url.pathname.startsWith('/api/articles/') ||
          url.pathname.startsWith('/api/article') ||
          url.pathname.startsWith('/api/alphabette/') ||
          url.pathname.startsWith('/api/ai/status')
        );
      },
      new NetworkFirst({
        cacheName: NEWS_FEED_CACHE_NAME,
        networkTimeoutSeconds: 2.5,
        plugins: [
          new CacheableResponsePlugin({
            statuses: [0, 200]
          }),
          new ExpirationPlugin({
            maxEntries: 150,
            maxAgeSeconds: 7 * 24 * 60 * 60, // 7 jours de conservation
            purgeOnQuotaError: true
          })
        ]
      })
    );

    // B. IMAGES D'ARTICLES & PHOTOS : Cache-First pour préserver les illustrations en lecture offline
    registerRoute(
      ({ url, request }) => {
        return (
          request.destination === 'image' ||
          url.hostname.includes('unsplash.com') ||
          url.hostname.includes('wikimedia.org') ||
          url.hostname.includes('wikipedia.org') ||
          url.pathname.startsWith('/api/image-proxy') ||
          /\.(?:png|jpg|jpeg|svg|gif|webp|avif|ico)(?:\?.*)?$/i.test(url.pathname)
        );
      },
      new CacheFirst({
        cacheName: NEWS_IMAGES_CACHE_NAME,
        plugins: [
          new CacheableResponsePlugin({
            statuses: [0, 200]
          }),
          new ExpirationPlugin({
            maxEntries: 300,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 jours
            purgeOnQuotaError: true
          })
        ]
      })
    );

    // C. POLICES GOOGLE & CDN : Cache-First
    registerRoute(
      ({ url }) => url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com',
      new CacheFirst({
        cacheName: 'infoperso-fonts-cache',
        plugins: [
          new CacheableResponsePlugin({ statuses: [0, 200] }),
          new ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 365 * 24 * 60 * 60 })
        ]
      })
    );

    // D. ASSETS STATIQUES (JS, CSS, Chunks Vite) : Stale-While-Revalidate
    registerRoute(
      ({ url, request }) => {
        return (
          request.destination === 'script' ||
          request.destination === 'style' ||
          url.pathname.startsWith('/assets/') ||
          /\.(?:js|css|woff2?|ttf)(?:\?.*)?$/i.test(url.pathname)
        );
      },
      new StaleWhileRevalidate({
        cacheName: STATIC_CACHE_NAME,
        plugins: [
          new CacheableResponsePlugin({ statuses: [0, 200] }),
          new ExpirationPlugin({ maxEntries: 120, maxAgeSeconds: 14 * 24 * 60 * 60 })
        ]
      })
    );

    // E. NAVIGATIONS SPA (App Shell) : Network-First avec fallback /index.html
    registerRoute(
      ({ request }) => request.mode === 'navigate',
      new NetworkFirst({
        cacheName: STATIC_CACHE_NAME,
        networkTimeoutSeconds: 2.5,
        plugins: [
          new CacheableResponsePlugin({ statuses: [0, 200] })
        ]
      })
    );

    // F. CATCH HANDLER GLOBAL : Secours élégant en cas de coupure réseau inattendue
    setCatchHandler(async ({ request }) => {
      // 1. Navigation : page principale /index.html
      if (request.mode === 'navigate') {
        const cachedIndex = await caches.match('/index.html');
        if (cachedIndex) return cachedIndex;
        const cachedRoot = await caches.match('/');
        if (cachedRoot) return cachedRoot;
      }

      // 2. Images : SVG placeholder élégant
      if (request.destination === 'image') {
        return new Response(OFFLINE_IMAGE_SVG, {
          headers: { 'Content-Type': 'image/svg+xml' }
        });
      }

      // 3. API : JSON d'information pour éviter les erreurs d'invalidation
      const url = new URL(request.url);
      if (url.pathname.startsWith('/api/')) {
        return new Response(
          JSON.stringify({
            offline: true,
            cached: false,
            message: "Mode hors-ligne actif. Vos articles locaux et synthèses sauvegardées restent pleinement accessibles.",
            timestamp: Date.now()
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json; charset=utf-8' }
          }
        );
      }

      return Response.error();
    });
  } catch (workboxInitErr) {
    console.warn('[SW InfoPerso] Erreur initialisation Workbox avancée :', workboxInitErr);
  }
}

// ============================================================================
// ÉVÉNEMENTS DU SERVICE WORKER (INSTALL, ACTIVATE, MESSAGE, FETCH SECONDAIRE)
// ============================================================================

// 1. Installation : Pré-mise en cache immédiate de l'App Shell
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then(async (cache) => {
      try {
        await cache.addAll(PRECACHE_URLS);
        console.log('[SW InfoPerso] App Shell pré-mis en cache');
      } catch (err) {
        console.warn('[SW InfoPerso] Pré-cache partiel des assets :', err);
      }
    })
  );
});

// 2. Activation : Nettoyage des caches obsolètes et prise de contrôle
self.addEventListener('activate', (event) => {
  const allowedCaches = [STATIC_CACHE_NAME, NEWS_FEED_CACHE_NAME, NEWS_IMAGES_CACHE_NAME, 'infoperso-fonts-cache'];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => !allowedCaches.includes(name))
          .map((name) => {
            console.log('[SW InfoPerso] Purge de l\'ancien cache obsolète :', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Filet de sécurité Fetch natif si Workbox n'a pas pris en charge
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Si Workbox est actif, ses gestionnaires de routes internes prévalent.
  // Ce listener sert de filet de sécurité pour les navigations si la requête réseau échoue.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        const fallback = await caches.match('/index.html');
        return fallback || new Response('InfoPerso Hors-Ligne', { status: 200, headers: { 'Content-Type': 'text/html' } });
      })
    );
    return;
  }
});

// 4. Communication bidirectionnelle (postMessage)
self.addEventListener('message', async (event) => {
  if (!event.data) return;

  // A. Forcer la mise à jour immédiate
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  // B. Préchauffage des photos des articles pour lecture hors-ligne
  if (event.data.type === 'CACHE_ARTICLE_MEDIA' && Array.isArray(event.data.urls)) {
    const urlsToCache = event.data.urls.filter((u) => typeof u === 'string' && u.startsWith('http'));
    try {
      const cache = await caches.open(NEWS_IMAGES_CACHE_NAME);
      for (const mediaUrl of urlsToCache.slice(0, 50)) {
        try {
          const match = await cache.match(mediaUrl);
          if (!match) {
            const res = await fetch(mediaUrl, { mode: 'no-cors' });
            if (res) {
              await cache.put(mediaUrl, res);
            }
          }
        } catch {
          // Ignorer les erreurs d'une URL d'image individuelle
        }
      }
      if (event.source) {
        event.source.postMessage({
          type: 'CACHE_ARTICLE_MEDIA_COMPLETED',
          cachedCount: urlsToCache.length
        });
      }
    } catch (err) {
      console.warn('[SW InfoPerso] Erreur pré-cache médias :', err);
    }
  }

  // C. Calcul des métriques de cache
  if (event.data.type === 'GET_CACHE_METRICS') {
    try {
      const staticCache = await caches.open(STATIC_CACHE_NAME);
      const newsCache = await caches.open(NEWS_FEED_CACHE_NAME);
      const imagesCache = await caches.open(NEWS_IMAGES_CACHE_NAME);

      const staticKeys = await staticCache.keys();
      const newsKeys = await newsCache.keys();
      const imagesKeys = await imagesCache.keys();

      if (event.source) {
        event.source.postMessage({
          type: 'CACHE_METRICS_RESPONSE',
          metrics: {
            staticCount: staticKeys.length,
            newsCount: newsKeys.length,
            imagesCount: imagesKeys.length,
            totalItems: staticKeys.length + newsKeys.length + imagesKeys.length,
            timestamp: Date.now()
          }
        });
      }
    } catch (err) {
      console.warn('[SW InfoPerso] Erreur calcul métriques cache :', err);
    }
  }

  // D. Vidage du cache à la demande de l'utilisateur
  if (event.data.type === 'CLEAR_OFFLINE_CACHE') {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
      const staticCache = await caches.open(STATIC_CACHE_NAME);
      await staticCache.addAll(PRECACHE_URLS);
      if (event.source) {
        event.source.postMessage({ type: 'CLEAR_OFFLINE_CACHE_SUCCESS' });
      }
    } catch (err) {
      console.warn('[SW InfoPerso] Erreur vidage cache :', err);
    }
  }
});
