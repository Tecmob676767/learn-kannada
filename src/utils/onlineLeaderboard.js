// Real-Time Global Cloud Storage API for Sobagu Kannada Learn
// Powered by JSONBin.io â€” per-user bins with master index for cross-device login.
// Each user gets their own private JSONBin. The master index maps 6-digit codes to bin IDs.

const JSONBIN_API = 'https://api.jsonbin.io/v3/b';
const MASTER_KEY = import.meta.env.VITE_JSONBIN_MASTER_KEY;
const ACCESS_KEY = import.meta.env.VITE_JSONBIN_ACCESS_KEY;
const INDEX_BIN_ID = import.meta.env.VITE_JSONBIN_INDEX_BIN_ID;

// In-memory cache
let cachedIndex = null;
let indexLastFetch = 0;
const INDEX_TTL = 10000; // 10 seconds

let cloudSyncStatus = 'idle';
let lastSyncTimestamp = Date.now();

export const getCloudStatus = () => ({
  status: cloudSyncStatus,
  lastSync: lastSyncTimestamp,
});

// â”€â”€â”€ Helper: JSONBin GET â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const jsonbinGet = async (binId) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(`${JSONBIN_API}/${binId}/latest`, {
      headers: { 'X-Master-Key': MASTER_KEY, 'X-Access-Key': ACCESS_KEY },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`GET ${binId} failed: HTTP ${res.status}`);
    const data = await res.json();
    return data.record || data;
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
};

// â”€â”€â”€ Helper: JSONBin PUT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const jsonbinPut = async (binId, body) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(`${JSONBIN_API}/${binId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'X-Master-Key': MASTER_KEY },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`PUT ${binId} failed: HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
};

// â”€â”€â”€ Helper: Create new JSONBin â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const jsonbinCreate = async (name, initialData) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(JSONBIN_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': MASTER_KEY,
        'X-Bin-Name': name,
        'X-Bin-Private': 'true',
      },
      body: JSON.stringify(initialData),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`CREATE bin failed: HTTP ${res.status}`);
    const data = await res.json();
    return data.metadata?.id || null;
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
};

// â”€â”€â”€ Fetch master index (code â†’ binId map) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const fetchIndex = async (bypassCache = false) => {
  if (!INDEX_BIN_ID) return {};
  const now = Date.now();
  if (!bypassCache && cachedIndex && now - indexLastFetch < INDEX_TTL) {
    return cachedIndex;
  }
  try {
    cloudSyncStatus = 'syncing';
    const record = await jsonbinGet(INDEX_BIN_ID);
    cachedIndex = record?.users || {};
    indexLastFetch = Date.now();
    cloudSyncStatus = 'synced';
    lastSyncTimestamp = Date.now();
    return cachedIndex;
  } catch (err) {
    console.warn('[Sobagu Cloud] Failed to fetch master index:', err.message);
    cloudSyncStatus = navigator.onLine ? 'error' : 'offline';
    return cachedIndex || {};
  }
};

// â”€â”€â”€ Update master index â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const updateIndex = async (userCode, binId) => {
  if (!INDEX_BIN_ID) return;
  try {
    const current = await fetchIndex(true);
    const updated = { ...current, [userCode]: binId };
    await jsonbinPut(INDEX_BIN_ID, { users: updated });
    cachedIndex = updated;
    indexLastFetch = Date.now();
  } catch (err) {
    console.warn('[Sobagu Cloud] Failed to update master index:', err.message);
  }
};

// â”€â”€â”€ Get or create a user's personal bin â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const getOrCreateUserBin = async (userCode) => {
  const cleanCode = String(userCode).replace(/\D/g, '');
  if (!cleanCode) return null;

  const localKey = `sobagu_bin_${cleanCode}`;
  let binId = localStorage.getItem(localKey);

  if (!binId) {
    const index = await fetchIndex(true);
    binId = index[cleanCode] || null;
  }

  if (!binId) {
    try {
      binId = await jsonbinCreate(`sobagu-user-${cleanCode}`, { code: cleanCode, version: 1 });
      if (binId) {
        localStorage.setItem(localKey, binId);
        await updateIndex(cleanCode, binId);
      }
    } catch (err) {
      console.warn('[Sobagu Cloud] Failed to create user bin:', err.message);
    }
  } else {
    localStorage.setItem(localKey, binId);
  }

  return binId;
};

// â”€â”€â”€ Lookup user in cloud by 6-digit code (cross-device login) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const searchCloudUserByCode = async (code) => {
  if (!code) return null;
  const cleanCode = String(code).replace(/\D/g, '').trim();
  if (!cleanCode) return null;
  if (!navigator.onLine) return null;

  try {
    cloudSyncStatus = 'syncing';

    const localKey = `sobagu_bin_${cleanCode}`;
    let binId = localStorage.getItem(localKey);

    if (!binId) {
      const index = await fetchIndex(true);
      binId = index[cleanCode] || null;
    }

    if (!binId) {
      cloudSyncStatus = 'idle';
      return null;
    }

    const userData = await jsonbinGet(binId);
    cloudSyncStatus = 'synced';
    lastSyncTimestamp = Date.now();

    if (userData && userData.code) {
      localStorage.setItem(localKey, binId);
      return userData;
    }
    return null;
  } catch (err) {
    console.warn('[Sobagu Cloud] User code lookup failed:', err.message);
    cloudSyncStatus = 'error';
    return null;
  }
};

// â”€â”€â”€ Sync user data to cloud â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const syncUserToCloud = async (userData) => {
  if (!userData || !userData.code) return { success: false, reason: 'Invalid user' };
  const cleanCode = String(userData.code).replace(/\D/g, '');
  if (!cleanCode) return { success: false, reason: 'Invalid code' };
  if (!navigator.onLine) return { success: false, reason: 'Offline' };

  try {
    cloudSyncStatus = 'syncing';

    const binId = await getOrCreateUserBin(cleanCode);
    if (!binId) {
      cloudSyncStatus = 'error';
      return { success: false, reason: 'Could not get bin' };
    }

    let existingRecord = {};
    try {
      existingRecord = await jsonbinGet(binId);
    } catch (_e) {
      existingRecord = {};
    }

    // Intelligent merge: always keep highest values across devices
    const localBadges = Array.isArray(userData.badges) ? userData.badges : [];
    const cloudBadges = Array.isArray(existingRecord.badges) ? existingRecord.badges : [];
    const mergedBadges = Array.from(new Set([...localBadges, ...cloudBadges]));

    const localExplored = Array.isArray(userData.exploredItems) ? userData.exploredItems : [];
    const cloudExplored = Array.isArray(existingRecord.exploredItems) ? existingRecord.exploredItems : [];
    const mergedExplored = Array.from(new Set([...localExplored, ...cloudExplored]));

    const localRoadmap = Array.isArray(userData.roadmapCompleted) ? userData.roadmapCompleted : [];
    const cloudRoadmap = Array.isArray(existingRecord.roadmapCompleted) ? existingRecord.roadmapCompleted : [];
    const mergedRoadmap = Array.from(new Set([...localRoadmap, ...cloudRoadmap]));

    const mergedProgress = {};
    ['varnamale', 'kagunita', 'vocabulary', 'grammar', 'conversations', 'literature', 'quizzes'].forEach(key => {
      mergedProgress[key] = Math.max(
        Number(userData.progress?.[key]) || 0,
        Number(existingRecord.progress?.[key]) || 0
      );
    });

    const mergedSRSCards = {
      ...(existingRecord.srsCards || {}),
      ...(userData.srsCards || {}),
    };

    const userRecord = {
      ...existingRecord,
      code: cleanCode,
      name: userData.name || existingRecord.name || 'Kannada Learner',
      googleId: userData.googleId || existingRecord.googleId || null,
      email: userData.email || existingRecord.email || null,
      xp: Math.max(Number(userData.xp) || 0, Number(existingRecord.xp) || 0),
      level: Math.max(Number(userData.level) || 1, Number(existingRecord.level) || 1),
      streak: Math.max(Number(userData.streak) || 0, Number(existingRecord.streak) || 0),
      badgesCount: mergedBadges.length,
      badges: mergedBadges,
      exploredItems: mergedExplored,
      progress: mergedProgress,
      srsCards: mergedSRSCards,
      roadmapCompleted: mergedRoadmap,
      settings: userData.settings || existingRecord.settings || { theme: 'standard' },
      lastActive: Date.now(),
      lastLogin: userData.lastLogin || new Date().toDateString(),
      banned: !!(userData.banned || existingRecord.banned),
      bannedReason: userData.bannedReason || existingRecord.bannedReason || null,
      role: userData.role || existingRecord.role || 'user',
      createdAt: userData.createdAt || existingRecord.createdAt || Date.now(),
      version: (Number(existingRecord.version) || 0) + 1,
    };

    await jsonbinPut(binId, userRecord);
    cloudSyncStatus = 'synced';
    lastSyncTimestamp = Date.now();
    return { success: true, user: userRecord };
  } catch (err) {
    console.warn('[Sobagu Cloud] Sync failed:', err.message);
    cloudSyncStatus = 'error';
    return { success: false, reason: err.message };
  }
};

// â”€â”€â”€ Force manual sync â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const forceCloudSync = async (userData) => {
  return await syncUserToCloud(userData);
};

// â”€â”€â”€ Fetch global users for leaderboard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
let cachedLeaderboard = null;
let leaderboardLastFetch = 0;
const LEADERBOARD_TTL = 30000; // 30 seconds

export const fetchGlobalUsers = async (bypassCache = false) => {
  const now = Date.now();
  if (!bypassCache && cachedLeaderboard && now - leaderboardLastFetch < LEADERBOARD_TTL) {
    return cachedLeaderboard;
  }

  try {
    const index = await fetchIndex(true);
    const entries = Object.entries(index || {});
    if (entries.length === 0) return {};

    const results = {};
    const BATCH = 10;
    for (let i = 0; i < Math.min(entries.length, 50); i += BATCH) {
      const batch = entries.slice(i, i + BATCH);
      await Promise.all(
        batch.map(async ([code, binId]) => {
          try {
            const user = await jsonbinGet(binId);
            if (user && user.code) results[code] = user;
          } catch (_e) {
            // Skip unreachable bins silently
          }
        })
      );
    }

    cachedLeaderboard = results;
    leaderboardLastFetch = Date.now();
    return results;
  } catch (err) {
    console.warn('[Sobagu Cloud] fetchGlobalUsers failed:', err.message);
    return cachedLeaderboard || {};
  }
};

// â”€â”€â”€ Remove user from cloud â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const removeUserFromCloud = async (userCode) => {
  if (!userCode) return;
  const cleanCode = String(userCode).replace(/\D/g, '');
  if (!cleanCode) return;

  try {
    const current = await fetchIndex(true);
    if (!current[cleanCode]) return;

    const updated = { ...current };
    delete updated[cleanCode];
    await jsonbinPut(INDEX_BIN_ID, { users: updated });
    cachedIndex = updated;
    localStorage.removeItem(`sobagu_bin_${cleanCode}`);
  } catch (err) {
    console.warn('[Sobagu Cloud] removeUserFromCloud failed:', err.message);
  }
};

