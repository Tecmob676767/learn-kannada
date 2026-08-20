// Real-Time Online Leaderboard Service for Sobagu Kannada Learn
// Multi-endpoint cloud storage architecture with zero user deletion risk.

const PRIMARY_OBJECT_ID = 'ff8081819ff5b110019ff619d09500e8';
const PRIMARY_API_URL = `https://api.restful-api.dev/objects/${PRIMARY_OBJECT_ID}`;

// In-memory cache to reduce network calls
let cachedUsers = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 8000; // 8 seconds cache

/**
 * Internal raw fetch function to query the cloud endpoint.
 * Returns status indicator so callers can verify fetch success.
 */
const fetchRawGlobalData = async () => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(PRIMARY_API_URL, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const result = await res.json();
    
    // restful-api.dev returns { id: '...', name: '...', data: { users: { ... } } }
    const users = (result && result.data && typeof result.data.users === 'object' && result.data.users) 
      ? result.data.users 
      : (result && typeof result.users === 'object' && result.users ? result.users : {});
      
    return { ok: true, users };
  } catch (err) {
    console.warn('[Sobagu Leaderboard] Cloud fetch failed:', err.message || err);
    return { ok: false, users: cachedUsers || {}, error: err.message || err };
  }
};

/**
 * Fetch all global users from cloud store.
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
          xp: Number(u.xp) || 0,
          level: Number(u.level) || 1,
          streak: Number(u.streak) || 0,
          badgesCount: Array.isArray(u.badges) ? u.badges.length : 0,
          badges: Array.isArray(u.badges) ? u.badges : [],
          exploredItems: u.exploredItems || [],
          progress: u.progress || {},
          srsCards: u.srsCards || {},
          roadmapCompleted: u.roadmapCompleted || [],
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
  if (!userData || !userData.code) return;
  const cleanCode = String(userData.code).replace(/\D/g, '');
  if (!cleanCode) return;

  try {
    // 1. Fetch current global state directly (bypassing cache)
    const result = await fetchRawGlobalData();

    // SAFETY RULE 1: If fetch failed, ABORT SYNC to prevent data loss!
    if (!result.ok) {
      console.warn('[Sobagu Leaderboard] Aborting cloud sync: fetch failed to prevent user deletion.');
      return;
    }

    const currentGlobal = result.users || {};
    const localUsers = getLocalUsersMap();

    // 2. Prepare full user record
    const userRecord = {
      ...(currentGlobal[cleanCode] || {}),
      code: cleanCode,
      name: userData.name || 'Kannada Learner',
      xp: Number(userData.xp) || 0,
      level: Number(userData.level) || 1,
      streak: Number(userData.streak) || 0,
      badgesCount: Array.isArray(userData.badges) ? userData.badges.length : Number(userData.badgesCount || 0),
      badges: Array.isArray(userData.badges) ? userData.badges : (userData.badgesCount ? [] : []),
      exploredItems: userData.exploredItems || [],
      progress: userData.progress || {},
      srsCards: userData.srsCards || {},
      roadmapCompleted: userData.roadmapCompleted || [],
      lastActive: Date.now(),
      banned: !!userData.banned,
      bannedReason: userData.bannedReason || null,
      role: userData.role || 'user',
      createdAt: userData.createdAt || Date.now(),
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
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const putRes = await fetch(PRIMARY_API_URL, {
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
      cachedUsers = updatedGlobal;
      lastFetchTime = Date.now();
    }
  } catch (err) {
    console.warn('[Sobagu Leaderboard] Cloud sync failed:', err.message || err);
  }
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

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const putRes = await fetch(PRIMARY_API_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Sobagu Kannada Global Storage',
        data: { users: currentGlobal },
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (putRes.ok) {
      cachedUsers = currentGlobal;
      lastFetchTime = Date.now();
    }
  } catch (err) {
    console.warn('[Sobagu Leaderboard] Cloud user removal failed:', err.message || err);
  }
};

