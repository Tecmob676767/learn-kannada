import { syncUserToCloud } from './onlineLeaderboard.js';

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
    streak: 0,
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

export const loginUser = (code) => {
  const users = getAllUsers();
  const cleanCode = (code || '').replace(/\D/g, '');
  const user = users[cleanCode];
  if (!user) return null;

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
  return updateUser({
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
    activity: { visits: {}, sessions: [] }
  });
};
