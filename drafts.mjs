const VERSION = 1;
export async function openDrafts(id, indexedDB = globalThis.indexedDB) {
  if (!indexedDB) throw Error('storage-unavailable');
  return new Promise((resolve, reject) => {
    let abandoned = false;
    const request = indexedDB.open('local-tool:' + id, VERSION);
    request.onupgradeneeded = () => request.result.createObjectStore('drafts');
    request.onsuccess = () => {if (abandoned) request.result.close(); else resolve(request.result);};
    request.onerror = () => reject(request.error);
    request.onblocked = () => {abandoned = true; reject(Error('storage-blocked'));};
  });
}
async function transaction(id, mode, action) {
  const db = await openDrafts(id);
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction('drafts', mode);
      let value;
      tx.oncomplete = () => resolve(value);
      tx.onerror = tx.onabort = () => reject(tx.error || Error('storage-unavailable'));
      try {const request = action(tx.objectStore('drafts')); request.onsuccess = () => {value = request.result;};}
      catch (error) {tx.abort(); reject(error);}
    });
  } finally {db.close();}
}
export function saveDraft(id, values, files = {}) {
  return transaction(id, 'readwrite', store => store.put({version: VERSION, savedAt: new Date().toISOString(), values, files}, 'current'));
}
export function readDraft(id) {return transaction(id, 'readonly', store => store.get('current'));}
export function deleteDraft(id) {return transaction(id, 'readwrite', store => store.delete('current'));}
export async function storageInfo(storage = globalThis.navigator?.storage) {
  if (!storage?.estimate) return null;
  const {usage, quota} = await storage.estimate();
  return {usage, quota, persistent: storage.persisted ? await storage.persisted() : false};
}
