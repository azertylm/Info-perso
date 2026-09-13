import { useState, useEffect } from "react";
import { NewsArticle } from "../types";

const CACHE_KEY = "infoperso_offline_articles_cache";
const CACHE_META_KEY = "infoperso_offline_articles_meta";

export interface OfflineCacheMeta {
  count: number;
  lastUpdated: number;
  sizeKb: number;
}

export function saveArticlesOffline(articles: NewsArticle[]): OfflineCacheMeta {
  try {
    // Keep the top 30 most recent / relevant articles
    const toCache = articles.slice(0, 30);
    const serialized = JSON.stringify(toCache);
    localStorage.setItem(CACHE_KEY, serialized);

    const meta: OfflineCacheMeta = {
      count: toCache.length,
      lastUpdated: Date.now(),
      sizeKb: Math.round(new Blob([serialized]).size / 1024)
    };
    localStorage.setItem(CACHE_META_KEY, JSON.stringify(meta));
    return meta;
  } catch (err) {
    console.warn("Failed to cache articles offline:", err);
    return { count: 0, lastUpdated: Date.now(), sizeKb: 0 };
  }
}

export function loadArticlesOffline(): NewsArticle[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function getOfflineCacheMeta(): OfflineCacheMeta {
  try {
    const raw = localStorage.getItem(CACHE_META_KEY);
    if (!raw) return { count: 0, lastUpdated: 0, sizeKb: 0 };
    return JSON.parse(raw);
  } catch {
    return { count: 0, lastUpdated: 0, sizeKb: 0 };
  }
}

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== "undefined" ? navigator.onLine : true;
  });
  const [cacheMeta, setCacheMeta] = useState<OfflineCacheMeta>(() => getOfflineCacheMeta());

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const refreshMeta = () => {
    setCacheMeta(getOfflineCacheMeta());
  };

  return { isOnline, cacheMeta, refreshMeta };
}
