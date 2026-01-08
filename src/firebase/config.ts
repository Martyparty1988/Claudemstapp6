/**
 * MST Firebase Configuration
 * 
 * Centrální konfigurace Firebase služeb.
 * Projekt: mst-marty-solar-2025
 */

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

/**
 * Firebase konfigurace
 * Priorita: env variables > hardcoded config
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCNTmfg7r1hf1SFnJhXZSV0vejWWJB2oew",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mst-marty-solar-2025.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://mst-marty-solar-2025-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mst-marty-solar-2025",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mst-marty-solar-2025.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "706935785372",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:706935785372:web:29cc175f3148cc5de2ea59",
};

/**
 * Singleton instance
 */
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;
let storage: FirebaseStorage | null = null;

/**
 * Kontrola zda je Firebase nakonfigurován
 */
export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.authDomain
  );
}

/**
 * Inicializace Firebase
 */
export function initializeFirebase(): FirebaseApp {
  if (!isFirebaseConfigured()) {
    console.warn('[Firebase] Not configured. Set VITE_FIREBASE_* env variables.');
    throw new Error('Firebase not configured');
  }

  if (app) {
    return app;
  }

  // Použít existující app pokud existuje
  const existingApps = getApps();
  if (existingApps.length > 0) {
    app = existingApps[0];
  } else {
    app = initializeApp(firebaseConfig);
  }

  console.log('[Firebase] Initialized:', firebaseConfig.projectId);
  return app;
}

/**
 * Získat Firebase App instanci
 */
export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    return initializeFirebase();
  }
  return app;
}

/**
 * Získat Auth instanci
 */
export function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
  }
  return auth;
}

/**
 * Získat Firestore instanci
 */
export function getFirebaseFirestore(): Firestore {
  if (!firestore) {
    firestore = getFirestore(getFirebaseApp());
  }
  return firestore;
}

/**
 * Získat Storage instanci
 */
export function getFirebaseStorage(): FirebaseStorage {
  if (!storage) {
    storage = getStorage(getFirebaseApp());
  }
  return storage;
}

/**
 * Firebase status
 */
export interface FirebaseStatus {
  isConfigured: boolean;
  isInitialized: boolean;
  projectId: string | null;
}

/**
 * Získat aktuální status Firebase
 */
export function getFirebaseStatus(): FirebaseStatus {
  return {
    isConfigured: isFirebaseConfigured(),
    isInitialized: app !== null,
    projectId: firebaseConfig.projectId || null,
  };
}
