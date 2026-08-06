import { syncUserToCloud } from './onlineLeaderboard.js';

const KEY_USERS = 'sobagu_users';
const KEY_CURRENT = 'sobagu_current_user';

export const generateUserCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const findUserByPhone = (phone) => {
  if (!phone) return null;
  const cleanPhone = phone.replace(/\D/g, '');
  const users = getAllUsers();
  return Object.values(users).find(u => u.phone === cleanPhone) || null;
};

export const createUser = (name, phone, password) => {
  const code = generateUserCode();
  const users = getAllUsers();
  const cleanPhone = (phone || '').replace(/\D/g, '');

  const user = {
    code,
    name: name.trim(),
    phone: cleanPhone,
    password: password || '',
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

export const loginUser = (codeOrPhone, password) => {
  const users = getAllUsers();
  const clean = (codeOrPhone || '').replace(/\D/g, '');
  
  // Find by 6-digit code or 10-digit phone
  let user = users[clean] || Object.values(users).find(u => u.phone === clean || u.code === clean);
  if (!user) return null;
  
  if (password && user.password && user.password !== password) {
    return { error: 'invalid_password' };
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
