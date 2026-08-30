/**
 * friendsStorage.js
 * Manages the authentic friends system: add/remove friends, friend requests,
 * online status, and block list — all backed by real local user data and real cloud users.
 * 100% free of fake or simulated users.
 */

import { searchCloudUserByCode } from './onlineLeaderboard.js';

const KEY_FRIENDS   = 'sobagu_friends';       // { [myCode]: { list, sent, received, blocked } }
const KEY_ONLINE    = 'sobagu_online_status'; // { [code]: timestamp }
const ONLINE_TTL    = 45000; // 45s — heartbeat interval

// ─── Helpers ────────────────────────────────────────────────────────────────

const getDB = () => {
  try { return JSON.parse(localStorage.getItem(KEY_FRIENDS) || '{}'); }
  catch { return {}; }
};
const saveDB = (db) => localStorage.setItem(KEY_FRIENDS, JSON.stringify(db));

const getMyRecord = (myCode) => {
  if (!myCode) return { list: [], sent: [], received: [], blocked: [] };
  const db = getDB();
  if (!db[myCode]) {
    db[myCode] = { list: [], sent: [], received: [], blocked: [] };
    saveDB(db);
  }
  return db[myCode];
};

const saveMyRecord = (myCode, record) => {
  if (!myCode) return;
  const db = getDB();
  db[myCode] = record;
  saveDB(db);
};

// ─── Online / Offline Status ─────────────────────────────────────────────────

export const setOnline = (code) => {
  if (!code) return;
  try {
    const db = JSON.parse(localStorage.getItem(KEY_ONLINE) || '{}');
    db[code] = Date.now();
    localStorage.setItem(KEY_ONLINE, JSON.stringify(db));
  } catch { /* ignore */ }
};

export const isOnline = (code) => {
  if (!code) return false;
  try {
    const db = JSON.parse(localStorage.getItem(KEY_ONLINE) || '{}');
    return Date.now() - (db[code] || 0) < ONLINE_TTL;
  } catch { return false; }
};

export const startOnlineHeartbeat = (code) => {
  if (!code) return () => {};
  setOnline(code);
  const id = setInterval(() => setOnline(code), 30000);
  return () => clearInterval(id);
};

// ─── Friend List ─────────────────────────────────────────────────────────────

/** Get all friend codes for a user */
export const getFriends = (myCode) => getMyRecord(myCode).list || [];

/** Get all friend records with real name/xp from users DB */
export const getFriendsWithProfiles = (myCode) => {
  const codes = getFriends(myCode);
  try {
    const users = JSON.parse(localStorage.getItem('sobagu_users') || '{}');
    return codes.map(code => {
      const u = users[code];
      const name = u?.name || `Learner #${code}`;
      const xp = Number(u?.xp || 0);
      const level = Number(u?.level || 1);
      const streak = Number(u?.streak || 0);

      return {
        code,
        name,
        xp,
        level,
        streak,
        online: isOnline(code),
        avatar: (name || '?')[0].toUpperCase(),
      };
    });
  } catch { return []; }
};

/** Check if two users are mutual friends */
export const areMutualFriends = (codeA, codeB) => {
  return getFriends(codeA).includes(codeB) && getFriends(codeB).includes(codeA);
};

// ─── Friend Requests ─────────────────────────────────────────────────────────

/** Get pending received requests (codes who sent to me) */
export const getReceivedRequests = (myCode) => getMyRecord(myCode).received || [];

/** Get pending sent requests (codes I sent to) */
export const getSentRequests = (myCode) => getMyRecord(myCode).sent || [];

/** Send a friend request from myCode → toCode */
export const sendFriendRequest = (myCode, toCode) => {
  if (!myCode || !toCode) return { success: false, reason: 'invalid_code' };
  if (myCode === toCode) return { success: false, reason: 'cannot_self' };
  const myRec  = getMyRecord(myCode);
  const toRec  = getMyRecord(toCode);

  if (myRec.list.includes(toCode))     return { success: false, reason: 'already_friends' };
  if (myRec.blocked.includes(toCode))  return { success: false, reason: 'blocked' };
  if (toRec.blocked.includes(myCode))  return { success: false, reason: 'blocked_by' };
  if (myRec.sent.includes(toCode))     return { success: false, reason: 'already_sent' };

  // If they already sent ME a request -> auto-accept
  if (toRec.sent.includes(myCode)) {
    return acceptFriendRequest(myCode, toCode);
  }

  myRec.sent = [...new Set([...myRec.sent, toCode])];
  toRec.received = [...new Set([...toRec.received, myCode])];

  saveMyRecord(myCode, myRec);
  saveMyRecord(toCode, toRec);

  // BroadcastChannel signal for real-time update
  try {
    const ch = new BroadcastChannel('sobagu_social');
    ch.postMessage({ type: 'FRIEND_REQUEST', from: myCode, to: toCode });
    ch.close();
  } catch { /* ignore */ }

  return { success: true };
};

/** Accept a friend request: toCode's request received by myCode */
export const acceptFriendRequest = (myCode, fromCode) => {
  const myRec   = getMyRecord(myCode);
  const fromRec = getMyRecord(fromCode);

  // Add to both friend lists
  myRec.list   = [...new Set([...myRec.list, fromCode])];
  fromRec.list = [...new Set([...fromRec.list, myCode])];

  // Remove from pending
  myRec.received  = myRec.received.filter(c => c !== fromCode);
  fromRec.sent     = fromRec.sent.filter(c => c !== myCode);
  myRec.sent       = myRec.sent.filter(c => c !== fromCode);
  fromRec.received = fromRec.received.filter(c => c !== myCode);

  saveMyRecord(myCode, myRec);
  saveMyRecord(fromCode, fromRec);

  try {
    const ch = new BroadcastChannel('sobagu_social');
    ch.postMessage({ type: 'FRIEND_ACCEPTED', by: myCode, with: fromCode });
    ch.close();
  } catch { /* ignore */ }

  return { success: true };
};

/** Reject / decline a friend request */
export const rejectFriendRequest = (myCode, fromCode) => {
  const myRec   = getMyRecord(myCode);
  const fromRec = getMyRecord(fromCode);

  myRec.received  = myRec.received.filter(c => c !== fromCode);
  fromRec.sent     = fromRec.sent.filter(c => c !== myCode);

  saveMyRecord(myCode, myRec);
  saveMyRecord(fromCode, fromRec);
  return { success: true };
};

/** Cancel a sent request */
export const cancelSentRequest = (myCode, toCode) => {
  const myRec = getMyRecord(myCode);
  const toRec = getMyRecord(toCode);

  myRec.sent      = myRec.sent.filter(c => c !== toCode);
  toRec.received  = toRec.received.filter(c => c !== myCode);

  saveMyRecord(myCode, myRec);
  saveMyRecord(toCode, toRec);
  return { success: true };
};

// ─── Remove / Block ───────────────────────────────────────────────────────────

export const removeFriend = (myCode, friendCode) => {
  const myRec     = getMyRecord(myCode);
  const friendRec = getMyRecord(friendCode);

  myRec.list     = myRec.list.filter(c => c !== friendCode);
  friendRec.list = friendRec.list.filter(c => c !== myCode);

  saveMyRecord(myCode, myRec);
  saveMyRecord(friendCode, friendRec);
  return { success: true };
};

export const blockUser = (myCode, targetCode) => {
  removeFriend(myCode, targetCode);
  const myRec = getMyRecord(myCode);
  myRec.blocked = [...new Set([...myRec.blocked, targetCode])];
  myRec.sent     = myRec.sent.filter(c => c !== targetCode);
  myRec.received = myRec.received.filter(c => c !== targetCode);
  saveMyRecord(myCode, myRec);
  return { success: true };
};

export const unblockUser = (myCode, targetCode) => {
  const myRec = getMyRecord(myCode);
  myRec.blocked = myRec.blocked.filter(c => c !== targetCode);
  saveMyRecord(myCode, myRec);
  return { success: true };
};

export const getBlockedUsers = (myCode) => getMyRecord(myCode).blocked || [];

// ─── Subscribe to Social Events ───────────────────────────────────────────────

export const subscribeSocialEvents = (callback) => {
  let ch = null;
  try {
    ch = new BroadcastChannel('sobagu_social');
    ch.onmessage = (e) => callback(e.data);
  } catch { /* ignore */ }
  return () => { try { ch?.close(); } catch { /* ignore */ } };
};

// ─── Lookup real user profile by code ────────────────────────────────────────

export const getUserProfile = (code) => {
  if (!code) return null;
  try {
    const users = JSON.parse(localStorage.getItem('sobagu_users') || '{}');
    const u = users[code];
    if (u) {
      return {
        code,
        name: u.name || `Learner #${code}`,
        xp: Number(u.xp) || 0,
        level: Number(u.level) || 1,
        streak: Number(u.streak) || 0,
        badges: u.badges || [],
        online: isOnline(code),
        avatar: (u.name || '?')[0].toUpperCase(),
      };
    }
  } catch { /* ignore */ }
  return null;
};

export const searchUserByCode = async (code) => {
  const clean = (code || '').replace(/\D/g, '').slice(0, 6);
  if (clean.length !== 6) return null;

  // 1. Check local users first
  const local = getUserProfile(clean);
  if (local) return local;

  // 2. Check cloud registry
  try {
    const cloudUser = await searchCloudUserByCode(clean);
    if (cloudUser) {
      return {
        code: clean,
        name: cloudUser.name || `Learner #${clean}`,
        xp: Number(cloudUser.xp) || 0,
        level: Number(cloudUser.level) || 1,
        streak: Number(cloudUser.streak) || 0,
        badges: cloudUser.badges || [],
        online: isOnline(clean),
        avatar: (cloudUser.name || 'L')[0].toUpperCase(),
      };
    }
  } catch { /* ignore */ }

  return null;
};
