/**
 * Module de Persistance Hors-Ligne Résiliente & Sérialisation Photo (IndexedDB)
 * Conçu pour "L'Œil de l'Atelier" - ALPHABETTE SASU
 * 
 * Fonctionnalités clés :
 * - Stockage 100% local dans IndexedDB (sans dépendance à une connexion réseau)
 * - Sérialisation et compression des photos de chantiers haute résolution
 * - Détection automatique de reconnexion avec reprise de synchronisation vers l'API
 * - Stratégie de file d'attente résiliente (offline queue) avec réconciliation
 */

export interface ChantierPhoto {
  id: string;
  interventionId: string;
  caption: string;
  dataUrl: string; // Données d'image sérialisées Base64
  timestamp: number;
  sizeKb: number;
  mimeType: string;
  syncStatus: "pending" | "synced" | "failed";
}

export interface ArtisanIntervention {
  id: string;
  title: string;
  clientName: string;
  location: string;
  trade: string; // Ex: Plomberie, Électricité, Menuiserie, Maçonnerie, Climatisation
  description: string;
  materials: string[];
  urgency: "Normale" | "Urgente" | "Critique";
  estimatedHours: number;
  photos: ChantierPhoto[];
  createdAt: number;
  updatedAt: number;
  synced: boolean;
  source: "vocal" | "manuel" | "plan";
  voiceTranscriptionRaw?: string;
}

const DB_NAME = "oeil_atelier_artisan_db";
const DB_VERSION = 1;
const STORE_INTERVENTIONS = "interventions";
const STORE_PHOTOS = "photos";

let dbInstance: IDBDatabase | null = null;

/**
 * Initialisation de la base de données IndexedDB
 */
export async function getArtisanDb(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Store principal pour les fiches d'intervention
      if (!db.objectStoreNames.contains(STORE_INTERVENTIONS)) {
        const interventionStore = db.createObjectStore(STORE_INTERVENTIONS, { keyPath: "id" });
        interventionStore.createIndex("synced", "synced", { unique: false });
        interventionStore.createIndex("createdAt", "createdAt", { unique: false });
        interventionStore.createIndex("urgency", "urgency", { unique: false });
      }

      // Store dédié pour la sérialisation des photos haute résolution
      if (!db.objectStoreNames.contains(STORE_PHOTOS)) {
        const photoStore = db.createObjectStore(STORE_PHOTOS, { keyPath: "id" });
        photoStore.createIndex("interventionId", "interventionId", { unique: false });
        photoStore.createIndex("syncStatus", "syncStatus", { unique: false });
        photoStore.createIndex("timestamp", "timestamp", { unique: false });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      console.error("[IndexedDB Atelier] Erreur d'ouverture :", (event.target as IDBOpenDBRequest).error);
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

/**
 * Sauvegarde locale d'une fiche d'intervention artisan
 */
export async function saveInterventionOffline(intervention: ArtisanIntervention): Promise<ArtisanIntervention> {
  const db = await getArtisanDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_INTERVENTIONS, STORE_PHOTOS], "readwrite");
    const interventionStore = tx.objectStore(STORE_INTERVENTIONS);
    const photoStore = tx.objectStore(STORE_PHOTOS);

    // Sauvegarde de l'intervention
    const itemToSave = {
      ...intervention,
      updatedAt: Date.now()
    };
    interventionStore.put(itemToSave);

    // Sérialisation individuelle de chaque photo associée
    if (intervention.photos && intervention.photos.length > 0) {
      for (const photo of intervention.photos) {
        photoStore.put({
          ...photo,
          interventionId: intervention.id
        });
      }
    }

    tx.oncomplete = () => {
      notifyDbChange();
      // Si en ligne, tenter la synchronisation immédiate
      if (typeof navigator !== "undefined" && navigator.onLine) {
        syncPendingInterventions().catch(() => {});
      }
      resolve(itemToSave);
    };

    tx.onerror = () => {
      reject(tx.error);
    };
  });
}

/**
 * Récupère toutes les interventions stockées localement
 */
export async function getAllInterventionsOffline(): Promise<ArtisanIntervention[]> {
  const db = await getArtisanDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_INTERVENTIONS], "readonly");
    const store = tx.objectStore(STORE_INTERVENTIONS);
    const request = store.getAll();

    request.onsuccess = () => {
      const items: ArtisanIntervention[] = request.result || [];
      // Trier par date décroissante
      items.sort((a, b) => b.createdAt - a.createdAt);
      resolve(items);
    };

    request.onerror = () => reject(request.error);
  });
}

/**
 * Supprime une intervention et ses photos associées
 */
export async function deleteInterventionOffline(id: string): Promise<boolean> {
  const db = await getArtisanDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_INTERVENTIONS, STORE_PHOTOS], "readwrite");
    const interventionStore = tx.objectStore(STORE_INTERVENTIONS);
    const photoStore = tx.objectStore(STORE_PHOTOS);

    interventionStore.delete(id);

    // Supprimer les photos orphelines
    const index = photoStore.index("interventionId");
    const req = index.getAllKeys(id);
    req.onsuccess = () => {
      for (const key of req.result) {
        photoStore.delete(key);
      }
    };

    tx.oncomplete = () => {
      notifyDbChange();
      resolve(true);
    };
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Sérialisation d'un fichier image (File ou Blob) en Base64 optimisé pour IndexedDB
 */
export function serializePhotoFile(file: File, maxWidth = 1600, quality = 0.85): Promise<{ dataUrl: string; sizeKb: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve({
            dataUrl: event.target?.result as string,
            sizeKb: Math.round(file.size / 1024)
          });
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
        const approximateSizeKb = Math.round((compressedDataUrl.length * 3) / 4 / 1024);

        resolve({
          dataUrl: compressedDataUrl,
          sizeKb: approximateSizeKb
        });
      };
      img.onerror = reject;
      img.src = event.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Récupère le nombre d'interventions en attente de synchronisation
 */
export async function getPendingSyncCount(): Promise<{ interventions: number; photos: number }> {
  try {
    const db = await getArtisanDb();
    return new Promise((resolve) => {
      const tx = db.transaction([STORE_INTERVENTIONS, STORE_PHOTOS], "readonly");
      const intStore = tx.objectStore(STORE_INTERVENTIONS);
      const photoStore = tx.objectStore(STORE_PHOTOS);

      const intIndex = intStore.index("synced");
      const photoIndex = photoStore.index("syncStatus");

      const intReq = intIndex.count(IDBKeyRange.only(0)); // or false
      const intReqBool = intIndex.count(IDBKeyRange.only(false));
      const photoReq = photoIndex.count(IDBKeyRange.only("pending"));

      let pendingIntCount = 0;
      let pendingPhotoCount = 0;

      intReqBool.onsuccess = () => {
        pendingIntCount += intReqBool.result;
      };
      photoReq.onsuccess = () => {
        pendingPhotoCount = photoReq.result;
      };

      tx.oncomplete = () => {
        resolve({
          interventions: pendingIntCount,
          photos: pendingPhotoCount
        });
      };

      tx.onerror = () => {
        resolve({ interventions: 0, photos: 0 });
      };
    });
  } catch {
    return { interventions: 0, photos: 0 };
  }
}

/**
 * Reprise automatique de la synchronisation à la reconnexion
 * Envoie toutes les interventions et photos en attente vers le serveur
 */
export async function syncPendingInterventions(): Promise<{
  success: boolean;
  syncedCount: number;
  message: string;
}> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return { success: false, syncedCount: 0, message: "Actuellement hors-ligne." };
  }

  try {
    const db = await getArtisanDb();
    const allItems = await getAllInterventionsOffline();
    const pendingItems = allItems.filter((i) => !i.synced);

    if (pendingItems.length === 0) {
      return { success: true, syncedCount: 0, message: "Toutes les interventions sont déjà synchronisées." };
    }

    // Appel à l'API serveur pour synchronisation par lot
    const response = await fetch("/api/artisan/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        interventions: pendingItems,
        timestamp: Date.now()
      })
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const result = await response.json();

    // Marquer les éléments comme synchronisés dans IndexedDB
    const tx = db.transaction([STORE_INTERVENTIONS, STORE_PHOTOS], "readwrite");
    const interventionStore = tx.objectStore(STORE_INTERVENTIONS);
    const photoStore = tx.objectStore(STORE_PHOTOS);

    for (const item of pendingItems) {
      item.synced = true;
      item.photos = item.photos.map((p) => ({ ...p, syncStatus: "synced" as const }));
      interventionStore.put(item);

      for (const photo of item.photos) {
        photoStore.put({ ...photo, syncStatus: "synced" as const });
      }
    }

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });

    notifyDbChange();
    dispatchSyncEvent({
      status: "completed",
      count: pendingItems.length,
      timestamp: Date.now()
    });

    return {
      success: true,
      syncedCount: pendingItems.length,
      message: `${pendingItems.length} intervention(s) de chantier synchronisée(s) avec succès !`
    };
  } catch (err: any) {
    console.warn("[Sync Atelier] Échec temporaire de synchronisation (reprise au prochain signal) :", err);
    return {
      success: false,
      syncedCount: 0,
      message: `En attente du serveur : ${err.message || "Tentative ultérieure"}`
    };
  }
}

/**
 * Écouteur global de reprise automatique dès reconnexion
 */
let isAutoSyncInitialized = false;
export function initArtisanOfflineAutoSync(): () => void {
  if (typeof window === "undefined" || isAutoSyncInitialized) {
    return () => {};
  }
  isAutoSyncInitialized = true;

  const handleOnline = () => {
    console.log("[L'Œil de l'Atelier] Reconnexion au réseau détectée : lancement de la reprise automatique.");
    syncPendingInterventions().catch(console.error);
  };

  const handleServiceWorkerMessage = (event: MessageEvent) => {
    if (event.data?.type === "RESUME_OFFLINE_SYNC") {
      console.log("[L'Œil de l'Atelier] Ordre de reprise reçu du Service Worker.");
      syncPendingInterventions().catch(console.error);
    }
  };

  window.addEventListener("online", handleOnline);
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.addEventListener("message", handleServiceWorkerMessage);
  }

  // Vérification initiale si déjà connecté
  if (navigator.onLine) {
    setTimeout(() => {
      syncPendingInterventions().catch(() => {});
    }, 1500);
  }

  return () => {
    window.removeEventListener("online", handleOnline);
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.removeEventListener("message", handleServiceWorkerMessage);
    }
    isAutoSyncInitialized = false;
  };
}

function notifyDbChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("artisan-db-updated"));
  }
}

function dispatchSyncEvent(detail: any) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("artisan-sync-status", { detail }));
  }
}
