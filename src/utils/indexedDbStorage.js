// Sobagu Unlimited Storage Engine (IndexedDB + Persistent Storage API)
// Provides virtually unlimited client storage quota (>1GB+) with fast in-memory cache,
// automated persistence lock, snapshot archiving, and robust fallback.

const DB_NAME = 'sobagu_unlimited_db';
const DB_VERSION = 2;

const STORES = {
  USERS: 'users',
  SNAPSHOTS: 'snapshots',
  OUTBOX: 'outbox',
  ACTIVITY: 'activity',
  SYNC_CONFIG: 'sync_config',
};

let dbInstance = null;
let dbInitPromise = null;

// Memory cache for zero-latency synchronous access
const memoryCache = {
  users: {},
  currentUser: null,
  syncConfig: {},
};

// Request permanent storage from the browser so OS never cleans cache
const requestPersistentStorage = async () => {
  try {
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
      const isPersisted = await navigator.storage.persisted();
      if (!isPersisted) {
        await navigator.storage.persist();
      }
    }
  } catch {}
};

// Open and initialize IndexedDB
export const initIndexedDB = () => {
  if (dbInitPromise) return dbInitPromise;

  dbInitPromise = new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }

    requestPersistentStorage();

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORES.USERS)) {
        db.createObjectStore(STORES.USERS, { keyPath: 'code' });
      }
      if (!db.objectStoreNames.contains(STORES.SNAPSHOTS)) {
        const snapStore = db.createObjectStore(STORES.SNAPSHOTS, { keyPath: 'id' });
        snapStore.createIndex('timestamp', 'timestamp', { unique: false });
        snapStore.createIndex('userCode', 'userCode', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORES.OUTBOX)) {
        db.createObjectStore(STORES.OUTBOX, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.ACTIVITY)) {
        db.createObjectStore(STORES.ACTIVITY, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.SYNC_CONFIG)) {
        db.createObjectStore(STORES.SYNC_CONFIG, { keyPath: 'key' });
      }
    };

    request.onsuccess = (e) => {
      dbInstance = e.target.result;
      // Preload users into memory cache
      preloadMemoryCache(dbInstance).then(() => {
        resolve(dbInstance);
      });
    };

    request.onerror = () => {
      console.warn('[Sobagu DB] IndexedDB unavailable, continuing with memory & localStorage fallback');
      resolve(null);
    };
  });

  return dbInitPromise;
};

// Preload users from IndexedDB and merge with localStorage
const preloadMemoryCache = async (db) => {
  try {
    const tx = db.transaction([STORES.USERS], 'readonly');
    const store = tx.objectStore(STORES.USERS);
    const getAllReq = store.getAll();

    return new Promise((resolve) => {
      getAllReq.onsuccess = () => {
        const dbUsers = getAllReq.result || [];
        const localUsers = getLocalStorageUsers();
        
        // Merge IndexedDB users and localStorage users
        const merged = { ...localUsers };
        dbUsers.forEach((u) => {
          if (u && u.code) {
            merged[u.code] = { ...(merged[u.code] || {}), ...u };
          }
        });

        memoryCache.users = merged;
        resolve(merged);
      };
      getAllReq.onerror = () => {
        memoryCache.users = getLocalStorageUsers();
        resolve(memoryCache.users);
      };
    });
  } catch {
    memoryCache.users = getLocalStorageUsers();
    return memoryCache.users;
  }
};

const getLocalStorageUsers = () => {
  try {
    return JSON.parse(localStorage.getItem('sobagu_users') || '{}');
  } catch {
    return {};
  }
};

// ── CRUD Operations ─────────────────────────────────────────────────────────

export const dbSaveUser = async (user) => {
  if (!user || !user.code) return;
  const cleanCode = String(user.code).replace(/\D/g, '');
  if (!cleanCode) return;

  const normalized = { ...user, code: cleanCode, lastUpdated: Date.now() };

  // 1. Update fast memory cache
  memoryCache.users[cleanCode] = normalized;

  // 2. Safe dual-write to localStorage mirror
  try {
    const currentLocal = getLocalStorageUsers();
    currentLocal[cleanCode] = normalized;
    localStorage.setItem('sobagu_users', JSON.stringify(currentLocal));
  } catch (err) {
    console.warn('[Sobagu DB] LocalStorage quota exceeded, storing safely in IndexedDB unlimited engine:', err);
  }

  // 3. Write to IndexedDB
  const db = await initIndexedDB();
  if (db) {
    try {
      const tx = db.transaction([STORES.USERS], 'readwrite');
      const store = tx.objectStore(STORES.USERS);
      store.put(normalized);
    } catch (err) {
      console.warn('[Sobagu DB] IndexedDB write failed:', err);
    }
  }
};

export const dbSaveAllUsers = async (users) => {
  if (!users) return;
  memoryCache.users = { ...users };

  try {
    localStorage.setItem('sobagu_users', JSON.stringify(users));
  } catch {}

  const db = await initIndexedDB();
  if (db) {
    try {
      const tx = db.transaction([STORES.USERS], 'readwrite');
      const store = tx.objectStore(STORES.USERS);
      Object.values(users).forEach((u) => {
        if (u && u.code) store.put(u);
      });
    } catch {}
  }
};

export const dbGetUser = async (code) => {
  const cleanCode = String(code).replace(/\D/g, '');
  if (!cleanCode) return null;

  if (memoryCache.users[cleanCode]) {
    return memoryCache.users[cleanCode];
  }

  const db = await initIndexedDB();
  if (db) {
    try {
      const tx = db.transaction([STORES.USERS], 'readonly');
      const store = tx.objectStore(STORES.USERS);
      const req = store.get(cleanCode);
      return new Promise((resolve) => {
        req.onsuccess = () => {
          const u = req.result || null;
          if (u) memoryCache.users[cleanCode] = u;
          resolve(u || memoryCache.users[cleanCode] || null);
        };
        req.onerror = () => resolve(memoryCache.users[cleanCode] || null);
      });
    } catch {
      return memoryCache.users[cleanCode] || null;
    }
  }
  return memoryCache.users[cleanCode] || null;
};

// ── Snapshots & Version History ─────────────────────────────────────────────

export const dbSaveSnapshot = async (user, reason = 'Auto Backup') => {
  if (!user || !user.code) return null;
  const snapshot = {
    id: `snap_${user.code}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    userCode: user.code,
    userName: user.name,
    timestamp: Date.now(),
    dateStr: new Date().toLocaleString(),
    reason,
    stats: {
      xp: user.xp || 0,
      level: user.level || 1,
      streak: user.streak || 0,
      badgesCount: (user.badges || []).length,
      lessonsCount: (user.completedLessons || []).length,
      srsCount: Object.keys(user.srsCards || {}).length,
    },
    data: JSON.parse(JSON.stringify(user)),
  };

  const db = await initIndexedDB();
  if (db) {
    try {
      const tx = db.transaction([STORES.SNAPSHOTS], 'readwrite');
      const store = tx.objectStore(STORES.SNAPSHOTS);
      store.put(snapshot);

      // Keep only last 25 snapshots per user
      const idx = store.index('userCode');
      const req = idx.getAll(user.code);
      req.onsuccess = () => {
        const all = req.result || [];
        if (all.length > 25) {
          all.sort((a, b) => a.timestamp - b.timestamp);
          const toDelete = all.slice(0, all.length - 25);
          const delTx = db.transaction([STORES.SNAPSHOTS], 'readwrite');
          const delStore = delTx.objectStore(STORES.SNAPSHOTS);
          toDelete.forEach((s) => delStore.delete(s.id));
        }
      };
    } catch {}
  }

  // Also save latest 3 in localStorage for instant offline access
  try {
    const localSnaps = JSON.parse(localStorage.getItem(`sobagu_snaps_${user.code}`) || '[]');
    localSnaps.unshift({ ...snapshot, data: undefined }); // metadata only
    localStorage.setItem(`sobagu_snaps_${user.code}`, JSON.stringify(localSnaps.slice(0, 5)));
  } catch {}

  return snapshot;
};

export const dbGetSnapshots = async (userCode) => {
  const cleanCode = String(userCode).replace(/\D/g, '');
  if (!cleanCode) return [];

  const db = await initIndexedDB();
  if (db) {
    try {
      const tx = db.transaction([STORES.SNAPSHOTS], 'readonly');
      const store = tx.objectStore(STORES.SNAPSHOTS);
      const idx = store.index('userCode');
      const req = idx.getAll(cleanCode);

      return new Promise((resolve) => {
        req.onsuccess = () => {
          const list = req.result || [];
          list.sort((a, b) => b.timestamp - a.timestamp);
          resolve(list);
        };
        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }
  return [];
};

// ── Storage Usage Analytics ──────────────────────────────────────────────────

export const dbGetStorageAnalytics = async (user) => {
  const users = memoryCache.users || getLocalStorageUsers();
  const rawUsersStr = JSON.stringify(users);
  const usersBytes = new Blob([rawUsersStr]).size;

  let userBytes = 0;
  let srsBytes = 0;
  let activityBytes = 0;

  if (user) {
    userBytes = new Blob([JSON.stringify(user)]).size;
    srsBytes = new Blob([JSON.stringify(user.srsCards || {})]).size;
    activityBytes = new Blob([JSON.stringify(user.activity || {})]).size;
  }

  let quotaEstimate = { used: usersBytes, total: 1024 * 1024 * 1024 * 5 }; // default ~5GB
  let isPersisted = false;

  try {
    if (typeof navigator !== 'undefined' && navigator.storage) {
      if (navigator.storage.estimate) {
        const est = await navigator.storage.estimate();
        if (est.usage) quotaEstimate.used = est.usage;
        if (est.quota) quotaEstimate.total = est.quota;
      }
      if (navigator.storage.persisted) {
        isPersisted = await navigator.storage.persisted();
      }
    }
  } catch {}

  return {
    userBytes,
    userSizeKB: (userBytes / 1024).toFixed(2),
    srsBytes,
    srsSizeKB: (srsBytes / 1024).toFixed(2),
    activityBytes,
    activitySizeKB: (activityBytes / 1024).toFixed(2),
    totalUsedBytes: quotaEstimate.used,
    totalUsedMB: (quotaEstimate.used / (1024 * 1024)).toFixed(2),
    totalQuotaMB: (quotaEstimate.total / (1024 * 1024)).toFixed(0),
    isPersisted,
    engine: 'IndexedDB Unlimited Engine (Persistent)',
  };
};

// Auto-initialize on import
if (typeof window !== 'undefined') {
  initIndexedDB().catch(() => {});
}
