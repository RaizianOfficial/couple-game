// Firebase Realtime Database & Anonymous Auth Initialization with automatic simulator fallback
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously as fbSignInAnonymously, onAuthStateChanged as fbOnAuthStateChanged } from 'firebase/auth';
import { 
  getDatabase, 
  ref as fbRef, 
  set as fbSet, 
  get as fbGet, 
  update as fbUpdate, 
  onValue as fbOnValue, 
  off as fbOff,
  onDisconnect as fbOnDisconnect, 
  runTransaction as fbRunTransaction, 
  push as fbPush, 
  remove as fbRemove, 
  serverTimestamp as fbServerTimestamp 
} from 'firebase/database';
import { mockDb, mockAuth } from './mockFirebase.js';

const env = import.meta.env;

const hasRealFirebaseConfig = Boolean(
  env.VITE_FIREBASE_API_KEY && 
  env.VITE_FIREBASE_DATABASE_URL && 
  !env.VITE_FIREBASE_API_KEY.includes('your-api-key') &&
  !env.VITE_FIREBASE_DATABASE_URL.includes('your-project-id')
);

let app = null;
let auth = null;
let database = null;
let isMock = !hasRealFirebaseConfig;

if (hasRealFirebaseConfig) {
  try {
    const firebaseConfig = {
      apiKey: env.VITE_FIREBASE_API_KEY,
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
      databaseURL: env.VITE_FIREBASE_DATABASE_URL,
      projectId: env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: env.VITE_FIREBASE_APP_ID
    };
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    database = getDatabase(app);
    console.log('[Firebase] Connected to real Firebase Realtime Database:', env.VITE_FIREBASE_DATABASE_URL);
  } catch (err) {
    console.warn('[Firebase] Config error, falling back to local multi-tab simulator:', err);
    isMock = true;
  }
} else {
  console.log('[Firebase] Using local multi-tab simulator (set VITE_FIREBASE_* in .env to connect to cloud)');
}

// Unified Auth API
export async function signIn() {
  if (isMock) {
    return mockAuth.signInAnonymously();
  }
  return fbSignInAnonymously(auth);
}

export function watchAuth(callback) {
  if (isMock) {
    return mockAuth.onAuthStateChanged(callback);
  }
  return fbOnAuthStateChanged(auth, callback);
}

export function getCurrentUser() {
  if (isMock) return mockAuth.currentUser;
  return auth?.currentUser;
}

// Unified Database API
export function dbRef(path = '') {
  if (isMock) return mockDb.ref(path);
  return fbRef(database, path);
}

export async function dbSet(reference, value) {
  if (isMock) return mockDb.set(reference, value);
  return fbSet(reference, value);
}

export async function dbGet(reference) {
  if (isMock) return mockDb.get(reference);
  return fbGet(reference);
}

export async function dbUpdate(reference, updates) {
  if (isMock) return mockDb.update(reference, updates);
  return fbUpdate(reference, updates);
}

export function dbOnValue(reference, callback) {
  if (isMock) return mockDb.onValue(reference, callback);
  return fbOnValue(reference, callback);
}

export function dbOff(reference, callback) {
  if (isMock) return mockDb.off(reference, callback);
  return fbOff(reference, callback);
}

export function dbOnDisconnect(reference) {
  if (isMock) return mockDb.onDisconnect(reference);
  return fbOnDisconnect(reference);
}

export async function dbRunTransaction(reference, updateFn) {
  if (isMock) return mockDb.runTransaction(reference, updateFn);
  return fbRunTransaction(reference, updateFn);
}

export function dbPush(reference, value) {
  if (isMock) return mockDb.push(reference, value);
  return fbPush(reference, value);
}

export async function dbRemove(reference) {
  if (isMock) return mockDb.remove(reference);
  return fbRemove(reference);
}

export function getServerTimestamp() {
  if (isMock) return Date.now();
  return fbServerTimestamp();
}

export { isMock };
