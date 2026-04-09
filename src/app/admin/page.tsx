"use client";

import { useRouter } from "next/navigation";
import AuthGuard from "@/components/auth/auth-guard";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

/**
 * Admin dashboard — protected by AuthGuard.
 * Week 4 will add news management cards with real Firestore data.
 * For now, shows a stats shell and quick-action buttons.
 */
export default function AdminPage() {
  return (
    <AuthGuard>
      <Dashboard />
    </AuthGuard>
  );
}

function Dashboard() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.replace("/admin/login");
  }

  return (
    <div className="min-h-screen bg-[#f8f6f3]">
      {/* ── Top bar ── */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs tracking-[0.3em] uppercase text-[#c69d53]">Argatia</span>
          <span className="text-gray-300 text-sm" aria-hidden="true">·</span>
          <h1 className="text-sm font-light text-gray-700">Πίνακας Ελέγχου</h1>
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

      {/* ── Content ── */}
      <main className="max-w-5xl mx-auto px-6 py-12" id="main-content">
        <div className="mb-10">
          <h2 className="text-2xl font-light text-[#2c2c2c]" style={{ fontFamily: "Georgia, serif" }}>
            Καλωσήρθατε
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Διαχειριστείτε τα νέα και το περιεχόμενο του ιστοτόπου Αργατία.
          </p>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {[
            {
              href: "/admin/news/new",
              icon: "✏️",
              title: "Νέο Άρθρο",
              desc: "Δημιουργήστε ένα νέο άρθρο νέων",
              color: "border-[#c69d53] bg-amber-50",
            },
            {
              href: "/admin/news",
              icon: "📰",
              title: "Διαχείριση Νέων",
              desc: "Δείτε, επεξεργαστείτε ή διαγράψτε άρθρα",
              color: "border-gray-200 bg-white",
            },
            {
              href: "/",
              icon: "🌐",
              title: "Προβολή Ιστοτόπου",
              desc: "Ανοίξτε τον δημόσιο ιστότοπο",
              color: "border-gray-200 bg-white",
            },
          ].map(({ href, icon, title, desc, color }) => (
            <Link
              key={href}
              href={href}
              className={`block p-6 rounded-xl border ${color} hover:shadow-md transition-shadow duration-200`}
            >
              <span className="text-2xl mb-3 block" aria-hidden="true">{icon}</span>
              <h3 className="font-medium text-[#2c2c2c] mb-1">{title}</h3>
              <p className="text-xs text-gray-400 font-light">{desc}</p>
            </Link>
          ))}
        </div>

        {/* Status notice — Firebase news coming in Week 4 */}
        <div className="rounded-xl border border-dashed border-[#c69d53] border-opacity-40 bg-amber-50 bg-opacity-30 p-8 text-center">
          <p className="text-3xl mb-3" aria-hidden="true">🔧</p>
          <h3 className="text-lg font-light text-[#2c2c2c] mb-2" style={{ fontFamily: "Georgia, serif" }}>
            News management — coming next
          </h3>
          <p className="text-sm text-gray-500 font-light">
            Firestore CRUD, image uploads, and the full news editor will be wired up in the next phase.
          </p>
        </div>
      </main>
    </div>
  );
}
