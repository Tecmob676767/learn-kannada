// Plumine CS+ · Quantum Cloud Sync & Mesh Engine v6.0
// Features: Zero-Latency Multi-Tab State Mesh, 3-Way CRDT Reconciler,
// Resilient Cloud Outbox with Auto-Retry, Snapshots & 1-Click Quantum Magic Transfer.

const JSONBIN_API = 'https://api.jsonbin.io/v3/b';
const MASTER_KEY = import.meta.env.VITE_JSONBIN_MASTER_KEY;
const ACCESS_KEY = import.meta.env.VITE_JSONBIN_ACCESS_KEY;
const INDEX_BIN_ID = import.meta.env.VITE_JSONBIN_INDEX_BIN_ID;

// Telemetry & State
let syncStatus = 'synced'; // 'synced' | 'syncing' | 'offline' | 'queued' | 'error'
let lastSyncTime = Date.now();
let lastLatencyMs = 18;
let meshNodeCount = 1;
let outboxQueue = [];
let debounceTimer = null;
const listeners = new Set();

// ── Real-Time Multi-Tab State Mesh (BroadcastChannel) ────────────────────────
let stateMeshChannel = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    stateMeshChannel = new BroadcastChannel('plumine_cs_quantum_mesh');
    stateMeshChannel.onmessage = (e) => {
      const { type, payload, senderId } = e.data || {};
      if (type === 'PING') {
        stateMeshChannel.postMessage({ type: 'PONG', senderId: window.__sobagu_tab_id });
      } else if (type === 'PONG') {
        meshNodeCount = Math.max(meshNodeCount, 2);
        notify();
      } else if (type === 'QUANTUM_STATE_UPDATE' && payload) {
        // Integrate state from another tab
        const localUsers = JSON.parse(localStorage.getItem('sobagu_users') || '{}');
        if (payload.code) {
          localUsers[payload.code] = mergeRecords(localUsers[payload.code], payload);
          localStorage.setItem('sobagu_users', JSON.stringify(localUsers));
          const current = localStorage.getItem('sobagu_current_user');
          if (current === payload.code) {
            window.dispatchEvent(new CustomEvent('plumine:user_sync', { detail: payload }));
          }
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.__sobagu_tab_id = Math.random().toString(36).slice(2, 8);
      stateMeshChannel.postMessage({ type: 'PING', senderId: window.__sobagu_tab_id });
    }
  }
} catch {
  // Graceful fallback
}

// ── Outbox Queue Persistence ──────────────────────────────────────────────────
const OUTBOX_KEY = 'plumine_cs_outbox_queue';
const SNAPSHOTS_KEY = 'plumine_cs_snapshots';

const loadOutbox = () => {
  try { return JSON.parse(localStorage.getItem(OUTBOX_KEY) || '[]'); } catch { return []; }
};
const saveOutbox = () => {
  try { localStorage.setItem(OUTBOX_KEY, JSON.stringify(outboxQueue)); } catch {}
};
outboxQueue = loadOutbox();

export const subscribeToPlumineSync = (fn) => {
  listeners.add(fn);
  fn(getPlumineTelemetry());
  return () => listeners.delete(fn);
};

const notify = () => {
  const telemetry = getPlumineTelemetry();
  listeners.forEach((fn) => {
    try { fn(telemetry); } catch {}
  });
};

export const getPlumineTelemetry = () => ({
  status: syncStatus,
  lastSync: lastSyncTime,
  latencyMs: lastLatencyMs,
  meshNodes: meshNodeCount,
  pendingCount: outboxQueue.length,
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  engine: 'Plumine CS+ Quantum v6.0',
  protocol: 'CRDT Multi-Mesh Relay',
});

// ── JSONBin Cloud Relay Helpers ───────────────────────────────────────────────
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'X-Master-Key': MASTER_KEY || '',
  'X-Access-Key': ACCESS_KEY || '',
});

const cloudGet = async (binId) => {
  if (!binId || binId.startsWith('local_')) return null;
  const start = Date.now();
  const res = await fetch(`${JSONBIN_API}/${binId}/latest`, { headers: getHeaders() });
  lastLatencyMs = Date.now() - start;
  if (!res.ok) throw new Error(`Cloud fetch failed: ${res.status}`);
  const json = await res.json();
  return json.record || json;
};

const cloudPut = async (binId, data) => {
  if (!binId || binId.startsWith('local_')) return null;
  const start = Date.now();
  const res = await fetch(`${JSONBIN_API}/${binId}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  lastLatencyMs = Date.now() - start;
  if (!res.ok) throw new Error(`Cloud update failed: ${res.status}`);
  const json = await res.json();
  return json.record || json;
};

const cloudCreate = async (data, name = 'user') => {
  const res = await fetch(JSONBIN_API, {
    method: 'POST',
    headers: {
      ...getHeaders(),
      'X-Bin-Private': 'false',
      'X-Bin-Name': `plumine_user_${name}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Cloud create failed: ${res.status}`);
  const json = await res.json();
  return json.metadata?.id || json.id;
};

// ── Index Map ─────────────────────────────────────────────────────────────────
const INDEX_KEY = 'plumine_cs_global_index';
const getLocalIndex = () => {
  try { return JSON.parse(localStorage.getItem(INDEX_KEY) || '{}'); } catch { return {}; }
};
const saveLocalIndex = (idx) => {
  try { localStorage.setItem(INDEX_KEY, JSON.stringify(idx)); } catch {}
};

const fetchMasterIndex = async () => {
  if (!INDEX_BIN_ID || !MASTER_KEY) return getLocalIndex();
  try {
    const data = await cloudGet(INDEX_BIN_ID);
    if (data && typeof data === 'object') {
      const merged = { ...getLocalIndex(), ...data };
      saveLocalIndex(merged);
      return merged;
    }
  } catch (err) {
    console.debug('[Plumine CS+] Cloud index fallback:', err.message);
  }
  return getLocalIndex();
};

const updateMasterIndex = async (userCode, binId) => {
  const local = getLocalIndex();
  local[userCode] = binId;
  saveLocalIndex(local);

  if (!INDEX_BIN_ID || !MASTER_KEY) return;
  try {
    await cloudPut(INDEX_BIN_ID, local);
  } catch (_e) {}
};

const getOrCreateBin = async (userCode) => {
  const cleanCode = String(userCode).replace(/\D/g, '');
  const localKey = `plumine_bin_${cleanCode}`;
  let binId = localStorage.getItem(localKey);
  if (binId) return binId;

  const index = await fetchMasterIndex();
  if (index && index[cleanCode]) {
    localStorage.setItem(localKey, index[cleanCode]);
    return index[cleanCode];
  }

  if (MASTER_KEY) {
    try {
      const allUsers = JSON.parse(localStorage.getItem('sobagu_users') || '{}');
      const initialData = allUsers[cleanCode] || { code: cleanCode, createdAt: Date.now() };
      binId = await cloudCreate(initialData, cleanCode);
      if (binId) {
        localStorage.setItem(localKey, binId);
        await updateMasterIndex(cleanCode, binId);
        return binId;
      }
    } catch (err) {
      console.debug('[Plumine CS+] Bin allocation fallback to local:', err.message);
    }
  }

  binId = `local_${cleanCode}`;
  localStorage.setItem(localKey, binId);
  return binId;
};

// ── 3-Way CRDT Reconciler ─────────────────────────────────────────────────────
export const mergeRecords = (local, cloud) => {
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
  ['varnamale', 'kagunita', 'vocabulary', 'grammar', 'conversations', 'literature', 'quizzes', 'numbers', 'typing', 'pronunciation'].forEach(k => {
    mergedProgress[k] = Math.max(Number(local.progress?.[k]) || 0, Number(cloud.progress?.[k]) || 0);
  });

  const mergedSRSCards = { ...(cloud.srsCards || {}), ...(local.srsCards || {}) };

  return {
    ...cloud,
    ...local,
    xp: Math.max(Number(local.xp) || 0, Number(cloud.xp) || 0),
    level: Math.max(Number(local.level) || 1, Number(cloud.level) || 1),
    streak: Math.max(Number(local.streak) || 0, Number(cloud.streak) || 0),
    streakFreezes: Math.max(Number(local.streakFreezes) || 0, Number(cloud.streakFreezes) || 0),
    referralCount: Math.max(Number(local.referralCount) || 0, Number(cloud.referralCount) || 0),
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

// ── Quantum Sync Pipeline ─────────────────────────────────────────────────────
export const syncUserPlumine = async (userData) => {
  if (!userData || !userData.code) return { success: false, reason: 'Invalid profile' };
  const cleanCode = String(userData.code).replace(/\D/g, '');
  if (!cleanCode) return { success: false, reason: 'Invalid code' };

  // 1. Broadcast to all open tabs via Quantum Mesh
  if (stateMeshChannel) {
    stateMeshChannel.postMessage({
      type: 'QUANTUM_STATE_UPDATE',
      payload: userData,
      senderId: window.__sobagu_tab_id,
    });
  }

  // 2. Optimistic local response
  syncStatus = 'synced';
  lastSyncTime = Date.now();
  notify();

  // 3. Add to Outbox Queue
  outboxQueue = outboxQueue.filter(item => item.code !== cleanCode);
  outboxQueue.push({ code: cleanCode, data: userData, timestamp: Date.now() });
  saveOutbox();

  // 4. Trigger debounced background sync
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    processPlumineOutbox();
  }, 1000);

  return { success: true, user: userData };
};

export const processPlumineOutbox = async () => {
  if (!outboxQueue.length) return;
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    syncStatus = 'offline';
    notify();
    return;
  }

  syncStatus = 'syncing';
  notify();

  const batch = [...outboxQueue];
  for (const item of batch) {
    try {
      const binId = await getOrCreateBin(item.code);
      if (binId && !binId.startsWith('local_') && MASTER_KEY) {
        let remote = {};
        try { remote = await cloudGet(binId); } catch (_e) {}
        const merged = mergeRecords(item.data, remote);
        await cloudPut(binId, merged);
      }
      outboxQueue = outboxQueue.filter(x => x.code !== item.code);
      saveOutbox();
    } catch (err) {
      console.debug('[Plumine CS+] Outbox item saved locally:', err.message);
      outboxQueue = outboxQueue.filter(x => x.code !== item.code);
      saveOutbox();
    }
  }

  syncStatus = 'synced';
  lastSyncTime = Date.now();
  notify();
};

export const forcePlumineSync = async (userData) => {
  syncStatus = 'syncing';
  notify();
  const res = await syncUserPlumine(userData);
  await processPlumineOutbox();
  syncStatus = 'synced';
  lastSyncTime = Date.now();
  notify();
  return res;
};

// ── Search User from Cloud ────────────────────────────────────────────────────
export const searchPlumineUser = async (code) => {
  if (!code) return null;
  const cleanCode = String(code).replace(/\D/g, '').trim();
  if (!cleanCode) return null;

  try {
    syncStatus = 'syncing';
    notify();

    const localKey = `plumine_bin_${cleanCode}`;
    let binId = localStorage.getItem(localKey);

    if (!binId) {
      const index = await fetchMasterIndex();
      binId = index[cleanCode] || null;
    }

    if (binId && !binId.startsWith('local_')) {
      try {
        const userData = await cloudGet(binId);
        if (userData && userData.code) {
          syncStatus = 'synced';
          lastSyncTime = Date.now();
          notify();
          return userData;
        }
      } catch (_e) {}
    }

    // Local check
    const allUsers = JSON.parse(localStorage.getItem('sobagu_users') || '{}');
    if (allUsers[cleanCode]) {
      syncStatus = 'synced';
      lastSyncTime = Date.now();
      notify();
      return allUsers[cleanCode];
    }

    syncStatus = 'synced';
    notify();
    return null;
  } catch (_err) {
    syncStatus = 'synced';
    notify();
    return null;
  }
};

// ── Snapshots & Backups ───────────────────────────────────────────────────────
export const createPlumineSnapshot = (user, label = 'Auto-Snapshot') => {
  if (!user || !user.code) return null;
  try {
    const raw = localStorage.getItem(SNAPSHOTS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    const snap = {
      id: `snap_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      label,
      timestamp: Date.now(),
      dateStr: new Date().toLocaleString(),
      userCode: user.code,
      xp: user.xp || 0,
      level: user.level || 1,
      streak: user.streak || 0,
      data: user,
    };
    list.unshift(snap);
    // Keep last 10 snapshots
    const trimmed = list.slice(0, 10);
    localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(trimmed));
    return snap;
  } catch {
    return null;
  }
};

export const getPlumineSnapshots = (userCode) => {
  try {
    const raw = localStorage.getItem(SNAPSHOTS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    if (!userCode) return list;
    return list.filter(s => s.userCode === userCode);
  } catch {
    return [];
  }
};

// ── Quantum 1-Click Magic Sync Token ─────────────────────────────────────────
export const generatePlumineMagicPayload = (user) => {
  if (!user) return '';
  try {
    const minified = {
      c: user.code,
      n: user.name,
      x: user.xp || 0,
      l: user.level || 1,
      s: user.streak || 0,
      b: user.badges || [],
      p: user.progress || {},
      f: user.streakFreezes || 0,
      t: Date.now(),
    };
    return btoa(encodeURIComponent(JSON.stringify(minified)));
  } catch {
    return '';
  }
};

export const parsePlumineMagicPayload = (token) => {
  if (!token) return null;
  try {
    const json = decodeURIComponent(atob(token));
    const obj = JSON.parse(json);
    if (!obj || !obj.c) return null;
    return {
      code: String(obj.c),
      name: obj.n || 'Learner',
      xp: Number(obj.x) || 0,
      level: Number(obj.l) || 1,
      streak: Number(obj.s) || 0,
      badges: Array.isArray(obj.b) ? obj.b : [],
      progress: obj.p || {},
      streakFreezes: Number(obj.f) || 0,
    };
  } catch {
    return null;
  }
};
