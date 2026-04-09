import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { auth } from "./firebase";

/**
 * Signs in the admin user with email and password.
 * Throws a FirebaseError on invalid credentials or network failure.
 *
 * @param email - Admin email address
 * @param password - Admin password
 * @returns The authenticated Firebase User
 */
export async function signIn(email: string, password: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

/**
 * Signs out the currently authenticated admin.
 * Safe to call even if no user is signed in.
 */
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

/**
 * Returns a promise that resolves to the current user once
 * Firebase Auth has finished restoring the session from local storage.
 * Resolves to null if no user is signed in.
 *
 * Useful for server-gated decisions during the initial page render.
 */
export function getInitialAuthState(): Promise<User | null> {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}
