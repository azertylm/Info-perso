import { Workbox } from 'workbox-window';

export interface ServiceWorkerCacheMetrics {
  staticCount: number;
  newsCount: number;
  imagesCount: number;
  totalItems: number;
  timestamp: number;
}

let wbInstance: Workbox | null = null;
let isRegistered = false;

type ListenerCallback = (event: { type: string; [key: string]: any }) => void;
const listeners: Set<ListenerCallback> = new Set();

export function onServiceWorkerEvent(cb: ListenerCallback) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function notifyListeners(event: { type: string; [key: string]: any }) {
  listeners.forEach((cb) => {
    try {
      cb(event);
    } catch (e) {
      console.warn('[SW Registration] Erreur callback listener:', e);
    }
  });
}

/**
 * Enregistrement officiel du Service Worker propulsé par Workbox
 */
export function registerServiceWorker(): Workbox | null {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.info('[SW] Les Service Workers ne sont pas supportés par cet environnement');
    return null;
  }

  if (isRegistered && wbInstance) {
    return wbInstance;
  }

  try {
    wbInstance = new Workbox('/sw.js');

    // Événement : Nouveau Service Worker installé
    wbInstance.addEventListener('installed', (event) => {
      if (event.isUpdate) {
        console.log('[Workbox] Nouvelle version de l\'application disponible');
        wbInstance?.messageSkipWaiting();
        notifyListeners({ type: 'UPDATE_AVAILABLE' });
      } else {
        console.log('[Workbox] InfoPerso est désormais entièrement accessible hors-ligne !');
        notifyListeners({ type: 'OFFLINE_READY' });
      }
    });

    // Événement : Prise de contrôle de la page
    wbInstance.addEventListener('controlling', () => {
      console.log('[Workbox] Le Service Worker contrôle désormais la page');
      notifyListeners({ type: 'CONTROLLING' });
    });

    // Événement : Service Worker en attente
    wbInstance.addEventListener('waiting', () => {
      console.log('[Workbox] Un Service Worker attend d\'être activé');
      notifyListeners({ type: 'WAITING' });
    });

    // Événement : Réception d'un message du Service Worker
    wbInstance.addEventListener('message', (event) => {
      notifyListeners({ type: 'MESSAGE', data: event.data });
    });

    wbInstance.register().then((reg) => {
      isRegistered = true;
      console.log('[Workbox] Service Worker enregistré avec succès (scope:', reg?.scope, ')');
      notifyListeners({ type: 'REGISTERED', scope: reg?.scope });
    }).catch((err) => {
      console.warn('[Workbox] Échec de l\'enregistrement du Service Worker:', err);
    });

    return wbInstance;
  } catch (error) {
    console.warn('[Workbox] Erreur lors de l\'initialisation de Workbox:', error);
    return null;
  }
}

/**
 * Préchauffe et met en cache de façon proactive les médias/photos d'articles
 */
export async function cacheArticleMedia(urls: string[]): Promise<void> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  const filtered = (urls || []).filter((u) => typeof u === 'string' && (u.startsWith('http://') || u.startsWith('https://')));
  if (filtered.length === 0) return;

  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'CACHE_ARTICLE_MEDIA',
      urls: filtered
    });
  }
}

/**
 * Récupère les métriques de cache (assets statiques, articles, photos)
 */
export function getServiceWorkerCacheMetrics(): Promise<ServiceWorkerCacheMetrics | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !navigator.serviceWorker.controller) {
      resolve(null);
      return;
    }

    const messageChannel = new MessageChannel();
    messageChannel.port1.onmessage = (event) => {
      if (event.data && event.data.type === 'CACHE_METRICS_RESPONSE') {
        resolve(event.data.metrics);
      } else {
        resolve(null);
      }
    };

    // Timeout de sécurité si le SW ne répond pas dans la seconde
    const timer = setTimeout(() => {
      resolve(null);
    }, 1500);

    navigator.serviceWorker.controller.postMessage(
      { type: 'GET_CACHE_METRICS' },
      [messageChannel.port2]
    );

    // Écoute alternative globale
    const handleGlobalMsg = (ev: MessageEvent) => {
      if (ev.data && ev.data.type === 'CACHE_METRICS_RESPONSE') {
        clearTimeout(timer);
        navigator.serviceWorker.removeEventListener('message', handleGlobalMsg);
        resolve(ev.data.metrics);
      }
    };
    navigator.serviceWorker.addEventListener('message', handleGlobalMsg);
  });
}

/**
 * Force la mise à jour immédiate du Service Worker
 */
export function skipWaitingServiceWorker(): void {
  if (wbInstance) {
    wbInstance.messageSkipWaiting();
  } else if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
  }
}
