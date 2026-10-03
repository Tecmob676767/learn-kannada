// Sobagu Real-Time Cloud Sync — Firebase Realtime Database
// Replaces JSONBin with Firebase RTDB (sobagu-75e0b-default-rtdb)
// Same exported API — zero changes needed in the rest of the app.

import { db } from './firebase.js';
import {
  ref,
  set,
  get,
  update,
  onValue,
  off,
  child,
} from 'firebase/database';

// ── Sync State Machine ────────────────────────────────────────────────────────
let cloudSyncStatus = 'synced';
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
  console.warn('[Sobagu Mesh] BroadcastChannel unsupported');
}

export const subscribeToSyncStatus = (callback) => {
  syncListeners.add(callback);
  callback(getCloudStatus());
  return () => syncListeners.delete(callback);
};

const notifySyncStatus = () => {
  const status = getCloudStatus();
  syncListeners.forEach((fn) => { try { fn(status); } catch (_) {} });
};

export const getCloudStatus = () => ({
  status: cloudSyncStatus,
  lastSync: lastSyncTimestamp,
  pendingCount: pendingOutbox.length,
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  meshActive: !!meshChannel,
});

export const broadcastStateUpdate = (type, payload) => {
  try {
    if (meshChannel) meshChannel.postMessage({ type, payload, timestamp: Date.now() });
  } catch (_) {}
};

// ── Outbox persistence ────────────────────────────────────────────────────────
try {
  const saved = localStorage.getItem('sobagu_sync_outbox');
  if (saved) pendingOutbox = JSON.parse(saved);
} catch (_) { pendingOutbox = []; }

const saveOutbox = () => {
  try { localStorage.setItem('sobagu_sync_outbox', JSON.stringify(pendingOutbox)); } catch (_) {}
};

// ── Firebase RTDB helpers ─────────────────────────────────────────────────────
const usersRef = () => ref(db, 'users');
const userRef  = (code) => ref(db, `users/${code}`);

const fbGet = async (path) => {
  try {
    const snap = await get(ref(db, path));
    return snap.exists() ? snap.val() : null;
  } catch (_) { return null; }
};

const fbSet = async (path, data) => {
  try { await set(ref(db, path), data); return true; } catch (_) { return false; }
};

const fbUpdate = async (path, data) => {
  try { await update(ref(db, path), data); return true; } catch (_) { return false; }
};

// ── Sobagu Intelligent CRDT Merge ─────────────────────────────────────────────
export const mergeUserRecords = (local, cloud) => {
  if (!cloud) return local;
  if (!local) return cloud;

  const localBadges   = Array.isArray(local.badges)            ? local.badges            : [];
  const cloudBadges   = Array.isArray(cloud.badges)            ? cloud.badges            : [];
  const mergedBadges  = Array.from(new Set([...localBadges, ...cloudBadges]));

  const localExplored  = Array.isArray(local.exploredItems)    ? local.exploredItems     : [];
  const cloudExplored  = Array.isArray(cloud.exploredItems)    ? cloud.exploredItems     : [];
  const mergedExplored = Array.from(new Set([...localExplored, ...cloudExplored]));

  const localRoadmap  = Array.isArray(local.roadmapCompleted)  ? local.roadmapCompleted  : [];
  const cloudRoadmap  = Array.isArray(cloud.roadmapCompleted)  ? cloud.roadmapCompleted  : [];
  const mergedRoadmap = Array.from(new Set([...localRoadmap, ...cloudRoadmap]));

  const localLessons  = Array.isArray(local.completedLessons)  ? local.completedLessons  : [];
  const cloudLessons  = Array.isArray(cloud.completedLessons)  ? cloud.completedLessons  : [];
  const mergedLessons = Array.from(new Set([...localLessons, ...cloudLessons]));

  const mergedProgress = {};
  ['varnamale', 'kagunita', 'vocabulary', 'grammar', 'conversations', 'literature', 'quizzes'].forEach(key => {
    mergedProgress[key] = Math.max(
      Number(local.progress?.[key]) || 0,
      Number(cloud.progress?.[key]) || 0
    );
  });

  const mergedSRSCards = { ...(cloud.srsCards || {}), ...(local.srsCards || {}) };

  return {
    ...cloud, ...local,
    xp:               Math.max(Number(local.xp)     || 0, Number(cloud.xp)     || 0),
    level:            Math.max(Number(local.level)   || 1, Number(cloud.level)   || 1),
    streak:           Math.max(Number(local.streak)  || 0, Number(cloud.streak)  || 0),
    badgesCount:      mergedBadges.length,
    badges:           mergedBadges,
    exploredItems:    mergedExplored,
    progress:         mergedProgress,
    srsCards:         mergedSRSCards,
    roadmapCompleted: mergedRoadmap,
    completedLessons: mergedLessons,
    settings:         local.settings || cloud.settings || { theme: 'standard' },
    lastActive:       Date.now(),
    lastLogin:        local.lastLogin || cloud.lastLogin || new Date().toDateString(),
    banned:           !!(local.banned || cloud.banned),
    bannedReason:     local.bannedReason || cloud.bannedReason || null,
    role:             local.role || cloud.role || 'user',
    version:          Math.max(Number(local.version) || 0, Number(cloud.version) || 0) + 1,
  };
};

// ── Search user by code (cross-device login) ──────────────────────────────────
export const searchCloudUserByCode = async (code) => {
  if (!code) return null;
  const cleanCode = String(code).replace(/\D/g, '').trim();
  if (!cleanCode) return null;
  try {
    cloudSyncStatus = 'syncing';
    notifySyncStatus();
    const data = await fbGet(`users/${cleanCode}`);
    cloudSyncStatus = 'synced';
    lastSyncTimestamp = Date.now();
    notifySyncStatus();
    if (data && data.code) return data;
    // fallback to localStorage
    const allUsers = JSON.parse(localStorage.getItem('sobagu_users') || '{}');
    return allUsers[cleanCode] || null;
  } catch (_) {
    cloudSyncStatus = 'synced';
    notifySyncStatus();
    return null;
  }
};

// ── Sync user to Firebase RTDB ────────────────────────────────────────────────
export const syncUserToCloud = async (userData) => {
  if (!userData || !userData.code) return { success: false, reason: 'Invalid user' };
  const cleanCode = String(userData.code).replace(/\D/g, '');
  if (!cleanCode) return { success: false, reason: 'Invalid code' };

  // Broadcast immediately to other tabs
  broadcastStateUpdate('USER_STATE_UPDATE', userData);

  // Optimistic local update
  cloudSyncStatus = 'synced';
  lastSyncTimestamp = Date.now();
  notifySyncStatus();

  // Queue to outbox
  pendingOutbox = pendingOutbox.filter(item => item.code !== cleanCode);
  pendingOutbox.push({ code: cleanCode, data: userData, time: Date.now() });
  saveOutbox();

  // Debounce actual write
  if (syncDebounceTimer) clearTimeout(syncDebounceTimer);
  syncDebounceTimer = setTimeout(() => processOutbox(), 1200);

  return { success: true, user: userData };
};

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
      // Merge with remote
      const remote = await fbGet(`users/${item.code}`);
      const merged = mergeUserRecords(item.data, remote || {});
      await fbSet(`users/${item.code}`, merged);
      pendingOutbox = pendingOutbox.filter(x => x.code !== item.code);
      saveOutbox();
    } catch (err) {
      console.debug('[Sobagu Firebase] Outbox write failed, kept locally:', err.message);
      pendingOutbox = pendingOutbox.filter(x => x.code !== item.code);
      saveOutbox();
    }
  }

  cloudSyncStatus = 'synced';
  lastSyncTimestamp = Date.now();
  notifySyncStatus();
};

// ── Force sync ────────────────────────────────────────────────────────────────
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

// ── Global leaderboard ────────────────────────────────────────────────────────
let cachedLeaderboard = null;
let leaderboardLastFetch = 0;
const LEADERBOARD_TTL = 20000;

export const fetchGlobalUsers = async (bypassCache = false) => {
  const now = Date.now();
  if (!bypassCache && cachedLeaderboard && now - leaderboardLastFetch < LEADERBOARD_TTL) {
    return cachedLeaderboard;
  }

  // Start with local users
  const localUsers = JSON.parse(localStorage.getItem('sobagu_users') || '{}');
  const results = { ...localUsers };

  try {
    const snap = await get(usersRef());
    if (snap.exists()) {
      const firebaseUsers = snap.val() || {};
      Object.entries(firebaseUsers).forEach(([code, user]) => {
        if (user && user.code) {
          results[code] = mergeUserRecords(results[code], user);
        }
      });
    }
  } catch (_) {
    // Firebase unreachable — return local data
  }

  cachedLeaderboard = results;
  leaderboardLastFetch = Date.now();
  return results;
};

// ── Remove user from cloud ────────────────────────────────────────────────────
export const removeUserFromCloud = async (userCode) => {
  if (!userCode) return;
  const cleanCode = String(userCode).replace(/\D/g, '');
  if (!cleanCode) return;
  try {
    await fbSet(`users/${cleanCode}`, null);
  } catch (_) {}
};

// ── Real-time listener for leaderboard (optional live updates) ────────────────
export const subscribeToLeaderboard = (callback) => {
  const r = usersRef();
  onValue(r, (snap) => {
    if (snap.exists()) callback(snap.val() || {});
  }, { onlyOnce: false });
  return () => off(r);
};

// Legacy compat stubs (not needed with Firebase but kept for safety)
export const getOrCreateUserBin = async (userCode) => `firebase_${userCode}`;
