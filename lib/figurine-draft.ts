export type DraftFile = { key: string; name: string; type: string; size: number; blob: File };
export type LocalFigurinePerson = { id: string; kind: 'person' | 'pet'; description: string; outfit?: string; pose: string; hair?: string; accessories?: string; appearance?: string; distinctiveFeatures?: string; fileKeys: string[] };
export type LocalFigurinePayload = { packageId?: string; style?: 'color' | 'monochrome'; people?: LocalFigurinePerson[]; base?: string; plinthText?: string; note?: string; contactPreference?: 'email' | 'whatsapp'; phone?: string; fullName?: string; consent?: boolean; privacyVersion?: string; declaredFileKeys?: string[] };
export type LocalFigurineDraft = { payload: LocalFigurinePayload; files: DraftFile[]; boundEmail: string | null; requestKey: string; updatedAt: number };
const DB = 'toptan3dcim-figurine-drafts-v1', STORE = 'drafts', KEY = 'current';

function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Taslak deposu açılamadı.'));
    request.onblocked = () => reject(new Error('Tarayıcı taslak deposunu kullanıma açmadı.'));
  });
}
export async function readFigurineDraft(): Promise<LocalFigurineDraft | null> {
  const db = await database();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly'), request = tx.objectStore(STORE).get(KEY);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error || new Error('Taslak okunamadı.'));
    tx.oncomplete = () => db.close(); tx.onerror = () => reject(tx.error);
  });
}
export async function writeFigurineDraft(value: LocalFigurineDraft): Promise<void> {
  const db = await database();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite'); tx.objectStore(STORE).put(value, KEY);
    tx.oncomplete = () => { db.close(); resolve(); }; tx.onerror = () => reject(tx.error || new Error('Taslak kaydedilemedi.')); tx.onabort = () => reject(tx.error || new Error('Taslak kaydedilemedi.'));
  });
}
export async function clearFigurineDraft(): Promise<void> {
  const db = await database();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite'); tx.objectStore(STORE).delete(KEY);
    tx.oncomplete = () => { db.close(); resolve(); }; tx.onerror = () => reject(tx.error || new Error('Taslak temizlenemedi.'));
  });
}
