// Real-Time Online Leaderboard Service for Sobagu Kannada Learn
// Uses JSONBlob as a simple cloud store. Falls back gracefully on any failure.

const CLOUD_BLOB_ID = '019fd4e1-9889-78d5-b7b6-e4fbe0bba9cc';
const API_URL = `https://jsonblob.com/api/jsonBlob/${CLOUD_BLOB_ID}`;

// In-memory cache to reduce network calls
let cachedUsers = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 8000; // 8 seconds cache

/**
 * Fetch all global users from cloud store.
 * Returns {} on any failure — never throws.
 */
export const fetchGlobalUsers = async () => {
  const now = Date.now();
  if (cachedUsers && (now - lastFetchTime < CACHE_TTL_MS)) {
    return cachedUsers;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000); // 6-second timeout

    const res = await fetch(API_URL, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    cachedUsers = typeof data === 'object' && data.users ? data.users : {};
    lastFetchTime = now;
    return cachedUsers;
  } catch (err) {
    console.warn('[Sobagu Leaderboard] Cloud fetch failed:', err.message || err);
    return cachedUsers || {};
  }
};

/**
 * Sync current user's score to the global cloud leaderboard.
 * Silently fails if cloud is unavailable.
 */
export const syncUserToCloud = async (userData) => {
  if (!userData || !userData.code) return;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    // 1. Fetch current global state
    const currentGlobal = await fetchGlobalUsers();

    // 2. Prepare user record (no PII — only name, scores, and opaque code)
    const userRecord = {
      code: userData.code,
      name: userData.name || 'Kannada Learner',
      xp: userData.xp || 0,
      level: userData.level || 1,
      streak: userData.streak || 0,
      badgesCount: (userData.badges || []).length,
      lastActive: Date.now(),
    };

    // 3. Merge and push
    const updatedGlobal = { ...currentGlobal, [userData.code]: userRecord };

    const putRes = await fetch(API_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ users: updatedGlobal }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (putRes.ok) {
      cachedUsers = updatedGlobal;
      lastFetchTime = Date.now();
    }
  } catch (err) {
    // Non-fatal — app works fine without cloud sync
    console.warn('[Sobagu Leaderboard] Cloud sync failed:', err.message || err);
  }
};
