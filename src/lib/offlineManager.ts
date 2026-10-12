import { useState, useEffect } from "react";
import { NewsArticle } from "../types";
import { cacheArticleMedia, getServiceWorkerCacheMetrics, onServiceWorkerEvent, ServiceWorkerCacheMetrics } from "./serviceWorkerRegistration";

const CACHE_KEY = "infoperso_offline_articles_cache";
const CACHE_META_KEY = "infoperso_offline_articles_meta";

export interface OfflineCacheMeta {
  count: number;
  lastUpdated: number;
  sizeKb: number;
  cachedImagesCount?: number;
}

/**
 * Sauvegarde les articles pour consultation hors-ligne (localStorage + Workbox cache média)
 */
export function saveArticlesOffline(articles: NewsArticle[]): OfflineCacheMeta {
  try {
    // Conserver les 40 articles les plus récents / pertinents
    const toCache = (articles || []).slice(0, 40);
    const serialized = JSON.stringify(toCache);
    localStorage.setItem(CACHE_KEY, serialized);

    // Extraction proactive des URL d'illustrations pour le Service Worker Workbox
    const imageUrls: string[] = [];
    toCache.forEach((art) => {
      if (art.imageUrl && typeof art.imageUrl === "string" && art.imageUrl.startsWith("http")) {
        imageUrls.push(art.imageUrl);
      }
    });

    if (imageUrls.length > 0) {
      cacheArticleMedia(imageUrls).catch((err) => {
        console.warn("[OfflineManager] Erreur pré-cache images Workbox:", err);
      });
    }

    const meta: OfflineCacheMeta = {
      count: toCache.length,
      lastUpdated: Date.now(),
      sizeKb: Math.round(new Blob([serialized]).size / 1024),
      cachedImagesCount: imageUrls.length
    };
    localStorage.setItem(CACHE_META_KEY, JSON.stringify(meta));
    return meta;
  } catch (err) {
    console.warn("Failed to cache articles offline:", err);
    return { count: 0, lastUpdated: Date.now(), sizeKb: 0 };
  }
}

/**
 * Charge les articles sauvegardés localement
 */
export function loadArticlesOffline(): NewsArticle[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Récupère les métadonnées du cache hors-ligne
 */
export function getOfflineCacheMeta(): OfflineCacheMeta {
  try {
    const raw = localStorage.getItem(CACHE_META_KEY);
    if (!raw) return { count: 0, lastUpdated: 0, sizeKb: 0 };
    return JSON.parse(raw);
  } catch {
    return { count: 0, lastUpdated: 0, sizeKb: 0 };
  }
}

/**
 * Hook de suivi de l'état réseau et de l'infrastructure hors-ligne Workbox
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== "undefined" ? navigator.onLine : true;
  });
  const [cacheMeta, setCacheMeta] = useState<OfflineCacheMeta>(() => getOfflineCacheMeta());
  const [isServiceWorkerActive, setIsServiceWorkerActive] = useState<boolean>(() => {
    return typeof navigator !== "undefined" && "serviceWorker" in navigator && !!navigator.serviceWorker.controller;
  });
  const [swMetrics, setSwMetrics] = useState<ServiceWorkerCacheMetrics | null>(null);
  const [isOfflineReady, setIsOfflineReady] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Vérifier l'état du contrôleur Service Worker
    if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
      if (navigator.serviceWorker.controller) {
        setIsServiceWorkerActive(true);
        setIsOfflineReady(true);
      }
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        setIsServiceWorkerActive(true);
        setIsOfflineReady(true);
      });
    }

    // Écoute des événements Workbox
    const unsubscribe = onServiceWorkerEvent((ev) => {
      if (ev.type === "OFFLINE_READY" || ev.type === "CONTROLLING" || ev.type === "REGISTERED") {
        setIsOfflineReady(true);
        setIsServiceWorkerActive(true);
      }
    });

    // Sondage initial des métriques du cache Workbox
    getServiceWorkerCacheMetrics().then((metrics) => {
      if (metrics) setSwMetrics(metrics);
    });

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      unsubscribe();
    };
  }, []);

  const refreshMeta = () => {
    setCacheMeta(getOfflineCacheMeta());
    getServiceWorkerCacheMetrics().then((metrics) => {
      if (metrics) setSwMetrics(metrics);
    });
  };

  const saveSnapshot = (articles: NewsArticle[]) => {
    const meta = saveArticlesOffline(articles);
    refreshMeta();
    return meta;
  };

  return {
    isOnline,
    cacheMeta,
    isServiceWorkerActive,
    isOfflineReady,
    swMetrics,
    refreshMeta,
    saveSnapshot
  };
}
