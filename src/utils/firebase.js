// Sobagu Firebase Configuration
// Project: sobagu-75e0b
// Realtime Database: sobagu-75e0b-default-rtdb (Asia Southeast)
// Storage: sobagu-75e0b.firebasestorage.app

import { initializeApp, getApps } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyBgQMHCuWbVkOIGjSs0yIX22-ysGL8H2RU",
  authDomain: "sobagu-75e0b.firebaseapp.com",
  databaseURL: "https://sobagu-75e0b-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "sobagu-75e0b",
  storageBucket: "sobagu-75e0b.firebasestorage.app",
  messagingSenderId: "523250883328",
  appId: "1:523250883328:web:20dbf4e1571787327171e5",
  measurementId: "G-K565JXT12X",
};

// Initialize once (handles hot-reloads)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getDatabase(app);
export const storage = getStorage(app);

// Analytics — only supported in browser (not SSR / Node)
export const analyticsPromise = isSupported().then((yes) =>
  yes ? getAnalytics(app) : null
);

export default app;
