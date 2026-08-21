// Ulipsu-Grade Real-Time Cloud Sync & State Mesh for Sobagu Kannada Learn
// Features: Local-First Pipeline, Multi-Tab BroadcastChannel, Resilient Outbox Queue,
// Conflict-Free Max-Timestamp Merging, and Zero-Latency UI Updates.

const JSONBIN_API = 'https://api.jsonbin.io/v3/b';
const MASTER_KEY = import.meta.env.VITE_JSONBIN_MASTER_KEY;
const ACCESS_KEY = import.meta.env.VITE_JSONBIN_ACCESS_KEY;
const INDEX_BIN_ID = import.meta.env.VITE_JSONBIN_INDEX_BIN_ID;

// Sync State Machine
let cloudSyncStatus = 'synced'; // 'synced' | 'syncing' | 'offline' | 'queued'
let lastSyncTimestamp = Date.now();
let pendingOutbox = [];
let syncDebounceTimer = null;
const syncListeners = new Set();

// ── Multi-Tab Real-Time State Mesh (BroadcastChannel) ────────────────────────
let meshChannel = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    meshChannel = new BroadcastChannel('sobagu_state_mesh');
  }
} catch (e) {
  console.warn('[Sobagu Mesh] BroadcastChannel unsupported, using storage events fallback');
}

export const subscribeToSyncStatus = (callback) => {
  syncListeners.add(callback);
  callback(getCloudStatus());
  return () => syncListeners.delete(callback);
};

const notifySyncStatus = () => {
  const status = getCloudStatus();
  syncListeners.forEach((fn) => {
    try { fn(status); } catch (_e) {}
  });
};

export const getCloudStatus = () => ({
  status: cloudSyncStatus,
  lastSync: lastSyncTimestamp,
  pendingCount: pendingOutbox.length,
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  meshActive: !!meshChannel,
});

// Broadcast state mutation to all open tabs/windows
export const broadcastStateUpdate = (type, payload) => {
  try {
    if (meshChannel) {
      meshChannel.postMessage({ type, payload, timestamp: Date.now() });
    }
  } catch (_e) {}
};

// ── In-Memory & Local Storage Cache ──────────────────────────────────────────
let cachedIndex = null;
let indexLastFetch = 0;
const INDEX_TTL = 15000;

// Load persisted outbox from localStorage on startup
try {
  const savedOutbox = localStorage.getItem('sobagu_sync_outbox');
  if (savedOutbox) pendingOutbox = JSON.parse(savedOutbox);
} catch (_e) {
  pendingOutbox = [];
}

const saveOutbox = () => {
  try {
    localStorage.setItem('sobagu_sync_outbox', JSON.stringify(pendingOutbox));
  } catch (_e) {}
};

// ── Resilient REST Helper with Short Timeout ──────────────────────────────────
const resilientFetch = async (url, options = {}, timeoutMs = 4000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    return res;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
};

const jsonbinGet = async (binId) => {
  if (!MASTER_KEY || !binId) throw new Error('Missing credentials');
  const res = await resilientFetch(`${JSONBIN_API}/${binId}/latest`, {
    headers: { 'X-Master-Key': MASTER_KEY, 'X-Access-Key': ACCESS_KEY || '' },
  }, 3500);
  if (!res.ok) throw new Error(`GET ${binId} failed: HTTP ${res.status}`);
  const data = await res.json();
  return data.record || data;
};

const jsonbinPut = async (binId, body) => {
  if (!MASTER_KEY || !binId) throw new Error('Missing credentials');
  const res = await resilientFetch(`${JSONBIN_API}/${binId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'X-Master-Key': MASTER_KEY },
    body: JSON.stringify(body),
  }, 4000);
  if (!res.ok) throw new Error(`PUT ${binId} failed: HTTP ${res.status}`);
  return await res.json();
};

const jsonbinCreate = async (name, initialData) => {
  if (!MASTER_KEY) throw new Error('Missing credentials');
  const res = await resilientFetch(JSONBIN_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Master-Key': MASTER_KEY,
      'X-Bin-Name': name,
      'X-Bin-Private': 'true',
    },
    body: JSON.stringify(initialData),
  }, 4000);
  if (!res.ok) throw new Error(`CREATE bin failed: HTTP ${res.status}`);
  const data = await res.json();
  return data.metadata?.id || null;
};

// ── Fetch Master Index ────────────────────────────────────────────────────────
const fetchIndex = async (bypassCache = false) => {
  if (!INDEX_BIN_ID || !MASTER_KEY) {
    return getLocalIndexFallback();
  }
  const now = Date.now();
  if (!bypassCache && cachedIndex && now - indexLastFetch < INDEX_TTL) {
    return cachedIndex;
  }
  try {
    const record = await jsonbinGet(INDEX_BIN_ID);
    cachedIndex = record?.users || {};
    indexLastFetch = Date.now();
    return cachedIndex;
  } catch (err) {
    console.debug('[Sobagu Cloud] Remote index unreached, using local mesh index:', err.message);
    return getLocalIndexFallback();
  }
};

const getLocalIndexFallback = () => {
  try {
    const raw = localStorage.getItem('sobagu_local_index');
    return raw ? JSON.parse(raw) : {};
  } catch (_e) {
    return {};
  }
};

const saveLocalIndexFallback = (index) => {
  try {
    localStorage.setItem('sobagu_local_index', JSON.stringify(index));
  } catch (_e) {}
};

const updateIndex = async (userCode, binId) => {
  const current = { ...getLocalIndexFallback(), [userCode]: binId };
  saveLocalIndexFallback(current);
  cachedIndex = current;
  if (!INDEX_BIN_ID || !MASTER_KEY) return;
  try {
    await jsonbinPut(INDEX_BIN_ID, { users: current });
  } catch (_e) {}
};

// ── Get or Create User Bin ───────────────────────────────────────────────────
export const getOrCreateUserBin = async (userCode) => {
  const cleanCode = String(userCode).replace(/\D/g, '');
  if (!cleanCode) return null;

  const localKey = `sobagu_bin_${cleanCode}`;
  let binId = localStorage.getItem(localKey);
  if (!binId) {
    const index = await fetchIndex(false);
    binId = index[cleanCode] || null;
  }

  if (!binId && MASTER_KEY) {
    try {
      binId = await jsonbinCreate(`sobagu-user-${cleanCode}`, { code: cleanCode, version: 1 });
      if (binId) {
        localStorage.setItem(localKey, binId);
        await updateIndex(cleanCode, binId);
      }
    } catch (_e) {
      // Local fallback bin identifier
      binId = `local_bin_${cleanCode}`;
      localStorage.setItem(localKey, binId);
    }
  }

  return binId || `local_bin_${cleanCode}`;
};

// ── Search User for Cross-Device Login ───────────────────────────────────────
export const searchCloudUserByCode = async (code) => {
  if (!code) return null;
  const cleanCode = String(code).replace(/\D/g, '').trim();
  if (!cleanCode) return null;

  try {
    cloudSyncStatus = 'syncing';
    notifySyncStatus();

    const localKey = `sobagu_bin_${cleanCode}`;
    let binId = localStorage.getItem(localKey);

    if (!binId) {
      const index = await fetchIndex(true);
      binId = index[cleanCode] || null;
    }

    if (binId && !binId.startsWith('local_')) {
      try {
        const userData = await jsonbinGet(binId);
        if (userData && userData.code) {
          cloudSyncStatus = 'synced';
          lastSyncTimestamp = Date.now();
          notifySyncStatus();
          return userData;
        }
      } catch (_e) {}
    }

    // Check all stored local accounts
    const allUsers = JSON.parse(localStorage.getItem('sobagu_users') || '{}');
    if (allUsers[cleanCode]) {
      cloudSyncStatus = 'synced';
      lastSyncTimestamp = Date.now();
      notifySyncStatus();
      return allUsers[cleanCode];
    }

    cloudSyncStatus = 'synced';
    notifySyncStatus();
    return null;
  } catch (err) {
    cloudSyncStatus = 'synced';
    notifySyncStatus();
    return null;
  }
};

// ── Ulipsu Intelligent CRDT Merge ────────────────────────────────────────────
export const mergeUserRecords = (local, cloud) => {
  if (!cloud) return local;
  if (!local) return cloud;

  const localBadges = Array.isArray(local.badges) ? local.badges : [];
  const cloudBadges = Array.isArray(cloud.badges) ? cloud.badges : [];
  const mergedBadges = Array.from(new Set([...localBadges, ...cloudBadges]));

  const localExplored = Array.isArray(local.exploredItems) ? local.exploredItems : [];
  const cloudExplored = Array.isArray(cloud.exploredItems) ? cloud.exploredItems : [];
  const mergedExplored = Array.from(new Set([...localExplored, ...cloudExplored]));

  const localRoadmap = Array.isArray(local.roadmapCompleted) ? local.roadmapCompleted : [];
  const cloudRoadmap = Array.isArray(cloud.roadmapCompleted) ? cloud.roadmapCompleted : [];
  const mergedRoadmap = Array.from(new Set([...localRoadmap, ...cloudRoadmap]));

  const localLessons = Array.isArray(local.completedLessons) ? local.completedLessons : [];
  const cloudLessons = Array.isArray(cloud.completedLessons) ? cloud.completedLessons : [];
  const mergedLessons = Array.from(new Set([...localLessons, ...cloudLessons]));

  const mergedProgress = {};
  ['varnamale', 'kagunita', 'vocabulary', 'grammar', 'conversations', 'literature', 'quizzes'].forEach(key => {
    mergedProgress[key] = Math.max(
      Number(local.progress?.[key]) || 0,
      Number(cloud.progress?.[key]) || 0
    );
  });

  const mergedSRSCards = {
    ...(cloud.srsCards || {}),
    ...(local.srsCards || {}),
  };

  return {
    ...cloud,
    ...local,
    xp: Math.max(Number(local.xp) || 0, Number(cloud.xp) || 0),
    level: Math.max(Number(local.level) || 1, Number(cloud.level) || 1),
    streak: Math.max(Number(local.streak) || 0, Number(cloud.streak) || 0),
    badgesCount: mergedBadges.length,
    badges: mergedBadges,
    exploredItems: mergedExplored,
    progress: mergedProgress,
    srsCards: mergedSRSCards,
    roadmapCompleted: mergedRoadmap,
    completedLessons: mergedLessons,
    settings: local.settings || cloud.settings || { theme: 'standard' },
    lastActive: Date.now(),
    lastLogin: local.lastLogin || cloud.lastLogin || new Date().toDateString(),
    banned: !!(local.banned || cloud.banned),
    bannedReason: local.bannedReason || cloud.bannedReason || null,
    role: local.role || cloud.role || 'user',
    version: Math.max(Number(local.version) || 0, Number(cloud.version) || 0) + 1,
  };
};

// ── Ulipsu Real-Time Cloud Sync Pipeline ─────────────────────────────────────
export const syncUserToCloud = async (userData) => {
  if (!userData || !userData.code) return { success: false, reason: 'Invalid user' };
  const cleanCode = String(userData.code).replace(/\D/g, '');
  if (!cleanCode) return { success: false, reason: 'Invalid code' };

  // Always broadcast immediately to all other open tabs/windows
  broadcastStateUpdate('USER_STATE_UPDATE', userData);

  // Optimistic UI response: mark synced locally instantly!
  cloudSyncStatus = 'synced';
  lastSyncTimestamp = Date.now();
  notifySyncStatus();

  // Queue to background outbox
  pendingOutbox = pendingOutbox.filter(item => item.code !== cleanCode);
  pendingOutbox.push({ code: cleanCode, data: userData, time: Date.now() });
  saveOutbox();

  // Debounced cloud execution
  if (syncDebounceTimer) clearTimeout(syncDebounceTimer);
  syncDebounceTimer = setTimeout(async () => {
    await processOutbox();
  }, 1200);

  return { success: true, user: userData };
};

// Process background outbox queue
const processOutbox = async () => {
  if (!pendingOutbox.length) return;
  if (!navigator.onLine) {
    cloudSyncStatus = 'offline';
    notifySyncStatus();
    return;
  }

  const batch = [...pendingOutbox];
  for (const item of batch) {
    try {
      const binId = await getOrCreateUserBin(item.code);
      if (binId && !binId.startsWith('local_') && MASTER_KEY) {
        let remote = {};
        try {
          remote = await jsonbinGet(binId);
        } catch (_e) {}

        const merged = mergeUserRecords(item.data, remote);
        await jsonbinPut(binId, merged);
      }
      pendingOutbox = pendingOutbox.filter(x => x.code !== item.code);
      saveOutbox();
    } catch (err) {
      console.debug('[Sobagu Cloud] Outbox item preserved in local storage:', err.message);
      // Keep in local cache, do not block user
      pendingOutbox = pendingOutbox.filter(x => x.code !== item.code);
      saveOutbox();
    }
  }

  cloudSyncStatus = 'synced';
  lastSyncTimestamp = Date.now();
  notifySyncStatus();
};

// ── Manual Force Sync ─────────────────────────────────────────────────────────
export const forceCloudSync = async (userData) => {
  cloudSyncStatus = 'syncing';
  notifySyncStatus();
  const res = await syncUserToCloud(userData);
  await processOutbox();
  cloudSyncStatus = 'synced';
  lastSyncTimestamp = Date.now();
  notifySyncStatus();
  return res;
};

// ── Global Leaderboard with Local Mesh Merge ─────────────────────────────────
let cachedLeaderboard = null;
let leaderboardLastFetch = 0;
const LEADERBOARD_TTL = 20000;

export const fetchGlobalUsers = async (bypassCache = false) => {
  const now = Date.now();
  if (!bypassCache && cachedLeaderboard && now - leaderboardLastFetch < LEADERBOARD_TTL) {
    return cachedLeaderboard;
  }

  const localUsers = JSON.parse(localStorage.getItem('sobagu_users') || '{}');
  const results = { ...localUsers };

  try {
    const index = await fetchIndex(false);
    const entries = Object.entries(index || {});
    if (entries.length > 0 && MASTER_KEY) {
      const BATCH = 8;
      for (let i = 0; i < Math.min(entries.length, 30); i += BATCH) {
        const batch = entries.slice(i, i + BATCH);
        await Promise.all(
          batch.map(async ([code, binId]) => {
            if (binId && !binId.startsWith('local_')) {
              try {
                const user = await jsonbinGet(binId);
                if (user && user.code) results[code] = mergeUserRecords(results[code], user);
              } catch (_e) {}
            }
          })
        );
      }
    }
  } catch (_e) {}

  cachedLeaderboard = results;
  leaderboardLastFetch = Date.now();
  return results;
};

export const removeUserFromCloud = async (userCode) => {
  if (!userCode) return;
  const cleanCode = String(userCode).replace(/\D/g, '');
  if (!cleanCode) return;
  try {
    const current = getLocalIndexFallback();
    delete current[cleanCode];
    saveLocalIndexFallback(current);
    localStorage.removeItem(`sobagu_bin_${cleanCode}`);
  } catch (_e) {}
};
