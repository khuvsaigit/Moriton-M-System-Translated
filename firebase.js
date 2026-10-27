import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {
  getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager,
  terminate, clearIndexedDbPersistence,
  doc, collection, onSnapshot, setDoc, getDoc, deleteDoc, getDocs, query, where, orderBy, limit
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import {
  getStorage, ref as storageRef, uploadString, getDownloadURL, deleteObject
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";
import {
  getAuth, signInAnonymously, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCB20uvd_XsWju91IERQGs6yGFYSBSUx10",
  authDomain: "moriton-4ecc0.firebaseapp.com",
  projectId: "moriton-4ecc0",
  storageBucket: "moriton-4ecc0.firebasestorage.app",
  messagingSenderId: "472702397725",
  appId: "1:472702397725:web:3f19849c1f61bd4e7805f4",
  measurementId: "G-M3E63XQKX5"
};

const fbApp = initializeApp(firebaseConfig);

// ── 💾 Firestore Disk Cache (IndexedDB) ───────────────────────
// Without cache, opening a page re-downloads EVERY document —
// on mobile devices over slow networks, this takes dozens of seconds.
// With persistentLocalCache: documents are fully fetched only once, after
// which only MODIFIED documents stream across the network (delta sync).
// When multiple tabs are open simultaneously, persistentMultipleTabManager coordinates them.
let db;
try {
  db = initializeFirestore(fbApp, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    experimentalAutoDetectLongPolling: true // Prevents stream timeouts on mobile/proxy networks
  });
  console.info('[FB] Disk cache active (delta sync)');
} catch (e) {
  console.warn('[FB] Could not initialize disk cache, falling back to memory cache:', e && e.message);
  db = getFirestore(fbApp);
}
const storage = getStorage(fbApp);
const auth  = getAuth(fbApp);

// ── Collection/Document reference ─────────────────────────────
// Retrieve a specific document inside a collection
window.__fbColDoc = (colName, docId) => doc(db, colName, docId);

// Backward compatibility (clinic/key document — for migration needs)
window.__fbDocFor = (key) => doc(db, 'clinic', key);

// ── Write Document ─────────────────────────────────────────────
window.__fbSetDoc = setDoc;

// ── Read Document Once ─────────────────────────────────────────
window.__fbGetDoc = getDoc;

// ── Delete Document ────────────────────────────────────────────
window.__fbDeleteDoc = deleteDoc;

// ── Fetch All Collection Documents Once ────────────────────────
window.__fbColQuery = async (colName) => {
  const snap = await getDocs(collection(db, colName));
  return snap.docs;
};

// ── Real-Time Collection Listener ──────────────────────────────
// Calls callback: (changes: [{type, docId, data}], allIds, isFirst)
//   allIds  — All document IDs CURRENTLY on the server (for reconciliation)
//   isFirst — Whether this is the initial snapshot for this collection
// An empty initial snapshot MUST still invoke the callback; otherwise,
// local cache reconciliation fails, causing different devices to display mismatched records.
window.__fbColListen = (colName, callback, onError, opts) => {
  let ref = collection(db, colName);
  const parts = [];
  if (opts && Array.isArray(opts.where)) opts.where.forEach(w => parts.push(where(w[0], w[1], w[2])));
  if (opts && opts.orderField && opts.limitN) { parts.push(orderBy(opts.orderField, 'desc')); parts.push(limit(opts.limitN)); }
  if (parts.length) ref = query(ref, ...parts);
  let firstSnap = true, firstServerPending = true;
  return onSnapshot(ref, { includeMetadataChanges: true }, (snap) => {
    const changes = snap.docChanges().map(change => ({
      type: change.type,       // 'added' | 'modified' | 'removed'
      docId: change.doc.id,
      data: change.doc.data()
    }));
    const allIds = snap.docs.map(d => d.id);
    const isFirst = firstSnap;
    firstSnap = false;
    const fromCache = !!(snap.metadata && snap.metadata.fromCache);
    try { if (window.__fbNoteConn) window.__fbNoteConn(fromCache); } catch (e) {}
    const isFirstServer = !fromCache && firstServerPending;
    if (!fromCache) firstServerPending = false;
    if (changes.length > 0 || isFirst || isFirstServer) {
      callback(changes, allIds, isFirst, fromCache, isFirstServer);
    }
  }, onError || (() => {}));
};

window.__fbQuery = async (colName, whereArr, opts) => {
  const parts = (whereArr || []).map(w => where(w[0], w[1], w[2]));
  if (opts && opts.orderField) parts.push(orderBy(opts.orderField, opts.dir || 'asc'));
  if (opts && opts.limitN) parts.push(limit(opts.limitN));
  const snap = await getDocs(parts.length ? query(collection(db, colName), ...parts) : collection(db, colName));
  return { docs: snap.docs.map(d => d.data()), fromCache: !!(snap.metadata && snap.metadata.fromCache) };
};

window.__fbDocIfExists = async (colName, docId) => {
  try {
    const s = await getDoc(doc(db, colName, docId));
    return s.exists() ? s.data() : null;
  } catch (e) { return undefined; }
};

window.__fbDocListen = (docRef, callback, onError) => {
  return onSnapshot(docRef, callback, onError || (() => {}));
};

window.__fbOnSnapshot = onSnapshot;

window.__fbEnsureAuth = async (forceRefresh) => {
  if (!auth.currentUser) {
    await signInAnonymously(auth);
  }
  if (!auth.currentUser) throw new Error('Failed to create authentication session');
  await auth.currentUser.getIdToken(!!forceRefresh);
  return auth.currentUser.uid;
};

window.__fbTokenCheck = async () => {
  try {
    if (!auth.currentUser) return { ok: false, reason: 'No active authentication session' };
    const res = await auth.currentUser.getIdTokenResult(true);
    return { ok: true, expires: res.expirationTime || '' };
  } catch (e) {
    return { ok: false, reason: (e && (e.code || e.message)) || 'Error' };
  }
};

window.__fbUploadImage = async (path, dataUrl) => {
  const put = async () => {
    const r = storageRef(storage, path);
    await uploadString(r, dataUrl, "data_url");
    return await getDownloadURL(r);
  };
  try {
    await window.__fbEnsureAuth(false);
    return await put();
  } catch (err) {
    const code = (err && (err.code || err.message)) + '';
    if (/unauthorized|permission|403/i.test(code)) {
      console.warn('[FB] Storage 403 — refreshing token and retrying upload…');
      await window.__fbEnsureAuth(true);
      return await put();
    }
    throw err;
  }
};

window.__fbDeleteImageByUrl = async (url) => {
  try {
    const r = storageRef(storage, url);
    await deleteObject(r);
  } catch (e) {}
};

window.__fbAuthInfo = () => ({
  ready:     !!window.__fbReady,
  uid:       auth.currentUser ? auth.currentUser.uid : null,
  anonymous: auth.currentUser ? !!auth.currentUser.isAnonymous : null,
  bucket:    firebaseConfig.storageBucket || '',
  projectId: firebaseConfig.projectId || '',
  online:    (typeof navigator !== 'undefined') ? navigator.onLine : true
});

window.__fbDeletePath = async (path) => {
  await deleteObject(storageRef(storage, path));
};

window.__fbPersistenceCheck = async () => {
  try {
    if (!window.indexedDB) return { ok: false, detail: 'IndexedDB unavailable' };
    if (indexedDB.databases) {
      const dbs = await indexedDB.databases();
      const fs = dbs.filter(d => (d.name || '').startsWith('firestore/'));
      if (fs.length) return { ok: true, detail: fs.map(d => d.name).join(', ') };
      return { ok: false, detail: 'Firestore database not initialized in IndexedDB' };
    }
    return await new Promise((res) => {
      const rq = indexedDB.open('__mt_probe');
      rq.onsuccess = () => { try { rq.result.close(); indexedDB.deleteDatabase('__mt_probe'); } catch (e) {} res({ ok: true, detail: 'IndexedDB accessible' }); };
      rq.onerror = () => res({ ok: false, detail: 'IndexedDB failed to open' });
    });
  } catch (e) { return { ok: false, detail: e && e.message }; }
};

window.__fbResetCache = async () => {
  try { await terminate(db); } catch (e) {}
  try { await clearIndexedDbPersistence(db); } catch (e) { console.warn('[FB] Clear cache:', e && e.message); }
};

window.__fbDeviceId = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

onAuthStateChanged(auth, (user) => {
  if (user) {
    window.__fbReady = true;
    window.dispatchEvent(new Event("firebase-ready"));
  } else {
    signInAnonymously(auth).catch((err) => {
      console.error("Firebase anonymous auth failed:", err);
      window.__fbReady = true;
      window.dispatchEvent(new Event("firebase-ready"));
    });
  }
});
