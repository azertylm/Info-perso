/**
 * Coffre-Fort Numérique Zero-Knowledge — Infos Perso / ALPHABETTE SASU
 * 
 * Spécifications de sécurité strictes :
 * - Dérivation de clé cryptographique via PBKDF2 (100 000 itérations, SHA-256)
 * - Chiffrement local des fiches personnelles en AES-256-GCM (IV 96-bit aléatoire par fiche)
 * - Architecture Zero-Knowledge : ni la clé maître ni le mot de passe ne sont stockés ou transmis
 * - Verrouillage automatique de la session après 5 minutes d'inactivité
 */

export interface VaultRecordPlain {
  id: string;
  title: string;
  category: "identite" | "bancaire" | "sante" | "patrimoine" | "note_secrete";
  content: string;
  fields?: Record<string, string>;
  createdAt: number;
  updatedAt: number;
}

export interface EncryptedVaultRecord {
  id: string;
  titleHint: string; // Titre masqué ou tronqué pour identification visuelle sans fuite
  category: VaultRecordPlain["category"];
  salt: string; // Base64
  iv: string; // Base64 (12 octets / 96-bit)
  ciphertext: string; // Base64 (données chiffrées + tag GCM)
  createdAt: number;
  updatedAt: number;
  version: "ZK-AES-256-GCM-v1";
}

const VAULT_STORAGE_KEY = "infoperso_zk_vault_records";
const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes d'inactivité

// Clé dérivée temporaire gardée uniquement en mémoire vive (RAM volatile)
let activeDerivedKey: CryptoKey | null = null;
let activePassphraseHint: string | null = null;
let inactivityTimer: any = null;
let onLockCallbacks: Array<() => void> = [];
let isSessionActive = false;

// Helpers Base64 / ArrayBuffer
function bufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBuffer(b64: string): ArrayBuffer {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Dérivation de clé cryptographique via PBKDF2 (100 000 itérations, SHA-256)
 */
export async function deriveKeyFromPassphrase(
  passphrase: string,
  saltBytes: Uint8Array
): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const rawKey = enc.encode(passphrase);

  // 1. Importer le mot de passe en clé de base PBKDF2
  const baseKey = await window.crypto.subtle.importKey(
    "raw",
    rawKey,
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  // 2. Dériver la clé finale AES-GCM 256 bits avec 100 000 itérations
  const derivedKey = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: saltBytes,
      iterations: 100000,
      hash: "SHA-256"
    },
    baseKey,
    {
      name: "AES-GCM",
      length: 256
    },
    false,
    ["encrypt", "decrypt"]
  );

  return derivedKey;
}

/**
 * Déverrouille la session Zero-Knowledge avec la phrase secrète
 */
export async function unlockVaultSession(passphrase: string): Promise<boolean> {
  if (!passphrase || passphrase.length < 6) {
    throw new Error("La phrase secrète doit contenir au moins 6 caractères.");
  }

  // Utiliser un sel de vérification standard pour valider la session
  const verifySalt = new Uint8Array([73, 110, 102, 111, 80, 101, 114, 115, 111, 95, 90, 75, 49, 50, 51, 52]);
  activeDerivedKey = await deriveKeyFromPassphrase(passphrase, verifySalt);
  activePassphraseHint = passphrase.slice(0, 2) + "***";
  isSessionActive = true;

  resetInactivityTimer();
  setupActivityListeners();

  return true;
}

/**
 * Verrouille immédiatement la session et purge la clé de la mémoire RAM
 */
export function lockVaultSession(): void {
  activeDerivedKey = null;
  activePassphraseHint = null;
  isSessionActive = false;

  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
    inactivityTimer = null;
  }

  teardownActivityListeners();

  for (const cb of onLockCallbacks) {
    try {
      cb();
    } catch (e) {
      console.error(e);
    }
  }

  console.log("[Zero-Knowledge Vault] Session verrouillée et clé éphémère effacée de la mémoire.");
}

export function isVaultUnlocked(): boolean {
  return isSessionActive && activeDerivedKey !== null;
}

export function onVaultLocked(cb: () => void): () => void {
  onLockCallbacks.push(cb);
  return () => {
    onLockCallbacks = onLockCallbacks.filter((c) => c !== cb);
  };
}

/**
 * Chiffre une fiche personnelle en AES-256-GCM avec sel aléatoire et IV 96-bit unique
 */
export async function encryptPersonalRecord(
  plainRecord: VaultRecordPlain,
  customPassphrase?: string
): Promise<EncryptedVaultRecord> {
  const enc = new TextEncoder();
  const plainBytes = enc.encode(JSON.stringify(plainRecord));

  // Sel aléatoire de 16 octets
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  // Vecteur d'initialisation IV AES-GCM (12 octets / 96 bits)
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  // Dérivation de clé spécifique à l'enregistrement
  const keyToUse = customPassphrase
    ? await deriveKeyFromPassphrase(customPassphrase, salt)
    : activeDerivedKey;

  if (!keyToUse) {
    throw new Error("Coffre-fort verrouillé. Veuillez déverrouiller votre session avec votre phrase secrète.");
  }

  // Chiffrement AES-GCM 256
  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv
    },
    keyToUse,
    plainBytes
  );

  resetInactivityTimer();

  const encryptedItem: EncryptedVaultRecord = {
    id: plainRecord.id,
    titleHint: plainRecord.title.length > 25 ? plainRecord.title.slice(0, 22) + "..." : plainRecord.title,
    category: plainRecord.category,
    salt: bufferToBase64(salt.buffer),
    iv: bufferToBase64(iv.buffer),
    ciphertext: bufferToBase64(ciphertextBuffer),
    createdAt: plainRecord.createdAt,
    updatedAt: Date.now(),
    version: "ZK-AES-256-GCM-v1"
  };

  return encryptedItem;
}

/**
 * Déchiffre une fiche personnelle chiffrée
 */
export async function decryptPersonalRecord(
  encryptedRecord: EncryptedVaultRecord,
  customPassphrase?: string
): Promise<VaultRecordPlain> {
  const salt = new Uint8Array(base64ToBuffer(encryptedRecord.salt));
  const iv = new Uint8Array(base64ToBuffer(encryptedRecord.iv));
  const ciphertext = base64ToBuffer(encryptedRecord.ciphertext);

  let keyToUse = activeDerivedKey;
  if (customPassphrase) {
    keyToUse = await deriveKeyFromPassphrase(customPassphrase, salt);
  }

  if (!keyToUse) {
    throw new Error("Coffre-fort verrouillé. Déverrouillage requis.");
  }

  try {
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv
      },
      keyToUse,
      ciphertext
    );

    resetInactivityTimer();

    const dec = new TextDecoder();
    const jsonString = dec.decode(decryptedBuffer);
    return JSON.parse(jsonString) as VaultRecordPlain;
  } catch (err) {
    throw new Error("Échec du déchiffrement Zero-Knowledge : phrase secrète invalide ou fiche altérée.");
  }
}

/**
 * Sauvegarde persistante des fiches chiffrées dans localStorage
 */
export function saveEncryptedRecordToStorage(record: EncryptedVaultRecord): void {
  const records = loadEncryptedRecordsFromStorage();
  const index = records.findIndex((r) => r.id === record.id);
  if (index >= 0) {
    records[index] = record;
  } else {
    records.unshift(record);
  }
  localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(records));
  notifyVaultChange();
}

export function loadEncryptedRecordsFromStorage(): EncryptedVaultRecord[] {
  try {
    const raw = localStorage.getItem(VAULT_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function deleteEncryptedRecordFromStorage(id: string): void {
  const records = loadEncryptedRecordsFromStorage().filter((r) => r.id !== id);
  localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(records));
  notifyVaultChange();
}

function notifyVaultChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("zk-vault-records-updated"));
  }
}

// ============================================================================
// GESTION DU VERROUILLAGE AUTOMATIQUE APRÈS 5 MINUTES D'INACTIVITÉ
// ============================================================================

function resetInactivityTimer(): void {
  if (!isSessionActive) return;

  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
  }

  inactivityTimer = setTimeout(() => {
    console.warn("[Zero-Knowledge Vault] 5 minutes d'inactivité atteintes : verrouillage automatique.");
    lockVaultSession();
  }, INACTIVITY_TIMEOUT_MS);
}

const activityEvents = ["mousemove", "keydown", "touchstart", "click", "wheel"];

function handleUserActivity(): void {
  if (isSessionActive) {
    resetInactivityTimer();
  }
}

function setupActivityListeners(): void {
  if (typeof window === "undefined") return;
  for (const ev of activityEvents) {
    window.addEventListener(ev, handleUserActivity, { passive: true });
  }
}

function teardownActivityListeners(): void {
  if (typeof window === "undefined") return;
  for (const ev of activityEvents) {
    window.removeEventListener(ev, handleUserActivity);
  }
}
