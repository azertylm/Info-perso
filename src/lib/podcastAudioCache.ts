/**
 * Cache audio persistant local IndexedDB pour le Flash InfoPerso / ALPHABETTE SASU
 * Solution 16 : Temps de restitution 0 ms & Écoute intégrale hors-ligne (Métro / TGV / Zone blanche)
 * Souveraineté numérique : Stockage 100% sur le terminal de l'utilisateur, zéro revente de données.
 */

const DB_NAME = "InfoPerso_PodcastAudio_DB";
const DB_VERSION = 1;
const STORE_NAME = "audio_segments";
const DEFAULT_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 jours

export interface CachedAudioItem {
  hash: string;
  audioBase64: string;
  mimeType: string;
  createdAt: number;
  sizeBytes: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB non disponible sur cette plateforme"));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "hash" });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Calcul de l'empreinte cryptographique SHA-256 du texte en utilisant l'API Web Crypto native
 */
export async function computeAudioHash(text: string): Promise<string> {
  if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
    try {
      const msgBuffer = new TextEncoder().encode(text.trim().toLowerCase());
      const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    } catch (_) {}
  }

  // Fallback simple si SubtleCrypto est inaccessible en contexte restreint
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  return `h_${Math.abs(hash).toString(16)}`;
}

/**
 * Récupère un segment audio mis en cache local par son hash
 */
export async function getCachedAudio(
  hash: string
): Promise<{ audioBase64: string; mimeType: string } | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(hash);

      request.onsuccess = () => {
        const item = request.result as CachedAudioItem | undefined;
        if (item && item.audioBase64) {
          resolve({ audioBase64: item.audioBase64, mimeType: item.mimeType || "audio/mp3" });
        } else {
          resolve(null);
        }
      };

      request.onerror = () => resolve(null);
    });
  } catch (_) {
    return null;
  }
}

/**
 * Enregistre un segment audio en cache persistant local
 */
export async function saveCachedAudio(
  hash: string,
  audioBase64: string,
  mimeType: string = "audio/mp3"
): Promise<void> {
  try {
    const db = await openDB();
    const item: CachedAudioItem = {
      hash,
      audioBase64,
      mimeType,
      createdAt: Date.now(),
      sizeBytes: Math.round((audioBase64.length * 3) / 4)
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(item);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (_) {
    // Échec silencieux si le stockage privé du navigateur est saturé
  }
}

/**
 * Nettoie les fichiers audio expirés (plus de 7 jours) pour préserver le stockage de l'appareil
 */
export async function cleanExpiredAudioCache(ttlMs: number = DEFAULT_TTL_MS): Promise<number> {
  try {
    const db = await openDB();
    const threshold = Date.now() - ttlMs;
    let deletedCount = 0;

    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const index = store.index("createdAt");
      const range = IDBKeyRange.upperBound(threshold);
      const request = index.openCursor(range);

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result as IDBCursorWithValue | null;
        if (cursor) {
          cursor.delete();
          deletedCount++;
          cursor.continue();
        } else {
          resolve(deletedCount);
        }
      };

      request.onerror = () => resolve(0);
    });
  } catch (_) {
    return 0;
  }
}

/**
 * Récupère les métriques de stockage local (Solution 20)
 */
export async function getAudioCacheMetrics(): Promise<{ count: number; totalSizeKB: number }> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const items = (request.result as CachedAudioItem[]) || [];
        const count = items.length;
        const totalSizeBytes = items.reduce((acc, curr) => acc + (curr.sizeBytes || 0), 0);
        resolve({
          count,
          totalSizeKB: Math.round(totalSizeBytes / 1024)
        });
      };

      request.onerror = () => resolve({ count: 0, totalSizeKB: 0 });
    });
  } catch (_) {
    return { count: 0, totalSizeKB: 0 };
  }
}
