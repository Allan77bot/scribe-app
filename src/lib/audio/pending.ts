// ════════════════════════════════════════════════════════════════════════
// Persistance minimale d'un enregistrement vocal EN ATTENTE d'upload (IndexedDB).
// ────────────────────────────────────────────────────────────────────────
// But (Route B, terrain) : ne JAMAIS perdre une passation vocale si l'upload
// échoue ou si la page est rechargée en zone sans réseau (entrepôt, sous-sol,
// chambre froide). Un seul enregistrement en attente à la fois — suffisant pour
// le geste « j'enregistre, puis j'envoie ». Le blob est purgé SEULEMENT après un
// upload réussi (le fichier est alors safe dans le storage).
//
// Tout est défensif : si IndexedDB est indisponible, les fonctions sont des
// no-ops silencieux (on ne casse jamais l'enregistrement à cause du cache).
// ════════════════════════════════════════════════════════════════════════

const DB_NAME = "scribe-audio";
const DB_VERSION = 1;
const STORE = "pending";
const KEY = "current";

export type PendingRecording = { blob: Blob; type: string; savedAt: number };

function openDb(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof indexedDB === "undefined") return resolve(null);
    let req: IDBOpenDBRequest;
    try {
      req = indexedDB.open(DB_NAME, DB_VERSION);
    } catch {
      return resolve(null);
    }
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
  });
}

// Enregistre (ou remplace) l'enregistrement en attente.
export async function savePending(blob: Blob): Promise<void> {
  const db = await openDb();
  if (!db) return;
  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(STORE, "readwrite");
      const rec: PendingRecording = {
        blob,
        type: blob.type,
        savedAt: Date.now(),
      };
      tx.objectStore(STORE).put(rec, KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
      tx.onabort = () => resolve();
    } catch {
      resolve();
    }
  });
  db.close();
}

// Récupère l'enregistrement en attente, ou null.
export async function loadPending(): Promise<PendingRecording | null> {
  const db = await openDb();
  if (!db) return null;
  const result = await new Promise<PendingRecording | null>((resolve) => {
    try {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(KEY);
      req.onsuccess = () => resolve((req.result as PendingRecording) ?? null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
  db.close();
  return result;
}

// Purge l'enregistrement en attente (à appeler après un upload réussi, ou si
// l'utilisateur choisit de jeter l'enregistrement).
export async function clearPending(): Promise<void> {
  const db = await openDb();
  if (!db) return;
  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).delete(KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
      tx.onabort = () => resolve();
    } catch {
      resolve();
    }
  });
  db.close();
}
