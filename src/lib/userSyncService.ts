import { 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  Unsubscribe 
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType, isFirebaseConfigured } from "./firebase";

export type DeviceType = "pc" | "tablet" | "mobile";

export interface DeviceInfo {
  type: DeviceType;
  label: string;
  shortLabel: string;
}

export function detectDeviceType(): DeviceInfo {
  if (typeof window === "undefined") {
    return { type: "pc", label: "Ordinateur (PC)", shortLabel: "PC" };
  }

  const userAgent = navigator.userAgent || "";
  const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  const width = window.innerWidth;

  // Tablet regex detection
  const isTabletUA = /(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(userAgent);
  // Mobile regex detection
  const isMobileUA = /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(userAgent);

  if (isTabletUA || (isTouch && width >= 640 && width <= 1024)) {
    return { type: "tablet", label: "Tablette", shortLabel: "Tablette" };
  }

  if (isMobileUA || width < 640) {
    return { type: "mobile", label: "Smartphone (Mobile)", shortLabel: "Mobile" };
  }

  return { type: "pc", label: "Ordinateur (PC)", shortLabel: "PC" };
}

export interface UserSyncProfile {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  themeMode?: "light" | "dark";
  displayMode?: "sobre" | "pro" | "warm" | "cyber" | "fun";
  isEasyMode?: boolean;
  easyModeLevel?: number;
  savedArticleIds?: number[];
  readArticleIds?: number[];
  curiosityScore?: number;
  unlockedBadges?: string[];
  customTitle?: string;
  customCategories?: string[];
  followedTags?: string[];
  blacklistedTags?: string[];
  lastActiveDevice?: string;
  lastSyncAt?: string;
  updatedAt?: string;
}

let syncTimeout: any = null;

/**
 * Listens in real-time to the user's cross-device profile in Firestore.
 */
export function listenToUserProfile(
  uid: string, 
  onUpdate: (data: UserSyncProfile | null) => void
): Unsubscribe {
  if (!isFirebaseConfigured) {
    try {
      const stored = localStorage.getItem(`infoperso_user_sync_${uid}`);
      onUpdate(stored ? JSON.parse(stored) : null);
    } catch {
      onUpdate(null);
    }
    return () => {};
  }

  const userDocRef = doc(db, "users", uid);

  return onSnapshot(
    userDocRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as UserSyncProfile);
      } else {
        onUpdate(null);
      }
    },
    (error) => {
      console.warn("Firestore user sync warning:", error);
      try {
        handleFirestoreError(error, OperationType.GET, `users/${uid}`);
      } catch {
        // Suppress unhandled rethrow in snapshot
      }
    }
  );
}

/**
 * Debounced save of user profile state to Firestore.
 */
export function saveUserProfileDebounced(
  uid: string,
  data: Partial<UserSyncProfile>,
  delayMs = 1200
): void {
  if (syncTimeout) {
    clearTimeout(syncTimeout);
  }

  syncTimeout = setTimeout(async () => {
    try {
      await saveUserProfileNow(uid, data);
    } catch (e) {
      console.error("Failed to debounced-save user profile:", e);
    }
  }, delayMs);
}

/**
 * Immediate save of user profile state to Firestore.
 */
export async function saveUserProfileNow(
  uid: string,
  data: Partial<UserSyncProfile>
): Promise<void> {
  const device = detectDeviceType();

  const payload: Partial<UserSyncProfile> = {
    ...data,
    uid,
    lastActiveDevice: device.label,
    lastSyncAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const stored = localStorage.getItem(`infoperso_user_sync_${uid}`);
    const existing = stored ? JSON.parse(stored) : {};
    localStorage.setItem(`infoperso_user_sync_${uid}`, JSON.stringify({ ...existing, ...payload }));
  } catch (e) {
    console.warn("Local user sync save error:", e);
  }

  if (!isFirebaseConfigured) {
    return;
  }

  const userDocRef = doc(db, "users", uid);

  try {
    await setDoc(userDocRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${uid}`);
  }
}

/**
 * Loads the current user profile from Firestore once.
 */
export async function fetchUserProfileOnce(uid: string): Promise<UserSyncProfile | null> {
  if (!isFirebaseConfigured) {
    try {
      const stored = localStorage.getItem(`infoperso_user_sync_${uid}`);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  try {
    const userDocRef = doc(db, "users", uid);
    const snap = await getDoc(userDocRef);
    return snap.exists() ? (snap.data() as UserSyncProfile) : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${uid}`);
    return null;
  }
}
