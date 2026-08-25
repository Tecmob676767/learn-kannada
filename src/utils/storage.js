import { syncUserToCloud, removeUserFromCloud, fetchGlobalUsers, searchCloudUserByCode, getCloudStatus, forceCloudSync, subscribeToSyncStatus, broadcastStateUpdate } from './onlineLeaderboard.js';
import { syncUserPlumine, forcePlumineSync, subscribeToPlumineSync, generatePlumineMagicPayload, parsePlumineMagicPayload, searchPlumineUser } from './plumineCS.js';

export {
  forceCloudSync,
  getCloudStatus,
  searchCloudUserByCode,
  syncUserToCloud,
  subscribeToSyncStatus,
  broadcastStateUpdate,
  syncUserPlumine,
  forcePlumineSync,
  subscribeToPlumineSync,
  generatePlumineMagicPayload,
  parsePlumineMagicPayload,
};

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

export const addSRSCard = (kannada, english, category = 'Custom') => {
  const cardId = `custom_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  return updateSRSCard(cardId, {
    kannada,
    english,
    category,
    source: 'Sobagu AI',
    dateAdded: Date.now(),
  }, true);
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

// ─── 32-Lesson Progressive Curriculum (Beginner to Advanced) ─────────────────

export const LESSON_PATH = [
  // ── Stage 1: Beginner 🌱 (Lessons 1 – 10) ──
  {
    id: 'l1', number: 1, stageId: 'beginner', stageName: 'Beginner', stageIcon: '🌱', stageColor: '#43e97b',
    title: 'Meet Kannada & Script', titleKn: 'ಕನ್ನಡ ಅಕ್ಷರಮಾಲೆ ಪರಿಚಯ',
    desc: 'Introduction to the Kannada script, sounds, and phonetics overview.',
    page: 'varnamale', icon: '🌱', xpReward: 50, prereq: null,
  },
  {
    id: 'l2', number: 2, stageId: 'beginner', stageName: 'Beginner', stageIcon: '🌱', stageColor: '#43e97b',
    title: 'Vowels (Swaragalu)', titleKn: 'ಸ್ವರಗಳು (ಅ – ಔ)',
    desc: 'Learn and pronounce all 16 Kannada primary vowels.',
    page: 'varnamale', icon: '🔡', xpReward: 50, prereq: 'l1',
  },
  {
    id: 'l3', number: 3, stageId: 'beginner', stageName: 'Beginner', stageIcon: '🌱', stageColor: '#43e97b',
    title: 'Consonants Group 1 (Ka to Nya)', titleKn: 'ಕ-ವರ್ಗ ವ್ಯಂಜನಗಳು',
    desc: 'Master the first 15 structured consonant letters.',
    page: 'varnamale', icon: '🔤', xpReward: 50, prereq: 'l2',
  },
  {
    id: 'l4', number: 4, stageId: 'beginner', stageName: 'Beginner', stageIcon: '🌱', stageColor: '#43e97b',
    title: 'Consonants Group 2 (Ta to Ma)', titleKn: 'ಟ-ಪ ವರ್ಗ ವ್ಯಂಜನಗಳು',
    desc: 'Learn retroflex, dental, and labial consonant groups.',
    page: 'varnamale', icon: '🔤', xpReward: 50, prereq: 'l3',
  },
  {
    id: 'l5', number: 5, stageId: 'beginner', stageName: 'Beginner', stageIcon: '🌱', stageColor: '#43e97b',
    title: 'Handwriting & Stroke Order', titleKn: 'ಅಕ್ಷರ ಅಭ್ಯಾಸ',
    desc: 'Trace letters on the canvas to build tactile muscle memory.',
    page: 'handwriting', icon: '✍️', xpReward: 50, prereq: 'l4',
  },
  {
    id: 'l6', number: 6, stageId: 'beginner', stageName: 'Beginner', stageIcon: '🌱', stageColor: '#43e97b',
    title: 'Kagunita Syllable Builder', titleKn: 'ಕಾಗುಣಿತ ರಚನೆ',
    desc: 'Combine consonants and vowel diacritics (ಮಾತ್ರೆಗಳು).',
    page: 'kagunita', icon: '📊', xpReward: 50, prereq: 'l5',
  },
  {
    id: 'l7', number: 7, stageId: 'beginner', stageName: 'Beginner', stageIcon: '🌱', stageColor: '#43e97b',
    title: '50 Essential Daily Words', titleKn: 'ಮೂಲ ಶಬ್ದಕೋಶ',
    desc: 'Family, common objects, greetings, and basic daily vocabulary.',
    page: 'vocabulary', icon: '📚', xpReward: 50, prereq: 'l6',
  },
  {
    id: 'l8', number: 8, stageId: 'beginner', stageName: 'Beginner', stageIcon: '🌱', stageColor: '#43e97b',
    title: 'Numbers & Counting (1–20)', titleKn: 'ಸಂಖ್ಯೆಗಳು (೧ - ೨೦)',
    desc: 'Learn Kannada numerals, number spellings, and basic counting.',
    page: 'numbers', icon: '🔢', xpReward: 50, prereq: 'l7',
  },
  {
    id: 'l9', number: 9, stageId: 'beginner', stageName: 'Beginner', stageIcon: '🌱', stageColor: '#43e97b',
    title: 'Word Match Challenge', titleKn: 'ಪದ ಹೊಂದಾಣಿಕೆ ಆಟ',
    desc: 'Match Kannada words with pictures and English definitions.',
    page: 'wordmatch', icon: '🎮', xpReward: 50, prereq: 'l8',
  },
  {
    id: 'l10', number: 10, stageId: 'beginner', stageName: 'Beginner', stageIcon: '🌱', stageColor: '#43e97b',
    title: 'Beginner Milestone Quiz', titleKn: 'ಪ್ರಾರಂಭಿಕ ಹಂತದ ಪರೀಕ್ಷೆ',
    desc: 'Test your script, sound, and basic word foundation before advancing.',
    page: 'quizzes', icon: '🎯', xpReward: 75, prereq: 'l9',
  },

  // ── Stage 2: Elementary 🌿 (Lessons 11 – 18) ──
  {
    id: 'l11', number: 11, stageId: 'elementary', stageName: 'Elementary', stageIcon: '🌿', stageColor: '#4facfe',
    title: 'Daily Greetings & Etiquette', titleKn: 'ದೈನಂದಿನ ನುಡಿಮುತ್ತುಗಳು',
    desc: 'Essential courtesies: Namaskara, Hegiddira, Oota Aaytha, Dhanyavada.',
    page: 'phrasebook', icon: '📱', xpReward: 50, prereq: 'l10',
  },
  {
    id: 'l12', number: 12, stageId: 'elementary', stageName: 'Elementary', stageIcon: '🌿', stageColor: '#4facfe',
    title: 'Self-Introduction & Questions', titleKn: 'ಸ್ವಯಂ ಪರಿಚಯ',
    desc: 'Introduce your name, hometown, profession, and ask where others are from.',
    page: 'conversations', icon: '🗣️', xpReward: 50, prereq: 'l11',
  },
  {
    id: 'l13', number: 13, stageId: 'elementary', stageName: 'Elementary', stageIcon: '🌿', stageColor: '#4facfe',
    title: 'Simple Sentence Builder (SOV)', titleKn: 'ಸರಳ ವಾಕ್ಯ ರಚನೆ',
    desc: 'Construct Subject-Object-Verb sentences in Kannada naturally.',
    page: 'grammar', icon: '✏️', xpReward: 50, prereq: 'l12',
  },
  {
    id: 'l14', number: 14, stageId: 'elementary', stageName: 'Elementary', stageIcon: '🌿', stageColor: '#4facfe',
    title: 'Colors, Days & Time', titleKn: 'ಬಣ್ಣಗಳು ಮತ್ತು ದಿನಗಳು',
    desc: 'Days of the week, times of day, and primary color names.',
    page: 'vocabulary', icon: '🎨', xpReward: 50, prereq: 'l13',
  },
  {
    id: 'l15', number: 15, stageId: 'elementary', stageName: 'Elementary', stageIcon: '🌿', stageColor: '#4facfe',
    title: 'Food, Dining & Market Phrases', titleKn: 'ಊಟ ಮತ್ತು ಮಾರುಕಟ್ಟೆ',
    desc: 'Order food in Darshinis, buy fruits, and bargain in markets.',
    page: 'phrasebuilder', icon: '🍲', xpReward: 50, prereq: 'l14',
  },
  {
    id: 'l16', number: 16, stageId: 'elementary', stageName: 'Elementary', stageIcon: '🌿', stageColor: '#4facfe',
    title: 'Read Your First Folk Story', titleKn: 'ಸರಳ ಜಾನಪದ ಕಥೆ',
    desc: 'Listen to and read an illustrated interactive short story.',
    page: 'storymode', icon: '📖', xpReward: 50, prereq: 'l15',
  },
  {
    id: 'l17', number: 17, stageId: 'elementary', stageName: 'Elementary', stageIcon: '🌿', stageColor: '#4facfe',
    title: 'Kannada Typing Tutor', titleKn: 'ಕನ್ನಡ ಟೈಪಿಂಗ್ ಕಲಿ',
    desc: 'Practice typing Kannada letters and words on digital keyboard.',
    page: 'typingtutor', icon: '⌨️', xpReward: 50, prereq: 'l16',
  },
  {
    id: 'l18', number: 18, stageId: 'elementary', stageName: 'Elementary', stageIcon: '🌿', stageColor: '#4facfe',
    title: 'Elementary Milestone Quiz', titleKn: 'ಪ್ರಾಥಮಿಕ ಹಂತದ ಪರೀಕ್ಷೆ',
    desc: 'Test your grasp of phrases, grammar rules, and simple stories.',
    page: 'quizzes', icon: '🎯', xpReward: 75, prereq: 'l17',
  },

  // ── Stage 3: Intermediate 🌳 (Lessons 19 – 26) ──
  {
    id: 'l19', number: 19, stageId: 'intermediate', stageName: 'Intermediate', stageIcon: '🌳', stageColor: '#f093fb',
    title: 'Tenses & Verb Conjugations', titleKn: 'ಕಾಲಗಳು ಮತ್ತು ಕ್ರಿಯಾಪದಗಳು',
    desc: 'Past, present continuous, and future tense conjugations.',
    page: 'grammarhelp', icon: '📝', xpReward: 50, prereq: 'l18',
  },
  {
    id: 'l20', number: 20, stageId: 'intermediate', stageName: 'Intermediate', stageIcon: '🌳', stageColor: '#f093fb',
    title: 'Complex Sentences & Connectors', titleKn: 'ಸಂಯುಕ್ತ ವಾಕ್ಯಗಳು',
    desc: 'Use conjunctions like ಆದರೂ, ಮತ್ತು, ಏಕೆಂದರೆ to link ideas.',
    page: 'grammar', icon: '🏗️', xpReward: 50, prereq: 'l19',
  },
  {
    id: 'l21', number: 21, stageId: 'intermediate', stageName: 'Intermediate', stageIcon: '🌳', stageColor: '#f093fb',
    title: 'Real-Life Roleplay Dialogues', titleKn: 'ನೈಜ ಸಂಭಾಷಣೆಗಳು',
    desc: 'Auto rides in Bengaluru, buying railway tickets, and polite office talk.',
    page: 'conversations', icon: '👥', xpReward: 50, prereq: 'l20',
  },
  {
    id: 'l22', number: 22, stageId: 'intermediate', stageName: 'Intermediate', stageIcon: '🌳', stageColor: '#f093fb',
    title: 'Pronunciation Studio & Accents', titleKn: 'ಸ್ಪಷ್ಟ ಉಚ್ಚಾರಣೆ',
    desc: 'Master difficult sounds: ಳ (retroflex La), ಣ, ಷ, and aspirated letters.',
    page: 'pronunciation', icon: '🔊', xpReward: 50, prereq: 'l21',
  },
  {
    id: 'l23', number: 23, stageId: 'intermediate', stageName: 'Intermediate', stageIcon: '🌳', stageColor: '#f093fb',
    title: 'Wisdom from Kannada Proverbs', titleKn: 'ಗಾದೆ ಮಾತುಗಳ ವೈಭವ',
    desc: 'Learn famous proverbs (ಗಾದೆಗಳು) and cultural humor.',
    page: 'proverbs', icon: '📜', xpReward: 50, prereq: 'l22',
  },
  {
    id: 'l24', number: 24, stageId: 'intermediate', stageName: 'Intermediate', stageIcon: '🌳', stageColor: '#f093fb',
    title: 'Traditional Songs & Rhymes', titleKn: 'ಹಾಡುಗಳು ಮತ್ತು ಕವನಗಳು',
    desc: 'Sing along with classic rhymes and Bhavageethe musical verses.',
    page: 'songs', icon: '🎵', xpReward: 50, prereq: 'l23',
  },
  {
    id: 'l25', number: 25, stageId: 'intermediate', stageName: 'Intermediate', stageIcon: '🌳', stageColor: '#f093fb',
    title: 'Spoken Voice Recognition Quiz', titleKn: 'ಧ್ವನಿ ಉಚ್ಚಾರಣೆ ಸವಾಲು',
    desc: 'Speak Kannada sentences into the microphone for real-time AI scoring.',
    page: 'voicerecog', icon: '🎙️', xpReward: 50, prereq: 'l24',
  },
  {
    id: 'l26', number: 26, stageId: 'intermediate', stageName: 'Intermediate', stageIcon: '🌳', stageColor: '#f093fb',
    title: 'Intermediate Milestone Quiz', titleKn: 'ಮಧ್ಯಮ ಹಂತದ ಪರೀಕ್ಷೆ',
    desc: 'Comprehensive evaluation of conversations, proverbs, and spoken fluency.',
    page: 'quizzes', icon: '🎯', xpReward: 100, prereq: 'l25',
  },

  // ── Stage 4: Advanced 🏆 (Lessons 27 – 32) ──
  {
    id: 'l27', number: 27, stageId: 'advanced', stageName: 'Advanced', stageIcon: '🏆', stageColor: '#ffd200',
    title: 'Vachana & Dasa Literature', titleKn: 'ವಚನ ಮತ್ತು ದಾಸ ಸಾಹಿತ್ಯ',
    desc: 'Study timeless classics from Basavanna, Akka Mahadevi, and Kanakadasa.',
    page: 'literature', icon: '🎭', xpReward: 75, prereq: 'l26',
  },
  {
    id: 'l28', number: 28, stageId: 'advanced', stageName: 'Advanced', stageIcon: '🏆', stageColor: '#ffd200',
    title: 'Karnataka Heritage & Dialects', titleKn: 'ಕರ್ನಾಟಕದ ಸಂಸ್ಕೃತಿ ಯಾತ್ರೆ',
    desc: 'Explore historical sites and regional dialects (Kundagannada, North Karnataka).',
    page: 'tour', icon: '🏯', xpReward: 75, prereq: 'l27',
  },
  {
    id: 'l29', number: 29, stageId: 'advanced', stageName: 'Advanced', stageIcon: '🏆', stageColor: '#ffd200',
    title: 'Advanced Grammar & Sandhi Rules', titleKn: 'ವ್ಯಾಕರಣ ಮತ್ತು ಸಂಧಿಗಳು',
    desc: 'Master compound words, Vibhakti Pratyaya cases, and Sandhi combinations.',
    page: 'grammarstudio', icon: '🖊️', xpReward: 75, prereq: 'l28',
  },
  {
    id: 'l30', number: 30, stageId: 'advanced', stageName: 'Advanced', stageIcon: '🏆', stageColor: '#ffd200',
    title: 'Spaced Repetition Active Recall', titleKn: 'ಸ್ಮರಣ ಪರೀಕ್ಷೆ (SRS)',
    desc: 'Reinforce challenging flashcards using the SM-2 spaced repetition engine.',
    page: 'srs', icon: '🔄', xpReward: 75, prereq: 'l29',
  },
  {
    id: 'l31', number: 31, stageId: 'advanced', stageName: 'Advanced', stageIcon: '🏆', stageColor: '#ffd200',
    title: 'Speed Typing & Writing Challenge', titleKn: 'ವೇಗ ಬರಹ ಸವಾಲು',
    desc: 'Compose paragraphs in Kannada under timed writing conditions.',
    page: 'speedtyping', icon: '⚡', xpReward: 75, prereq: 'l30',
  },
  {
    id: 'l32', number: 32, stageId: 'advanced', stageName: 'Advanced', stageIcon: '🏆', stageColor: '#ffd200',
    title: 'Grand Kannada Coveted Graduation', titleKn: 'ಕನ್ನಡ ಕೋವಿದ ಮಹಾಪರೀಕ್ಷೆ',
    desc: 'The ultimate mastery assessment to certify your Kannada proficiency.',
    page: 'culturalquiz', icon: '👑', xpReward: 150, prereq: 'l31',
  },
];

export const getLessonPathStatus = () => {
  const user = getCurrentUser();
  const completed = new Set(user?.completedLessons || []);

  const isUnlocked = (l) => {
    if (!l.prereq) return true;
    return completed.has(l.prereq);
  };

  const isComplete = (l) => {
    return completed.has(l.id);
  };

  // Group by stages
  const stages = [
    { id: 'beginner', name: 'Beginner', icon: '🌱', color: '#43e97b', badge: 'ನವಶಿಕ್ಷಕ (Novice)' },
    { id: 'elementary', name: 'Elementary', icon: '🌿', color: '#4facfe', badge: 'ಪ್ರಾಥಮಿಕ (Elementary)' },
    { id: 'intermediate', name: 'Intermediate', icon: '🌳', color: '#f093fb', badge: 'ಮಧ್ಯಮ (Intermediate)' },
    { id: 'advanced', name: 'Advanced', icon: '🏆', color: '#ffd200', badge: 'ಕನ್ನಡ ಕೋವಿದ (Master)' },
  ];

  return stages.map(stage => {
    const stageLessons = LESSON_PATH.filter(l => l.stageId === stage.id).map(l => ({
      ...l,
      unlocked: isUnlocked(l),
      complete: isComplete(l),
    }));
    return {
      ...stage,
      lessons: stageLessons,
      completedCount: stageLessons.filter(l => l.complete).length,
      totalCount: stageLessons.length,
    };
  });
};

export const completeLesson = (lessonId, customXP = null) => {
  const user = getCurrentUser();
  if (!user || !lessonId) return null;

  const completed = user.completedLessons || [];
  const lesson = LESSON_PATH.find(l => l.id === lessonId);
  const alreadyDone = completed.includes(lessonId);

  let updatedUser = user;
  if (!alreadyDone) {
    const xpToAdd = customXP !== null ? customXP : (lesson?.xpReward || 50);
    const newXP = (user.xp || 0) + xpToAdd;
    const newLevel = Math.floor(newXP / 500) + 1;
    const newCompleted = [...completed, lessonId];

    // Check if stage badges should be unlocked
    const newBadges = [...(user.badges || [])];
    if (newCompleted.length >= 1 && !newBadges.includes('first_lesson')) {
      newBadges.push('first_lesson');
    }
    if (newCompleted.length >= 10 && !newBadges.includes('beginner_graduate')) {
      newBadges.push('beginner_graduate');
    }
    if (newCompleted.length >= 18 && !newBadges.includes('elementary_graduate')) {
      newBadges.push('elementary_graduate');
    }
    if (newCompleted.length >= 26 && !newBadges.includes('intermediate_graduate')) {
      newBadges.push('intermediate_graduate');
    }
    if (newCompleted.length >= 32 && !newBadges.includes('kannada_kovid')) {
      newBadges.push('kannada_kovid');
    }

    updatedUser = updateUser({
      completedLessons: newCompleted,
      xp: newXP,
      level: newLevel,
      badges: newBadges,
    });
  }

  return { user: updatedUser, alreadyDone, xpEarned: alreadyDone ? 0 : (lesson?.xpReward || 50) };
};

export const getCurrentLesson = () => {
  const user = getCurrentUser();
  const completed = new Set(user?.completedLessons || []);
  for (const lesson of LESSON_PATH) {
    if (!completed.has(lesson.id)) {
      return lesson;
    }
  }
  return LESSON_PATH[LESSON_PATH.length - 1];
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

// ─── Streak Freeze & Happy Hour Engine ──────────────────────────────────────

export const getStreakFreezeCount = () => {
  const user = getCurrentUser();
  return Number(user?.streakFreezes) || 0;
};

export const buyStreakFreeze = () => {
  const user = getCurrentUser();
  if (!user) return { success: false, reason: 'No active user' };
  const currentXP = user.xp || 0;
  const COST = 100; // 100 XP to buy 1 Streak Freeze

  if (currentXP < COST) {
    return { success: false, reason: 'Insufficient XP (Requires 100 XP)' };
  }

  const updatedFreezes = (Number(user.streakFreezes) || 0) + 1;
  const updatedUser = updateUser({
    xp: currentXP - COST,
    streakFreezes: updatedFreezes,
  });

  return { success: true, user: updatedUser, freezes: updatedFreezes };
};

export const isDoubleXPHappyHour = () => {
  const now = new Date();
  const hours = now.getHours(); // 19 = 7 PM, 20 = 8 PM
  return hours >= 19 && hours <= 21;
};

// ─── Sobagu Cloud Backup & Restore Data Archive ─────────────────────────────

export const exportUserDataBackup = () => {
  const user = getCurrentUser();
  if (!user) return false;
  const backupData = {
    app: 'Sobagu AI Kannada',
    version: '2.5',
    exportDate: new Date().toISOString(),
    user,
  };
  const jsonStr = JSON.stringify(backupData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sobagu-learning-backup-${user.code}-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return true;
};

export const importUserDataBackup = (jsonString) => {
  try {
    const parsed = JSON.parse(jsonString);
    const incomingUser = parsed.user || parsed;
    if (!incomingUser || !incomingUser.code) {
      throw new Error('Invalid backup file format.');
    }
    const cleanCode = String(incomingUser.code).replace(/\D/g, '');
    const users = getAllUsers();
    const existing = users[cleanCode] || {};
    const merged = { ...existing, ...incomingUser, code: cleanCode };
    users[cleanCode] = merged;
    saveAllUsers(users);
    setCurrentUser(cleanCode);
    syncUserToCloud(merged);
    return { success: true, user: merged };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

// ─── Viral Referral & Promotional Growth Engine ─────────────────────────────

export const claimReferralCode = (rawCode) => {
  const user = getCurrentUser();
  if (!user) return { success: false, reason: 'No active user found' };

  const cleanCode = String(rawCode || '').replace(/\D/g, '').trim();
  if (!cleanCode || cleanCode.length !== 6) {
    return { success: false, reason: 'Please enter a valid 6-digit referral code.' };
  }

  if (cleanCode === user.code) {
    return { success: false, reason: 'You cannot use your own referral code!' };
  }

  if (user.referredBy) {
    return { success: false, reason: `You have already claimed referral code: ${user.referredBy}` };
  }

  const BONUS_NEW_USER_XP = 250;
  const BONUS_REFERRER_XP = 500;

  // Award bonus XP to current user
  const updatedUser = updateUser({
    xp: (user.xp || 0) + BONUS_NEW_USER_XP,
    referredBy: cleanCode,
  });

  // Credit Referrer
  const users = getAllUsers();
  if (users[cleanCode]) {
    const referrer = users[cleanCode];
    const refBadges = Array.isArray(referrer.badges) ? [...referrer.badges] : [];
    if (!refBadges.includes('ambassador')) refBadges.push('ambassador');

    users[cleanCode] = {
      ...referrer,
      xp: (referrer.xp || 0) + BONUS_REFERRER_XP,
      referralCount: (Number(referrer.referralCount) || 0) + 1,
      badges: refBadges,
    };
    saveAllUsers(users);
    syncUserToCloud(users[cleanCode]);
  }

  syncUserToCloud(updatedUser);
  return { success: true, user: updatedUser, bonusXP: BONUS_NEW_USER_XP };
};

// ─── Daily Mystery Lucky Chest ──────────────────────────────────────────────

export const canClaimDailyChest = () => {
  const user = getCurrentUser();
  if (!user) return false;
  const today = new Date().toDateString();
  return user.lastDailyChestClaim !== today;
};

export const claimDailyLuckyChest = () => {
  const user = getCurrentUser();
  if (!user) return { success: false, reason: 'No user logged in.' };
  const today = new Date().toDateString();

  if (user.lastDailyChestClaim === today) {
    return { success: false, reason: 'You already opened your Daily Lucky Chest today! Come back tomorrow.' };
  }

  const rand = Math.random();
  let reward = {};

  if (rand < 0.45) {
    reward = { type: 'xp', amount: 100, title: '+100 Bonus XP 🌸', desc: 'Nice! A solid knowledge boost.' };
  } else if (rand < 0.75) {
    reward = { type: 'xp', amount: 250, title: '+250 Super XP ⭐', desc: 'Great haul! You leveled up faster.' };
  } else if (rand < 0.90) {
    reward = { type: 'freeze', amount: 1, title: '+1 Streak Freeze 🛡️', desc: 'Protected your daily streak!' };
  } else {
    reward = { type: 'xp', amount: 500, title: '🔥 500 XP JACKPOT!', desc: 'Legendary luck! Unlocked Lucky Star badge.' };
  }

  const updates = {
    lastDailyChestClaim: today,
  };

  if (reward.type === 'xp') {
    updates.xp = (user.xp || 0) + reward.amount;
  } else if (reward.type === 'freeze') {
    updates.streakFreezes = (Number(user.streakFreezes) || 0) + 1;
  }

  if (reward.amount === 500 && !user.badges?.includes('lucky_star')) {
    const badges = Array.isArray(user.badges) ? [...user.badges, 'lucky_star'] : ['lucky_star'];
    updates.badges = badges;
  }

  const updatedUser = updateUser(updates);
  syncUserToCloud(updatedUser);
  syncUserPlumine(updatedUser);

  return { success: true, reward, user: updatedUser };
};

export const importMagicSyncToken = async (tokenOrUrl) => {
  if (!tokenOrUrl) return { success: false, reason: 'Empty token' };
  let token = tokenOrUrl.trim();
  if (token.includes('sync_data=')) {
    try {
      const url = new URL(token);
      token = url.searchParams.get('sync_data') || token;
    } catch {
      const m = token.match(/sync_data=([A-Za-z0-9+/=_-]+)/);
      if (m) token = m[1];
    }
  }

  const parsed = parsePlumineMagicPayload(token);
  if (!parsed || !parsed.code) {
    return { success: false, reason: 'Invalid or corrupt Magic Sync Token' };
  }

  const user = await loginUser(parsed.code);
  if (user) return { success: true, user };

  const users = getAllUsers();
  users[parsed.code] = {
    ...parsed,
    createdAt: Date.now(),
    settings: { theme: 'standard' },
  };
  saveAllUsers(users);
  setCurrentUser(parsed.code);
  syncUserToCloud(users[parsed.code]);
  syncUserPlumine(users[parsed.code]);
  return { success: true, user: users[parsed.code] };
};
