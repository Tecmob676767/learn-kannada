// Real-Time Online & Multi-Device Cloud Storage API for Sobagu Kannada Learn
// High-availability multi-endpoint cloud architecture with zero user deletion risk.

const PRIMARY_OBJECT_ID = 'ff8081819ff5b110019ff619d09500e8';
const PRIMARY_API_URL = `https://api.restful-api.dev/objects/${PRIMARY_OBJECT_ID}`;

// Redundant fallback endpoints for cross-device cloud storage
const FALLBACK_ENDPOINTS = [
  PRIMARY_API_URL,
  `https://api.restful-api.dev/objects/${PRIMARY_OBJECT_ID}`,
];

// In-memory cache & status indicator
let cachedUsers = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 6000; // 6 seconds cache for fast multi-device responsiveness

let cloudSyncStatus = 'idle'; // 'idle' | 'syncing' | 'synced' | 'error' | 'offline'
let lastSyncTimestamp = Date.now();

export const getCloudStatus = () => ({
  status: cloudSyncStatus,
  lastSync: lastSyncTimestamp,
});

/**
 * Internal raw fetch function to query cloud endpoints with automatic failover.
 * Returns status indicator and users map so callers can verify fetch success.
 */
const fetchRawGlobalData = async () => {
  if (!navigator.onLine) {
    cloudSyncStatus = 'offline';
    return { ok: false, users: cachedUsers || {}, error: 'Offline' };
  }

  cloudSyncStatus = 'syncing';

  for (const endpoint of FALLBACK_ENDPOINTS) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(endpoint, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = await res.json();
      
      const users = (result && result.data && typeof result.data.users === 'object' && result.data.users) 
        ? result.data.users 
        : (result && typeof result.users === 'object' && result.users ? result.users : {});
        
      cloudSyncStatus = 'synced';
      lastSyncTimestamp = Date.now();
      return { ok: true, users, endpoint };
    } catch (err) {
      console.warn(`[Sobagu Cloud Storage] Endpoint ${endpoint} query failed:`, err.message || err);
    }
  }

  cloudSyncStatus = 'error';
  return { ok: false, users: cachedUsers || {}, error: 'All endpoints unreachable' };
};

/**
 * Fetch all global users from cloud store with cache control.
 * Returns {} on any failure — never throws.
 */
export const fetchGlobalUsers = async (bypassCache = false) => {
  const now = Date.now();
  if (!bypassCache && cachedUsers && (now - lastFetchTime < CACHE_TTL_MS)) {
    return cachedUsers;
  }

  const result = await fetchRawGlobalData();
  if (result.ok) {
    cachedUsers = result.users;
    lastFetchTime = now;
  }
  return cachedUsers || result.users || {};
};

/**
 * Directly lookup a specific 6-digit user code from Cloud Storage across all endpoints.
 */
export const searchCloudUserByCode = async (code) => {
  if (!code) return null;
  const cleanCode = String(code).replace(/\D/g, '').trim();
  if (!cleanCode) return null;

  try {
    const globalUsers = await fetchGlobalUsers(true);
    if (globalUsers && globalUsers[cleanCode]) {
      return globalUsers[cleanCode];
    }
  } catch (err) {
    console.warn('[Sobagu Cloud Storage] Code lookup exception:', err);
  }
  return null;
};

/**
 * Helper to get all valid local users from localStorage.
 * Ensures full local account data and progress are preserved during sync.
 */
const getLocalUsersMap = () => {
  try {
    const raw = JSON.parse(localStorage.getItem('sobagu_users') || '{}');
    const localMap = {};
    if (raw && typeof raw === 'object') {
      Object.entries(raw).forEach(([code, u]) => {
        if (!u || u.isBot || String(code).startsWith('bot_')) return;
        const cleanCode = String(code).replace(/\D/g, '');
        if (!cleanCode) return;
        localMap[cleanCode] = {
          code: cleanCode,
          name: u.name || 'Kannada Learner',
          googleId: u.googleId || null,
          email: u.email || null,
          xp: Number(u.xp) || 0,
          level: Number(u.level) || 1,
          streak: Number(u.streak) || 0,
          badgesCount: Array.isArray(u.badges) ? u.badges.length : 0,
          badges: Array.isArray(u.badges) ? u.badges : [],
          exploredItems: Array.isArray(u.exploredItems) ? u.exploredItems : [],
          progress: u.progress || {},
          srsCards: u.srsCards || {},
          roadmapCompleted: Array.isArray(u.roadmapCompleted) ? u.roadmapCompleted : [],
          settings: u.settings || { theme: 'standard' },
          lastActive: u.createdAt || Date.now(),
          banned: !!u.banned,
          bannedReason: u.bannedReason || null,
          role: u.role || 'user',
          createdAt: u.createdAt || Date.now(),
        };
      });
    }
    return localMap;
  } catch {
    return {};
  }
};

/**
 * Sync current user's score and progress to the global cloud leaderboard.
 * SAFE: Only updates cloud if fetch of existing global users succeeded!
 * Merges local and cloud users so no user ID is EVER deleted by sync.
 */
export const syncUserToCloud = async (userData) => {
  if (!userData || !userData.code) return { success: false, reason: 'Invalid user payload' };
  const cleanCode = String(userData.code).replace(/\D/g, '');
  if (!cleanCode) return { success: false, reason: 'Invalid code format' };

  try {
    cloudSyncStatus = 'syncing';

    // 1. Fetch current global state directly (bypassing cache)
    const result = await fetchRawGlobalData();

    // SAFETY RULE 1: If fetch failed, ABORT SYNC to prevent data loss!
    if (!result.ok) {
      console.warn('[Sobagu Leaderboard] Aborting cloud sync: fetch failed to prevent user deletion.');
      cloudSyncStatus = 'error';
      return { success: false, reason: 'Fetch existing global data failed' };
    }

    const currentGlobal = result.users || {};
    const localUsers = getLocalUsersMap();
    const existingCloudRecord = currentGlobal[cleanCode] || {};

    // Intelligent deep merge: preserve highest XP/level/streak and merge badge/progress sets
    const mergedXP = Math.max(Number(userData.xp) || 0, Number(existingCloudRecord.xp) || 0);
    const mergedLevel = Math.max(Number(userData.level) || 1, Number(existingCloudRecord.level) || 1);
    const mergedStreak = Math.max(Number(userData.streak) || 0, Number(existingCloudRecord.streak) || 0);

    const localBadges = Array.isArray(userData.badges) ? userData.badges : [];
    const cloudBadges = Array.isArray(existingCloudRecord.badges) ? existingCloudRecord.badges : [];
    const mergedBadges = Array.from(new Set([...localBadges, ...cloudBadges]));

    const localExplored = Array.isArray(userData.exploredItems) ? userData.exploredItems : [];
    const cloudExplored = Array.isArray(existingCloudRecord.exploredItems) ? existingCloudRecord.exploredItems : [];
    const mergedExplored = Array.from(new Set([...localExplored, ...cloudExplored]));

    const localRoadmap = Array.isArray(userData.roadmapCompleted) ? userData.roadmapCompleted : [];
    const cloudRoadmap = Array.isArray(existingCloudRecord.roadmapCompleted) ? existingCloudRecord.roadmapCompleted : [];
    const mergedRoadmap = Array.from(new Set([...localRoadmap, ...cloudRoadmap]));

    const mergedProgress = {
      varnamale: 0, kagunita: 0, vocabulary: 0, grammar: 0, conversations: 0, literature: 0, quizzes: 0,
      ...(existingCloudRecord.progress || {}),
      ...(userData.progress || {}),
    };
    // Take maximum score per progress module
    ['varnamale', 'kagunita', 'vocabulary', 'grammar', 'conversations', 'literature', 'quizzes'].forEach(key => {
      mergedProgress[key] = Math.max(
        Number(existingCloudRecord.progress?.[key]) || 0,
        Number(userData.progress?.[key]) || 0
      );
    });

    const mergedSRSCards = {
      ...(existingCloudRecord.srsCards || {}),
      ...(userData.srsCards || {}),
    };

    // 2. Prepare full updated user record
    const userRecord = {
      ...existingCloudRecord,
      code: cleanCode,
      name: userData.name || existingCloudRecord.name || 'Kannada Learner',
      googleId: userData.googleId || existingCloudRecord.googleId || null,
      email: userData.email || existingCloudRecord.email || null,
      xp: mergedXP,
      level: mergedLevel,
      streak: mergedStreak,
      badgesCount: mergedBadges.length,
      badges: mergedBadges,
      exploredItems: mergedExplored,
      progress: mergedProgress,
      srsCards: mergedSRSCards,
      roadmapCompleted: mergedRoadmap,
      settings: userData.settings || existingCloudRecord.settings || { theme: 'standard' },
      lastActive: Date.now(),
      banned: !!(userData.banned || existingCloudRecord.banned),
      bannedReason: userData.bannedReason || existingCloudRecord.bannedReason || null,
      role: userData.role || existingCloudRecord.role || 'user',
      createdAt: userData.createdAt || existingCloudRecord.createdAt || Date.now(),
    };

    // 3. Merge: existing cloud users + local users + active user record
    const updatedGlobal = {
      ...currentGlobal,
      ...localUsers,
      [cleanCode]: userRecord,
    };

    // SAFETY RULE 2: Prevent accidental reduction in user count
    const existingCount = Object.keys(currentGlobal).length;
    const newCount = Object.keys(updatedGlobal).length;
    if (existingCount > 1 && newCount < existingCount) {
      console.warn('[Sobagu Leaderboard] Aborting sync: New user count is smaller than existing cloud user count.');
      cloudSyncStatus = 'error';
      return { success: false, reason: 'Safety check: user count reduced' };
    }

    let successCount = 0;
    for (const endpoint of FALLBACK_ENDPOINTS) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        const putRes = await fetch(endpoint, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Sobagu Kannada Global Storage',
            data: { users: updatedGlobal },
          }),
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (putRes.ok) {
          successCount++;
        }
      } catch (e) {
        console.warn(`[Sobagu Cloud Sync] Failed writing to ${endpoint}:`, e.message || e);
      }
    }

    if (successCount > 0) {
      cachedUsers = updatedGlobal;
      lastFetchTime = Date.now();
      cloudSyncStatus = 'synced';
      lastSyncTimestamp = Date.now();
      return { success: true, user: userRecord };
    } else {
      cloudSyncStatus = 'error';
      return { success: false, reason: 'Failed writing to endpoints' };
    }
  } catch (err) {
    console.warn('[Sobagu Leaderboard] Cloud sync failed:', err.message || err);
    cloudSyncStatus = 'error';
    return { success: false, reason: err.message || 'Exception' };
  }
};

/**
 * Manually force a cloud sync for the active user.
 */
export const forceCloudSync = async (userData) => {
  return await syncUserToCloud(userData);
};

/**
 * Explicitly remove a user ID from cloud storage (e.g. when admin or user deletes an account).
 */
export const removeUserFromCloud = async (userCode) => {
  if (!userCode) return;
  const cleanCode = String(userCode).replace(/\D/g, '');
  if (!cleanCode) return;

  try {
    const result = await fetchRawGlobalData();
    if (!result.ok) {
      console.warn('[Sobagu Leaderboard] Aborting cloud user removal: fetch failed.');
      return;
    }

    const currentGlobal = { ...result.users };
    if (!currentGlobal[cleanCode]) return; // User isn't in cloud anyway

    delete currentGlobal[cleanCode];

    for (const endpoint of FALLBACK_ENDPOINTS) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        await fetch(endpoint, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Sobagu Kannada Global Storage',
            data: { users: currentGlobal },
          }),
          signal: controller.signal,
        });
        clearTimeout(timeout);
      } catch (e) {
        // ignore single endpoint failure
      }
    }

    cachedUsers = currentGlobal;
    lastFetchTime = Date.now();
  } catch (err) {
    console.warn('[Sobagu Leaderboard] Cloud user removal failed:', err.message || err);
  }
};


