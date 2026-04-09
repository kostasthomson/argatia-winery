import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

/**
 * Firebase configuration loaded from environment variables.
 * All NEXT_PUBLIC_ vars are safe to expose in the browser bundle.
 * Never hardcode Firebase credentials — always use .env.local.
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * Initialize Firebase app singleton.
 * Prevents re-initialization on hot reload in development.
 */
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

/** Firebase Authentication instance */
export const auth = getAuth(app);

/** Firebase Firestore database instance */
export const db = getFirestore(app);

/** Firebase Cloud Storage instance */
export const storage = getStorage(app);

export default app;
