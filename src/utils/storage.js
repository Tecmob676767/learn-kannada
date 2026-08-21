import { syncUserToCloud, removeUserFromCloud, fetchGlobalUsers, searchCloudUserByCode, getCloudStatus, forceCloudSync } from './onlineLeaderboard.js';

export { forceCloudSync, getCloudStatus, searchCloudUserByCode, syncUserToCloud };

const KEY_USERS = 'sobagu_users';
const KEY_CURRENT = 'sobagu_current_user';

export const generateUserCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const createUser = (name) => {
  const code = generateUserCode();
  const users = getAllUsers();

  const user = {
    code,
    name: name.trim(),
    xp: 0,
    level: 1,
    streak: 1,
    lastLogin: new Date().toDateString(),
    badges: [],
    exploredItems: [], // Tracks unique items explored to award XP only ONCE
    progress: {
      varnamale: 0,
      kagunita: 0,
      vocabulary: 0,
      grammar: 0,
      conversations: 0,
      literature: 0,
      quizzes: 0,
    },
    srsCards: {},
    createdAt: Date.now(),
  };
  users[code] = user;
  saveAllUsers(users);
  setCurrentUser(code);
  syncUserToCloud(user);
  return user;
};

export const loginUser = async (code) => {
  const cleanCode = (code || '').replace(/\D/g, '');
  if (!cleanCode) return null;

  let users = getAllUsers();
  let user = users[cleanCode];

  // Search Cloud Storage across endpoints to retrieve or sync latest progress
  try {
    const cloudUser = await searchCloudUserByCode(cleanCode);
    if (cloudUser) {
      if (!user) {
        // First login on this device: construct full profile from Cloud!
        user = {
          code: cleanCode,
          name: cloudUser.name || 'Kannada Learner',
          googleId: cloudUser.googleId || null,
          email: cloudUser.email || null,
          xp: Number(cloudUser.xp) || 0,
          level: Number(cloudUser.level) || 1,
          streak: Number(cloudUser.streak) || 0,
          lastLogin: new Date().toDateString(),
          badges: Array.isArray(cloudUser.badges) ? cloudUser.badges : [],
          exploredItems: Array.isArray(cloudUser.exploredItems) ? cloudUser.exploredItems : [],
          progress: cloudUser.progress || {
            varnamale: 0, kagunita: 0, vocabulary: 0, grammar: 0,
            conversations: 0, literature: 0, quizzes: 0,
          },
          srsCards: cloudUser.srsCards || {},
          roadmapCompleted: Array.isArray(cloudUser.roadmapCompleted) ? cloudUser.roadmapCompleted : [],
          settings: cloudUser.settings || { theme: 'standard' },
          role: cloudUser.role || 'user',
          banned: !!cloudUser.banned,
          bannedReason: cloudUser.bannedReason || null,
          createdAt: cloudUser.createdAt || Date.now(),
          restoredFromCloud: true,
        };
      } else {
        // Existing user on this device: merge any higher stats from Cloud (e.g. earned on another laptop/phone)
        user.xp = Math.max(user.xp || 0, Number(cloudUser.xp) || 0);
        user.level = Math.max(user.level || 1, Number(cloudUser.level) || 1);
        user.streak = Math.max(user.streak || 0, Number(cloudUser.streak) || 0);

        const localBadges = Array.isArray(user.badges) ? user.badges : [];
        const cloudBadges = Array.isArray(cloudUser.badges) ? cloudUser.badges : [];
        user.badges = Array.from(new Set([...localBadges, ...cloudBadges]));

        const localExplored = Array.isArray(user.exploredItems) ? user.exploredItems : [];
        const cloudExplored = Array.isArray(cloudUser.exploredItems) ? cloudUser.exploredItems : [];
        user.exploredItems = Array.from(new Set([...localExplored, ...cloudExplored]));

        const localRoadmap = Array.isArray(user.roadmapCompleted) ? user.roadmapCompleted : [];
        const cloudRoadmap = Array.isArray(cloudUser.roadmapCompleted) ? cloudUser.roadmapCompleted : [];
        user.roadmapCompleted = Array.from(new Set([...localRoadmap, ...cloudRoadmap]));

        const cloudProgress = cloudUser.progress || {};
        ['varnamale', 'kagunita', 'vocabulary', 'grammar', 'conversations', 'literature', 'quizzes'].forEach(key => {
          user.progress[key] = Math.max(Number(user.progress[key]) || 0, Number(cloudProgress[key]) || 0);
        });

        if (cloudUser.srsCards) {
          user.srsCards = { ...cloudUser.srsCards, ...user.srsCards };
        }
      }
    }
  } catch (err) {
    console.warn('[Sobagu Storage] Cloud login lookup failed:', err);
  }

  if (!user) return null;

  if (user.banned) {
    return { banned: true, reason: user.bannedReason || 'Account suspended by Sobagu admin.' };
  }

  // Update streak
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (user.lastLogin === yesterday) {
    user.streak = (user.streak || 0) + 1;
  } else if (user.lastLogin !== today) {
    user.streak = 1;
  }
  user.lastLogin = today;
  users[user.code] = user;
  saveAllUsers(users);
  setCurrentUser(user.code);
  syncUserToCloud(user);
  return user;
};

export const getGoogleCode = (googleSub) => {
  if (!googleSub) return generateUserCode();
  let hash = 0;
  const str = String(googleSub);
  for (let i = 0; i < str.length; i++) {
    hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0;
  }
  const positive = Math.abs(hash);
  return (100000 + (positive % 900000)).toString();
};

export const loginOrCreateGoogleUser = async (payload) => {
  if (!payload) return null;
  const googleId = payload.sub || null;
  const email = payload.email || null;
  const name = payload.name || (email ? email.split('@')[0] : 'Google Learner');

  // Deterministic 6-digit code for this Google account across devices
  const deterministicCode = getGoogleCode(googleId || email);

  // 1. Search local users
  let users = getAllUsers();
  let user = users[deterministicCode] || Object.values(users).find(u => (googleId && u.googleId === googleId) || (email && u.email === email));

  // 2. If not local, search cloud storage
  if (!user) {
    try {
      const globalUsers = await fetchGlobalUsers(true);
      if (globalUsers) {
        const cloudUser = globalUsers[deterministicCode] || Object.values(globalUsers).find(u => (googleId && u.googleId === googleId) || (email && u.email === email));
        if (cloudUser) {
          user = {
            code: cloudUser.code || deterministicCode,
            name: cloudUser.name || name,
            googleId: cloudUser.googleId || googleId,
            email: cloudUser.email || email,
            xp: Number(cloudUser.xp) || 0,
            level: Number(cloudUser.level) || 1,
            streak: Number(cloudUser.streak) || 0,
            lastLogin: new Date().toDateString(),
            badges: Array.isArray(cloudUser.badges) ? cloudUser.badges : [],
            exploredItems: cloudUser.exploredItems || [],
            progress: cloudUser.progress || {
              varnamale: 0, kagunita: 0, vocabulary: 0, grammar: 0,
              conversations: 0, literature: 0, quizzes: 0,
            },
            srsCards: cloudUser.srsCards || {},
            roadmapCompleted: cloudUser.roadmapCompleted || [],
            settings: cloudUser.settings || { theme: 'standard' },
            role: cloudUser.role || 'user',
            banned: !!cloudUser.banned,
            bannedReason: cloudUser.bannedReason || null,
            createdAt: cloudUser.createdAt || Date.now(),
          };
        }
      }
    } catch (err) {
      console.warn('[Sobagu Storage] Google cloud lookup failed:', err);
    }
  }

  // 3. Create new user profile if not existing
  if (!user) {
    user = {
      code: deterministicCode,
      name: name.trim(),
      googleId,
      email,
      xp: 0,
      level: 1,
      streak: 1,
      lastLogin: new Date().toDateString(),
      badges: [],
      exploredItems: [],
      progress: {
        varnamale: 0, kagunita: 0, vocabulary: 0, grammar: 0,
        conversations: 0, literature: 0, quizzes: 0,
      },
      srsCards: {},
      roadmapCompleted: [],
      settings: { theme: 'standard' },
      createdAt: Date.now(),
    };
  } else {
    // Fill in Google details if missing
    user.googleId = user.googleId || googleId;
    user.email = user.email || email;
    if (name && (!user.name || user.name === 'Kannada Learner')) user.name = name;
  }

  if (user.banned) {
    return { banned: true, reason: user.bannedReason || 'Account suspended by Sobagu admin.' };
  }

  // Update streak
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (user.lastLogin === yesterday) {
    user.streak = (user.streak || 0) + 1;
  } else if (user.lastLogin !== today) {
    user.streak = 1;
  }
  user.lastLogin = today;

  users[user.code] = user;
  saveAllUsers(users);
  setCurrentUser(user.code);
  syncUserToCloud(user);
  return user;
};

export const getAllUsers = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY_USERS) || '{}');
  } catch {
    return {};
  }
};

export const saveAllUsers = (users) => {
  localStorage.setItem(KEY_USERS, JSON.stringify(users));
};

export const setCurrentUser = (code) => {
  localStorage.setItem(KEY_CURRENT, code);
};

export const getCurrentUserCode = () => {
  return localStorage.getItem(KEY_CURRENT);
};

export const getCurrentUser = () => {
  const code = getCurrentUserCode();
  if (!code) return null;
  const users = getAllUsers();
  return users[code] || null;
};

export const updateUser = (updates) => {
  const code = getCurrentUserCode();
  if (!code) return;
  const users = getAllUsers();
  if (!users[code]) return;
  const updatedUser = { ...users[code], ...updates };
  users[code] = updatedUser;
  saveAllUsers(users);
  syncUserToCloud(updatedUser);
  return updatedUser;
};

export const addXP = (amount) => {
  const user = getCurrentUser();
  if (!user) return;
  const newXP = (user.xp || 0) + amount;
  const newLevel = Math.floor(newXP / 500) + 1;
  return updateUser({ xp: newXP, level: newLevel });
};

export const hasExplored = (itemId) => {
  const user = getCurrentUser();
  if (!user) return false;
  return (user.exploredItems || []).includes(itemId);
};

export const markExplored = (itemId) => {
  const user = getCurrentUser();
  if (!user) return false;
  const current = user.exploredItems || [];
  if (current.includes(itemId)) return false; // Already explored
  updateUser({ exploredItems: [...current, itemId] });
  return true; // Newly explored!
};

export const unlockBadge = (badgeId) => {
  const user = getCurrentUser();
  if (!user) return;
  if (user.badges && user.badges.includes(badgeId)) return;
  const badges = [...(user.badges || []), badgeId];
  return updateUser({ badges });
};

export const logoutUser = () => {
  localStorage.removeItem(KEY_CURRENT);
};

export const getLevelTitle = (level) => {
  if (level >= 10) return 'ಕನ್ನಡ ಕೋವಿದ';
  if (level >= 7) return 'Basavanna\'s Scholar';
  if (level >= 5) return 'Namma Local';
  if (level >= 3) return 'Kannadiga Learner';
  return 'Novice';
};

export const getXPForNextLevel = (xp) => {
  const currentLevel = Math.floor(xp / 500) + 1;
  return currentLevel * 500;
};

// ─── Activity Tracking ───────────────────────────────────────────────────────

export const logModuleVisit = (moduleId) => {
  const user = getCurrentUser();
  if (!user || !moduleId) return;
  const activity = user.activity || { visits: {}, sessions: [] };
  activity.visits = { ...activity.visits, [moduleId]: (activity.visits[moduleId] || 0) + 1 };
  activity.lastVisit = { moduleId, at: Date.now() };
  updateUser({ activity });
};

export const logSession = (moduleId, durationMs = 0, xpEarned = 0) => {
  const user = getCurrentUser();
  if (!user || !moduleId) return;
  const activity = user.activity || { visits: {}, sessions: [] };
  const sessions = [
    ...(activity.sessions || []),
    { moduleId, durationMs, xpEarned, date: new Date().toISOString() },
  ].slice(-200);
  updateUser({ activity: { ...activity, sessions } });
};

export const getActivityStats = () => {
  const user = getCurrentUser();
  if (!user) return null;
  const activity = user.activity || { visits: {}, sessions: [] };
  const weekAgo = Date.now() - 7 * 86400000;
  const weekSessions = (activity.sessions || []).filter(s => new Date(s.date).getTime() > weekAgo);

  const moduleLabels = {
    varnamale: 'Varnamale', kagunita: 'Kagunita', vocabulary: 'Vocabulary',
    wordmatch: 'Word Match', numbers: 'Numbers', typing: 'Script Trainer',
    typingtutor: 'Typing Tutor', grammar: 'Grammar', conversations: 'Conversations',
    pronunciation: 'Pronunciation', proverbs: 'Proverbs', literature: 'Literature',
    quizzes: 'Quizzes', storymode: 'Story Mode', fillblanks: 'Fill Blanks',
    songs: 'Songs', handwriting: 'Handwriting', srs: 'SRS Review',
  };

  const visitCounts = Object.entries(activity.visits || {})
    .sort((a, b) => b[1] - a[1]);
  const topModule = visitCounts[0]?.[0] || 'varnamale';

  return {
    totalXP: user.xp || 0,
    streak: user.streak || 0,
    level: user.level || 1,
    badges: (user.badges || []).length,
    progress: user.progress || {},
    visits: activity.visits || {},
    weeklySessions: weekSessions.length,
    weeklyTimeMin: Math.round(weekSessions.reduce((a, s) => a + (s.durationMs || 0), 0) / 60000),
    weeklyXP: weekSessions.reduce((a, s) => a + (s.xpEarned || 0), 0),
    topModule,
    topModuleLabel: moduleLabels[topModule] || topModule,
    dailyActivity: getDailyActivity(weekSessions),
    moduleBreakdown: visitCounts.slice(0, 8).map(([id, count]) => ({
      id, label: moduleLabels[id] || id, count,
    })),
  };
};

const getDailyActivity = (sessions) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const counts = Array(7).fill(0);
  sessions.forEach(s => {
    const d = new Date(s.date).getDay();
    counts[d]++;
  });
  return days.map((label, i) => ({ label, count: counts[i] }));
};

// ─── Spaced Repetition (SM-2 simplified) ───────────────────────────────────

export const updateSRSCard = (cardId, cardData, knowIt) => {
  const user = getCurrentUser();
  if (!user) return;
  const srsCards = { ...(user.srsCards || {}) };
  const existing = srsCards[cardId] || {
    ...cardData, id: cardId, interval: 0, ease: 2.5, repetitions: 0, nextReview: Date.now(),
  };

  if (knowIt) {
    existing.repetitions = (existing.repetitions || 0) + 1;
    existing.interval = existing.repetitions === 1 ? 1 : existing.repetitions === 2 ? 3 : Math.round(existing.interval * existing.ease);
    existing.ease = Math.min(3.0, (existing.ease || 2.5) + 0.1);
  } else {
    existing.repetitions = 0;
    existing.interval = 1;
    existing.ease = Math.max(1.3, (existing.ease || 2.5) - 0.2);
  }
  existing.nextReview = Date.now() + existing.interval * 86400000;
  srsCards[cardId] = { ...existing, ...cardData, id: cardId };
  updateUser({ srsCards });
  return srsCards[cardId];
};

export const getDueSRSCards = () => {
  const user = getCurrentUser();
  if (!user) return [];
  const now = Date.now();
  return Object.values(user.srsCards || {})
    .filter(c => (c.nextReview || 0) <= now)
    .sort((a, b) => (a.nextReview || 0) - (b.nextReview || 0));
};

export const getAllSRSCards = () => {
  const user = getCurrentUser();
  if (!user) return [];
  return Object.values(user.srsCards || {});
};

// ─── Learning Roadmap ───────────────────────────────────────────────────────

export const ROADMAP_STAGES = [
  {
    id: 'beginner',
    name: 'Beginner',
    icon: '🌱',
    color: '#43e97b',
    milestones: [
      { id: 'b1', title: 'Learn Vowels & Consonants', page: 'varnamale', prereq: null, progressKey: 'varnamale', threshold: 20 },
      { id: 'b2', title: 'Build Kagunita Syllables', page: 'kagunita', prereq: 'b1', progressKey: 'kagunita', threshold: 15 },
      { id: 'b3', title: 'Trace Your First Letters', page: 'handwriting', prereq: 'b1', progressKey: null, threshold: 0 },
      { id: 'b4', title: 'Basic Vocabulary Deck', page: 'vocabulary', prereq: 'b2', progressKey: 'vocabulary', threshold: 20 },
    ],
  },
  {
    id: 'elementary',
    name: 'Elementary',
    icon: '🌿',
    color: '#4facfe',
    milestones: [
      { id: 'e1', title: 'Numbers & Counting', page: 'numbers', prereq: 'b4', progressKey: null, threshold: 0 },
      { id: 'e2', title: 'Fill in the Blanks', page: 'fillblanks', prereq: 'b4', progressKey: null, threshold: 0 },
      { id: 'e3', title: 'Simple Stories', page: 'storymode', prereq: 'e2', progressKey: null, threshold: 0 },
      { id: 'e4', title: 'Kannada Typing Practice', page: 'typingtutor', prereq: 'b3', progressKey: null, threshold: 0 },
    ],
  },
  {
    id: 'intermediate',
    name: 'Intermediate',
    icon: '🌳',
    color: '#f093fb',
    milestones: [
      { id: 'i1', title: 'Sentence Building', page: 'grammar', prereq: 'e3', progressKey: 'grammar', threshold: 30 },
      { id: 'i2', title: 'Daily Conversations', page: 'conversations', prereq: 'e1', progressKey: 'conversations', threshold: 25 },
      { id: 'i3', title: 'Songs & Rhymes', page: 'songs', prereq: 'e3', progressKey: null, threshold: 0 },
      { id: 'i4', title: 'Quiz Drills', page: 'quizzes', prereq: 'i1', progressKey: 'quizzes', threshold: 30 },
    ],
  },
  {
    id: 'advanced',
    name: 'Advanced',
    icon: '🏆',
    color: '#ffd200',
    milestones: [
      { id: 'a1', title: 'Pronunciation Mastery', page: 'pronunciation', prereq: 'i2', progressKey: null, threshold: 0 },
      { id: 'a2', title: 'Literature & Proverbs', page: 'literature', prereq: 'i4', progressKey: 'literature', threshold: 40 },
      { id: 'a3', title: 'Spaced Repetition Review', page: 'srs', prereq: 'i4', progressKey: null, threshold: 0 },
      { id: 'a4', title: 'Progress Report & Mastery', page: 'progress', prereq: 'a2', progressKey: null, threshold: 0 },
    ],
  },
];

export const getRoadmapStatus = () => {
  const user = getCurrentUser();
  const completed = new Set(user?.roadmapCompleted || []);
  const progress = user?.progress || {};

  const isUnlocked = (m) => {
    if (!m.prereq) return true;
    return completed.has(m.prereq);
  };

  const isComplete = (m) => {
    if (completed.has(m.id)) return true;
    if (m.progressKey && (progress[m.progressKey] || 0) >= m.threshold) return true;
    return false;
  };

  return ROADMAP_STAGES.map(stage => ({
    ...stage,
    milestones: stage.milestones.map(m => ({
      ...m,
      unlocked: isUnlocked(m),
      complete: isComplete(m),
    })),
  }));
};

export const completeMilestone = (milestoneId) => {
  const user = getCurrentUser();
  if (!user) return;
  const completed = user.roadmapCompleted || [];
  if (completed.includes(milestoneId)) return;
  updateUser({ roadmapCompleted: [...completed, milestoneId] });
};

export const resetUserProgress = () => {
  const user = getCurrentUser();
  if (!user) return;
  return resetUserProgressByCode(user.code);
};

// ─── Admin & Control Center ─────────────────────────────────────────────────

export const getUserByCode = (code) => {
  const cleanCode = (code || '').replace(/\D/g, '');
  return getAllUsers()[cleanCode] || null;
};

export const updateUserByCode = (code, updates) => {
  const cleanCode = (code || '').replace(/\D/g, '');
  const users = getAllUsers();
  if (!users[cleanCode]) return null;
  const updatedUser = { ...users[cleanCode], ...updates };
  users[cleanCode] = updatedUser;
  saveAllUsers(users);
  syncUserToCloud(updatedUser);
  return updatedUser;
};

export const banUser = (code, reason = 'Banned by admin') => {
  const user = getUserByCode(code);
  if (!user || user.role === 'founder') return null;
  return updateUserByCode(code, {
    banned: true,
    bannedAt: Date.now(),
    bannedReason: reason,
  });
};

export const unbanUser = (code) =>
  updateUserByCode(code, {
    banned: false,
    bannedAt: null,
    bannedReason: null,
  });

export const promoteToAdmin = (code) => {
  const user = getUserByCode(code);
  if (!user || user.role === 'founder') return null;
  return updateUserByCode(code, { role: 'admin' });
};

export const createNewAdmin = (name, customCode = null) => {
  const cleanCode = (customCode || '').replace(/\D/g, '');
  const code = (cleanCode && cleanCode.length === 6) ? cleanCode : generateUserCode();
  const users = getAllUsers();

  const adminUser = {
    code,
    name: name.trim(),
    role: 'admin',
    xp: 1000,
    level: 5,
    streak: 1,
    lastLogin: new Date().toDateString(),
    badges: ['first_login'],
    exploredItems: [],
    progress: {
      varnamale: 50,
      kagunita: 50,
      vocabulary: 50,
      grammar: 50,
      conversations: 50,
      literature: 50,
      quizzes: 50,
    },
    srsCards: {},
    createdAt: Date.now(),
  };
  users[code] = adminUser;
  saveAllUsers(users);
  syncUserToCloud(adminUser);
  return adminUser;
};

export const demoteFromAdmin = (code) => {
  const user = getUserByCode(code);
  if (!user || user.role === 'founder') return null;
  return updateUserByCode(code, { role: 'user' });
};

export const deleteUser = (code) => {
  const cleanCode = (code || '').replace(/\D/g, '');
  const users = getAllUsers();
  const user = users[cleanCode];
  if (!user || user.role === 'founder') return false;
  delete users[cleanCode];
  saveAllUsers(users);
  removeUserFromCloud(cleanCode).catch(() => {});
  const current = getCurrentUserCode();
  if (current === cleanCode) logoutUser();
  return true;
};

export const resetUserProgressByCode = (code) => {
  const user = getUserByCode(code);
  if (!user) return null;
  return updateUserByCode(code, {
    xp: 0,
    level: 1,
    streak: 0,
    progress: {
      varnamale: 0,
      kagunita: 0,
      vocabulary: 0,
      grammar: 0,
      conversations: 0,
      literature: 0,
      quizzes: 0,
    },
    exploredItems: [],
    srsCards: {},
    roadmapCompleted: [],
    activity: { visits: {}, sessions: [] },
  });
};

export const ensureFounderAccount = () => {
  const users = getAllUsers();
  const founderCode = '000001';
  if (!users[founderCode]) {
    users[founderCode] = {
      code: founderCode,
      name: 'Sujay',
      role: 'founder',
      xp: 99999,
      level: 99,
      streak: 365,
      lastLogin: new Date().toDateString(),
      badges: ['first_login', 'streak_7', 'streak_3'],
      exploredItems: [],
      progress: {
        varnamale: 100,
        kagunita: 100,
        vocabulary: 100,
        grammar: 100,
        conversations: 100,
        literature: 100,
        quizzes: 100,
      },
      srsCards: {},
      createdAt: Date.now(),
      settings: { theme: 'gold' },
    };
    saveAllUsers(users);
    syncUserToCloud(users[founderCode]);
  } else if (users[founderCode].role !== 'founder') {
    users[founderCode].role = 'founder';
    users[founderCode].name = 'Sujay';
    saveAllUsers(users);
  }
  return users[founderCode];
};

export const getAdminStats = () => {
  const users = Object.values(getAllUsers());
  const today = new Date().toDateString();
  return {
    total: users.length,
    banned: users.filter(u => u.banned).length,
    admins: users.filter(u => u.role === 'admin' || u.role === 'founder').length,
    activeToday: users.filter(u => u.lastLogin === today).length,
    totalXP: users.reduce((sum, u) => sum + (u.xp || 0), 0),
  };
};

// ─── Bug Reports ─────────────────────────────────────────────────────────────

const BUG_REPORTS_KEY = 'sobagu_bug_reports';

export const submitBugReport = (message, category = 'general') => {
  const user = getCurrentUser();
  const reports = getBugReports();
  const report = {
    id: Date.now().toString(),
    message: message.trim(),
    category,
    userName: user?.name || 'Anonymous',
    userCode: user?.code || 'unknown',
    timestamp: new Date().toISOString(),
    read: false,
  };
  reports.unshift(report);
  // Keep last 200 reports
  const trimmed = reports.slice(0, 200);
  localStorage.setItem(BUG_REPORTS_KEY, JSON.stringify(trimmed));
  return report;
};

export const getBugReports = () => {
  try {
    return JSON.parse(localStorage.getItem(BUG_REPORTS_KEY) || '[]');
  } catch {
    return [];
  }
};

export const markBugReportRead = (id) => {
  const reports = getBugReports();
  const updated = reports.map(r => r.id === id ? { ...r, read: true } : r);
  localStorage.setItem(BUG_REPORTS_KEY, JSON.stringify(updated));
};

export const deleteBugReport = (id) => {
  const reports = getBugReports().filter(r => r.id !== id);
  localStorage.setItem(BUG_REPORTS_KEY, JSON.stringify(reports));
};

export const getUnreadBugCount = () => {
  return getBugReports().filter(r => !r.read).length;
};

// ─── Global Broadcast Announcements ──────────────────────────────────────────

const BROADCAST_KEY = 'sobagu_active_broadcast';

export const setActiveBroadcast = (message, senderName = 'Founder Sujay') => {
  if (!message || !message.trim()) return null;
  const broadcast = {
    id: Date.now().toString(),
    message: message.trim(),
    senderName,
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(BROADCAST_KEY, JSON.stringify(broadcast));
  return broadcast;
};

export const getActiveBroadcast = () => {
  try {
    const raw = localStorage.getItem(BROADCAST_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const clearActiveBroadcast = () => {
  localStorage.removeItem(BROADCAST_KEY);
};

