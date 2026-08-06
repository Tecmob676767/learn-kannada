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
  const user = users[code];
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
  users[code] = user;
  saveAllUsers(users);
  setCurrentUser(code);
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
