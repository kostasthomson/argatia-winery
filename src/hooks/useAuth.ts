"use client";

import { useContext } from "react";
import { AuthContext, type AuthContextValue } from "@/components/auth/auth-provider";

/**
 * Returns the current authentication state and helpers.
 *
 * Must be used inside <AuthProvider>.
 *
 * @example
 * ```tsx
 * const { user, loading, signOut } = useAuth();
 * if (loading) return <Spinner />;
 * if (!user) redirect("/admin/login");
 * ```
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
