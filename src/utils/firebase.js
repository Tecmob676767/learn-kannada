// Sobagu Firebase Configuration
// Project: sobagu-75e0b
// Database: sobagu-75e0b-default-rtdb

import { initializeApp, getApps } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDummy-replace-if-needed",
  authDomain: "sobagu-75e0b.firebaseapp.com",
  databaseURL: "https://sobagu-75e0b-default-rtdb.firebaseio.com",
  projectId: "sobagu-75e0b",
  storageBucket: "sobagu-75e0b.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:0000000000000000",
};

// Initialize once (handles hot-reloads)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getDatabase(app);
export default app;
