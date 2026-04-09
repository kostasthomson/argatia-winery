"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

/**
 * Wraps protected admin content.
 * Redirects to /admin/login if the user is not authenticated.
 * Shows nothing while the auth state is still loading (prevents flash of protected content).
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/admin/login");
    }
  }, [user, loading, router]);

  // Don't render anything while loading or if not authenticated
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f6f3]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#c69d53] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 font-light tracking-wider">Loading…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
