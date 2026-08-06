// Real-Time Online Leaderboard Service for Sobagu Kannada Learn

const CLOUD_BLOB_ID = '019fd4e1-9889-78d5-b7b6-e4fbe0bba9cc';
const API_URL = `https://jsonblob.com/api/jsonBlob/${CLOUD_BLOB_ID}`;

// In-memory cache to reduce network calls
let cachedUsers = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 5000; // 5 seconds cache

/**
 * Fetch all global users from cloud store
 */
export const fetchGlobalUsers = async () => {
  const now = Date.now();
  if (cachedUsers && (now - lastFetchTime < CACHE_TTL_MS)) {
    return cachedUsers;
  }

  try {
    const res = await fetch(API_URL, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) throw new Error('Cloud fetch failed');
    const data = await res.json();
    cachedUsers = data.users || {};
    lastFetchTime = now;
    return cachedUsers;
  } catch (err) {
    console.warn('Leaderboard cloud fetch error:', err);
    return cachedUsers || {};
  }
};

/**
 * Sync current user's score to the global cloud leaderboard
 */
export const syncUserToCloud = async (userData) => {
  if (!userData || !userData.code) return;

  try {
    // 1. Fetch current global state
    const currentGlobal = await fetchGlobalUsers();

    // 2. Prepare user record for cloud
    const userRecord = {
      code: userData.code,
      name: userData.name || 'Kannada Learner',
      xp: userData.xp || 0,
      level: userData.level || 1,
      streak: userData.streak || 0,
      badgesCount: (userData.badges || []).length,
      lastActive: Date.now(),
    };

    // 3. Update global object
    const updatedGlobal = {
      ...currentGlobal,
      [userData.code]: userRecord,
    };

    // 4. Save back to cloud
    const putRes = await fetch(API_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ users: updatedGlobal }),
    });

    if (putRes.ok) {
      cachedUsers = updatedGlobal;
      lastFetchTime = Date.now();
    }
  } catch (err) {
    console.warn('Leaderboard cloud sync error:', err);
  }
};
