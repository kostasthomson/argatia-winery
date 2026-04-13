"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface AdminHeaderProps {
  title: string;
}

export default function AdminHeader({ title }: AdminHeaderProps) {
  const { user, signOut } = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.replace("/admin/login");
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-xs tracking-[0.3em] uppercase text-[#c69d53]">Argatia</span>
        <span className="text-gray-300 text-sm" aria-hidden="true">·</span>
        <h1 className="text-sm font-light text-gray-700">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xs text-gray-400 hidden sm:block">{user?.email}</span>
        <button
          onClick={handleSignOut}
          className="text-xs tracking-wider text-gray-500 hover:text-[#c69d53] transition-colors px-3 py-1.5 border border-gray-200 rounded-lg"
        >
          Αποσύνδεση
        </button>
      </div>
    </header>
  );
}
