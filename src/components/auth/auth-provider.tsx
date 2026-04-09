"use client";

import { createContext, useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { signOut } from "@/lib/auth";

export interface AuthContextValue {
  /** The currently authenticated user, or null if not signed in */
  user: User | null;
  /** True while Firebase is still restoring the auth session */
  loading: boolean;
  /** Signs out the current user and returns to login */
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Provides Firebase Auth state to all admin child components.
 * Wrap the admin layout with this to make `useAuth()` available.
 *
 * Subscribes to `onAuthStateChanged` so all descendants react
 * to login/logout events in real time.
 */
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
