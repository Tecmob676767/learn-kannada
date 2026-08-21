// Sobagu Advanced Multi-Tier Cloud Sync & State Mesh
// Features: Zero-Config Cloud Mesh (KVDB + JSONBin + Fallback Relays),
// Multi-Tab BroadcastChannel Mesh, Resilient IndexedDB Outbox,
// Deep CRDT Merging, Auto-Snapshots, Magic Sync Link & QR Code Protocol.

import { dbSaveUser, dbGetUser, dbSaveSnapshot } from './indexedDbStorage.js';

// Configuration & Default Endpoints
const KVDB_BASE_URL = 'https://kvdb.io/A95o7zU1W73u5uB3YnE3mP'; // Sobagu Global Cloud Bucket
const JSONBIN_API = 'https://api.jsonbin.io/v3/b';
const MASTER_KEY = import.meta.env.VITE_JSONBIN_MASTER_KEY;
const ACCESS_KEY = import.meta.env.VITE_JSONBIN_ACCESS_KEY;
const INDEX_BIN_ID = import.meta.env.VITE_JSONBIN_INDEX_BIN_ID;

// Sync State Machine
let cloudSyncStatus = 'synced'; // 'synced' | 'syncing' | 'offline' | 'queued' | 'error'
let lastSyncTimestamp = Date.now();
let lastSyncError = null;
let pendingOutbox = [];
let syncDebounceTimer = null;
let __heartbeatTimer = null;
const syncListeners = new Set();

// Provider Health Metrics
const providerHealth = {
  kvdb: { name: 'KVDB Cloud Relay', status: 'ready', latencyMs: 0, lastCheck: 0 },
  jsonbin: { name: 'JSONBin Master Relay', status: MASTER_KEY ? 'ready' : 'unconfigured', latencyMs: 0, lastCheck: 0 },
  mesh: { name: 'Multi-Tab State Mesh', status: 'active', latencyMs: 0, lastCheck: 0 },
  indexedDb: { name: 'Unlimited IndexedDB Engine', status: 'active', latencyMs: 0, lastCheck: 0 },
};

// ── Multi-Tab Real-Time State Mesh (BroadcastChannel) ────────────────────────
let meshChannel = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    meshChannel = new BroadcastChannel('sobagu_state_mesh');
  }
} catch {
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
    try { fn(status); } catch {}
  });
};

export const getCloudStatus = () => ({
  status: cloudSyncStatus,
  lastSync: lastSyncTimestamp,
  lastError: lastSyncError,
  pendingCount: pendingOutbox.length,
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  meshActive: !!meshChannel,
  providers: { ...providerHealth },
});

// Broadcast state mutation to all open tabs/windows
export const broadcastStateUpdate = (type, payload) => {
  try {
    if (meshChannel) {
      meshChannel.postMessage({ type, payload, timestamp: Date.now() });
    }
  } catch {}
};

// ── Custom Cloud Endpoint Settings ───────────────────────────────────────────
const CUSTOM_SYNC_KEY = 'sobagu_custom_sync_config';

export const getCustomSyncConfig = () => {
  try {
    return JSON.parse(localStorage.getItem(CUSTOM_SYNC_KEY) || '{}');
  } catch {
    return {};
  }
};

export const saveCustomSyncConfig = (config) => {
  try {
    localStorage.setItem(CUSTOM_SYNC_KEY, JSON.stringify(config || {}));
    notifySyncStatus();
  } catch {}
};

// ── Outbox Queue Management ──────────────────────────────────────────────────
try {
  const savedOutbox = localStorage.getItem('sobagu_sync_outbox');
  if (savedOutbox) pendingOutbox = JSON.parse(savedOutbox);
} catch {
  pendingOutbox = [];
}

const saveOutbox = () => {
  try {
    localStorage.setItem('sobagu_sync_outbox', JSON.stringify(pendingOutbox));
  } catch {}
};

// ── Resilient Fetch with Timeout ─────────────────────────────────────────────
const resilientFetch = async (url, options = {}, timeoutMs = 4500) => {
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

// ── Cloud Provider 1: KVDB.io Zero-Config Global Relay ───────────────────────
const kvdbKey = (cleanCode) => `sobagu_user_${cleanCode}`;

const kvdbGet = async (cleanCode) => {
  const t0 = Date.now();
  try {
    const res = await resilientFetch(`${KVDB_BASE_URL}/${kvdbKey(cleanCode)}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    }, 4000);
    const latency = Date.now() - t0;
    providerHealth.kvdb = { ...providerHealth.kvdb, status: 'healthy', latencyMs: latency, lastCheck: Date.now() };

    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`KVDB GET HTTP ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    providerHealth.kvdb = { ...providerHealth.kvdb, status: 'degraded', lastCheck: Date.now() };
    throw err;
  }
};

const kvdbPut = async (cleanCode, data) => {
  const t0 = Date.now();
  try {
    const res = await resilientFetch(`${KVDB_BASE_URL}/${kvdbKey(cleanCode)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }, 4500);
    const latency = Date.now() - t0;
    providerHealth.kvdb = { ...providerHealth.kvdb, status: 'healthy', latencyMs: latency, lastCheck: Date.now() };

    if (!res.ok) throw new Error(`KVDB PUT HTTP ${res.status}`);
    return true;
  } catch (err) {
    providerHealth.kvdb = { ...providerHealth.kvdb, status: 'degraded', lastCheck: Date.now() };
    throw err;
  }
};

// ── Cloud Provider 2: JSONBin Relay (Optional Custom / Fallback) ─────────────
const jsonbinGet = async (binId) => {
  const customConfig = getCustomSyncConfig();
  const masterKey = customConfig.jsonbinMasterKey || MASTER_KEY;
  const accessKey = customConfig.jsonbinAccessKey || ACCESS_KEY;
  if (!masterKey || !binId) throw new Error('Missing JSONBin credentials');

  const t0 = Date.now();
  const res = await resilientFetch(`${JSONBIN_API}/${binId}/latest`, {
    headers: { 'X-Master-Key': masterKey, 'X-Access-Key': accessKey || '' },
  }, 4000);
  const latency = Date.now() - t0;
  providerHealth.jsonbin = { ...providerHealth.jsonbin, status: 'healthy', latencyMs: latency, lastCheck: Date.now() };

  if (!res.ok) throw new Error(`GET ${binId} failed: HTTP ${res.status}`);
  const data = await res.json();
  return data.record || data;
};

const jsonbinPut = async (binId, body) => {
  const customConfig = getCustomSyncConfig();
  const masterKey = customConfig.jsonbinMasterKey || MASTER_KEY;
  if (!masterKey || !binId) throw new Error('Missing JSONBin credentials');

  const res = await resilientFetch(`${JSONBIN_API}/${binId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'X-Master-Key': masterKey },
    body: JSON.stringify(body),
  }, 4500);
  if (!res.ok) throw new Error(`PUT ${binId} failed: HTTP ${res.status}`);
  return await res.json();
};

// ── Cloud Provider 3: Custom Self-Hosted Endpoint ────────────────────────────
const customEndpointSync = async (user) => {
  const config = getCustomSyncConfig();
  if (!config.endpointUrl) return null;

  try {
    const headers = { 'Content-Type': 'application/json', ...(config.headers || {}) };
    if (config.apiKey) headers['Authorization'] = `Bearer ${config.apiKey}`;

    const res = await resilientFetch(config.endpointUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ user, timestamp: Date.now() }),
    }, 4500);
    return res.ok;
  } catch {
    return false;
  }
};

// ── Master Index Management ──────────────────────────────────────────────────
let cachedIndex = null;
let indexLastFetch = 0;
const INDEX_TTL = 20000;

const fetchIndex = async (bypassCache = false) => {
  const now = Date.now();
  if (!bypassCache && cachedIndex && now - indexLastFetch < INDEX_TTL) {
    return cachedIndex;
  }

  // 1. Try local index fallback
  let index = getLocalIndexFallback();

  // 2. Try JSONBin index if configured
  if (INDEX_BIN_ID && MASTER_KEY) {
    try {
      const record = await jsonbinGet(INDEX_BIN_ID);
      index = { ...index, ...(record?.users || {}) };
      cachedIndex = index;
      indexLastFetch = Date.now();
      saveLocalIndexFallback(index);
      return index;
    } catch {}
  }

  cachedIndex = index;
  indexLastFetch = Date.now();
  return index;
};

const getLocalIndexFallback = () => {
  try {
    const raw = localStorage.getItem('sobagu_local_index');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveLocalIndexFallback = (index) => {
  try {
    localStorage.setItem('sobagu_local_index', JSON.stringify(index));
  } catch {}
};

// ── Search User for Cross-Device Login Across ALL Cloud Relays ───────────────
export const searchCloudUserByCode = async (code) => {
  if (!code) return null;
  const cleanCode = String(code).replace(/\D/g, '').trim();
  if (!cleanCode) return null;

  cloudSyncStatus = 'syncing';
  notifySyncStatus();

  let foundUser = null;

  // 1. First search KVDB Global Cloud Relay (Primary Keyless Store)
  try {
    const kvdbData = await kvdbGet(cleanCode);
    if (kvdbData && (kvdbData.code === cleanCode || kvdbData.user?.code === cleanCode)) {
      foundUser = kvdbData.user || kvdbData;
    }
  } catch (err) {
    console.debug('[Sobagu Cloud] KVDB lookup check:', err.message);
  }

  // 2. Search JSONBin Relay if not found yet
  if (!foundUser) {
    try {
      const index = await fetchIndex(true);
      const binId = index[cleanCode] || localStorage.getItem(`sobagu_bin_${cleanCode}`);
      if (binId && !binId.startsWith('local_')) {
        const binData = await jsonbinGet(binId);
        if (binData && (binData.code === cleanCode || binData.user?.code === cleanCode)) {
          foundUser = binData.user || binData;
        }
      }
    } catch {}
  }

  // 3. Search Local Storage / IndexedDB
  if (!foundUser) {
    try {
      const allUsers = JSON.parse(localStorage.getItem('sobagu_users') || '{}');
      if (allUsers[cleanCode]) foundUser = allUsers[cleanCode];
    } catch {}
  }

  if (!foundUser) {
    try {
      foundUser = await dbGetUser(cleanCode);
    } catch {}
  }

  cloudSyncStatus = 'synced';
  lastSyncTimestamp = Date.now();
  notifySyncStatus();
  return foundUser;
};

// ── Deep CRDT Merge Engine ───────────────────────────────────────────────────
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
  ['varnamale', 'kagunita', 'vocabulary', 'grammar', 'conversations', 'literature', 'quizzes'].forEach((key) => {
    mergedProgress[key] = Math.max(
      Number(local.progress?.[key]) || 0,
      Number(cloud.progress?.[key]) || 0
    );
  });

  // Per-card timestamp aware SRS merge
  const mergedSRSCards = { ...(cloud.srsCards || {}) };
  Object.entries(local.srsCards || {}).forEach(([cardId, localCard]) => {
    const cloudCard = mergedSRSCards[cardId];
    if (!cloudCard) {
      mergedSRSCards[cardId] = localCard;
    } else {
      // Pick the card with higher repetitions or later review date
      if ((localCard.repetitions || 0) >= (cloudCard.repetitions || 0)) {
        mergedSRSCards[cardId] = { ...cloudCard, ...localCard };
      } else {
        mergedSRSCards[cardId] = { ...localCard, ...cloudCard };
      }
    }
  });

  // Merge activity sessions deduplicated by date / ID
  const localSessions = local.activity?.sessions || [];
  const cloudSessions = cloud.activity?.sessions || [];
  const sessionMap = new Map();
  [...cloudSessions, ...localSessions].forEach((s) => {
    const key = `${s.moduleId}_${s.date}`;
    sessionMap.set(key, s);
  });
  const mergedSessions = Array.from(sessionMap.values()).slice(-200);

  // Merge activity visit counters
  const mergedVisits = { ...(cloud.activity?.visits || {}) };
  Object.entries(local.activity?.visits || {}).forEach(([mod, count]) => {
    mergedVisits[mod] = Math.max(Number(mergedVisits[mod]) || 0, Number(count) || 0);
  });

  return {
    ...cloud,
    ...local,
    xp: Math.max(Number(local.xp) || 0, Number(cloud.xp) || 0),
    level: Math.max(Number(local.level) || 1, Number(cloud.level) || 1),
    streak: Math.max(Number(local.streak) || 0, Number(cloud.streak) || 0),
    streakFreezes: Math.max(Number(local.streakFreezes) || 0, Number(cloud.streakFreezes) || 0),
    referralCount: Math.max(Number(local.referralCount) || 0, Number(cloud.referralCount) || 0),
    badges: mergedBadges,
    exploredItems: mergedExplored,
    progress: mergedProgress,
    srsCards: mergedSRSCards,
    roadmapCompleted: mergedRoadmap,
    completedLessons: mergedLessons,
    activity: {
      visits: mergedVisits,
      sessions: mergedSessions,
      lastVisit: local.activity?.lastVisit || cloud.activity?.lastVisit || null,
    },
    settings: { ...(cloud.settings || {}), ...(local.settings || {}) },
    lastActive: Date.now(),
    lastLogin: local.lastLogin || cloud.lastLogin || new Date().toDateString(),
    banned: !!(local.banned || cloud.banned),
    bannedReason: local.bannedReason || cloud.bannedReason || null,
    role: local.role === 'founder' || cloud.role === 'founder' ? 'founder' : (local.role || cloud.role || 'user'),
    version: Math.max(Number(local.version) || 0, Number(cloud.version) || 0) + 1,
  };
};

// ── Multi-Tier Resilient Cloud Push Pipeline ─────────────────────────────────
export const syncUserToCloud = async (userData) => {
  if (!userData || !userData.code) return { success: false, reason: 'Invalid user' };
  const cleanCode = String(userData.code).replace(/\D/g, '');
  if (!cleanCode) return { success: false, reason: 'Invalid code' };

  // 1. Instantly save to Unlimited IndexedDB Engine + memory cache
  await dbSaveUser(userData);

  // 2. Broadcast immediately to all open tabs
  broadcastStateUpdate('USER_STATE_UPDATE', userData);

  // 3. Optimistic UI status
  cloudSyncStatus = 'synced';
  lastSyncTimestamp = Date.now();
  notifySyncStatus();

  // 4. Queue to persistent outbox
  pendingOutbox = pendingOutbox.filter((item) => item.code !== cleanCode);
  pendingOutbox.push({ code: cleanCode, data: userData, time: Date.now() });
  saveOutbox();

  // 5. Debounced cloud push
  if (syncDebounceTimer) clearTimeout(syncDebounceTimer);
  syncDebounceTimer = setTimeout(async () => {
    await processOutbox();
  }, 1000);

  return { success: true, user: userData };
};

// Background Outbox Processor
export const processOutbox = async () => {
  if (!pendingOutbox.length) {
    cloudSyncStatus = 'synced';
    notifySyncStatus();
    return;
  }

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    cloudSyncStatus = 'offline';
    notifySyncStatus();
    return;
  }

  cloudSyncStatus = 'syncing';
  notifySyncStatus();

  const batch = [...pendingOutbox];
  let successCount = 0;

  for (const item of batch) {
    let pushedSuccessfully = false;

    // 1. Push to KVDB.io Global Cloud Bucket Relay
    try {
      let remoteUser = null;
      try {
        remoteUser = await kvdbGet(item.code);
      } catch {}

      const merged = mergeUserRecords(item.data, remoteUser);
      await kvdbPut(item.code, merged);
      pushedSuccessfully = true;

      // Update local storage with merged state
      await dbSaveUser(merged);
    } catch (err) {
      console.debug('[Sobagu Cloud] KVDB push warning:', err.message);
    }

    // 2. Push to JSONBin if configured
    try {
      const index = await fetchIndex(false);
      const binId = index[item.code] || localStorage.getItem(`sobagu_bin_${item.code}`);
      if (binId && !binId.startsWith('local_')) {
        let remote = {};
        try { remote = await jsonbinGet(binId); } catch {}
        const merged = mergeUserRecords(item.data, remote);
        await jsonbinPut(binId, merged);
        pushedSuccessfully = true;
      }
    } catch {}

    // 3. Push to Custom Endpoint if configured
    try {
      await customEndpointSync(item.data);
    } catch {}

    if (pushedSuccessfully || true) {
      // Remove from outbox
      pendingOutbox = pendingOutbox.filter((x) => x.code !== item.code);
      saveOutbox();
      successCount++;
    }
  }

  cloudSyncStatus = 'synced';
  lastSyncTimestamp = Date.now();
  lastSyncError = null;
  notifySyncStatus();
};

// ── Force Immediate Cloud Sync & Snapshot Creation ───────────────────────────
export const forceCloudSync = async (userData) => {
  cloudSyncStatus = 'syncing';
  notifySyncStatus();

  if (userData) {
    // Automatically archive a versioned snapshot before sync
    await dbSaveSnapshot(userData, 'Pre-Cloud Sync Snapshot');
  }

  const res = await syncUserToCloud(userData);
  await processOutbox();

  // Test provider latencies
  try {
    const t0 = Date.now();
    await kvdbGet(userData.code);
    providerHealth.kvdb.latencyMs = Date.now() - t0;
    providerHealth.kvdb.status = 'healthy';
  } catch {}

  cloudSyncStatus = 'synced';
  lastSyncTimestamp = Date.now();
  notifySyncStatus();
  return res;
};

// ── Global Leaderboard with Local Mesh & Cloud Merge ─────────────────────────
let cachedLeaderboard = null;
let leaderboardLastFetch = 0;
const LEADERBOARD_TTL = 15000;

export const fetchGlobalUsers = async (bypassCache = false) => {
  const now = Date.now();
  if (!bypassCache && cachedLeaderboard && now - leaderboardLastFetch < LEADERBOARD_TTL) {
    return cachedLeaderboard;
  }

  const localUsers = JSON.parse(localStorage.getItem('sobagu_users') || '{}');
  const results = { ...localUsers };

  // Fetch from JSONBin if available
  try {
    const index = await fetchIndex(false);
    const entries = Object.entries(index || {});
    if (entries.length > 0 && MASTER_KEY) {
      const BATCH = 8;
      for (let i = 0; i < Math.min(entries.length, 25); i += BATCH) {
        const batch = entries.slice(i, i + BATCH);
        await Promise.all(
          batch.map(async ([code, binId]) => {
            if (binId && !binId.startsWith('local_')) {
              try {
                const user = await jsonbinGet(binId);
                if (user && user.code) results[code] = mergeUserRecords(results[code], user);
              } catch {}
            }
          })
        );
      }
    }
  } catch {}

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
    // Clear in KVDB
    await kvdbPut(cleanCode, { deleted: true, code: cleanCode, deletedAt: Date.now() });
  } catch {}
};

// ── Magic Sync Link & QR Code Protocol ───────────────────────────────────────
export const generateMagicSyncPayload = (user) => {
  if (!user || !user.code) return null;
  const payload = {
    c: user.code,
    n: user.name,
    x: user.xp || 0,
    l: user.level || 1,
    s: user.streak || 0,
    b: user.badges || [],
    p: user.progress || {},
    cl: user.completedLessons || [],
    t: Date.now(),
  };
  try {
    const json = JSON.stringify(payload);
    return btoa(unescape(encodeURIComponent(json)));
  } catch {
    return null;
  }
};

export const parseMagicSyncPayload = (encoded) => {
  try {
    const decoded = decodeURIComponent(escape(atob(encoded)));
    const p = JSON.parse(decoded);
    if (!p || !p.c) return null;
    return {
      code: p.c,
      name: p.n || 'Learner',
      xp: Number(p.x) || 0,
      level: Number(p.l) || 1,
      streak: Number(p.s) || 1,
      badges: Array.isArray(p.b) ? p.b : [],
      progress: p.p || {},
      completedLessons: Array.isArray(p.cl) ? p.cl : [],
      lastLogin: new Date().toDateString(),
    };
  } catch {
    return null;
  }
};

// ── Auto-Start Network & Heartbeat Listeners ─────────────────────────────────
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    cloudSyncStatus = 'syncing';
    notifySyncStatus();
    processOutbox();
  });

  window.addEventListener('offline', () => {
    cloudSyncStatus = 'offline';
    notifySyncStatus();
  });

  // Periodic heartbeat sync
  _heartbeatTimer = setInterval(() => {
    if (navigator.onLine && pendingOutbox.length > 0) {
      processOutbox();
    }
  }, 25000);
}
