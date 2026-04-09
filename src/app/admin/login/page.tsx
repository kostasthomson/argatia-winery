"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { signIn } from "@/lib/auth";
import type { FirebaseError } from "firebase/app";

/**
 * Admin login page.
 * - Redirects to /admin if already authenticated.
 * - On submit, calls Firebase signInWithEmailAndPassword.
 * - Maps Firebase error codes to user-friendly messages.
 * - Rate-limited at the Firebase level (5 failed attempts → temporary lockout).
 */
export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.replace("/admin");
    }
  }, [user, loading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setError("");
    setSubmitting(true);

    try {
      await signIn(email.trim(), password);
      router.replace("/admin");
    } catch (err) {
      const code = (err as FirebaseError).code;
      setError(mapFirebaseError(code));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f6f3]">
        <div className="w-8 h-8 border-2 border-[#c69d53] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f6f3] px-4">
      <div className="w-full max-w-sm">
        {/* Logo / brand */}
        <div className="text-center mb-10">
          <p className="text-xs tracking-[0.4em] uppercase text-[#c69d53] mb-3">
            Argatia Winery
          </p>
          <h1
            className="text-3xl font-light text-[#2c2c2c]"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Σύνδεση Διαχειριστή
          </h1>
          <div className="w-10 h-px bg-[#c69d53] mx-auto mt-4" aria-hidden="true" />
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          aria-label="Admin login form"
          className="bg-white rounded-2xl shadow-lg p-8 space-y-5"
        >
          {error && (
            <div
              role="alert"
              className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="admin@argatia.gr"
              autoComplete="username"
              required
              disabled={submitting}
            />
          </div>

          <div>
            <label htmlFor="password" className="form-label">
              Κωδικός
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="••••••••"
              autoComplete="current-password"
              required
              disabled={submitting}
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !email || !password}
            className="btn btn-gold w-full text-sm tracking-widest uppercase disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Σύνδεση…" : "Σύνδεση"}
          </button>
        </form>

        <p className="text-center mt-6 text-xs text-gray-400">
          <Link href="/" className="hover:text-[#c69d53] transition-colors">
            ← Επιστροφή στον ιστότοπο
          </Link>
        </p>
      </div>
    </div>
  );
}

/** Maps Firebase Auth error codes to readable Greek messages. */
function mapFirebaseError(code: string): string {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Λανθασμένο email ή κωδικός. Δοκιμάστε ξανά.";
    case "auth/too-many-requests":
      return "Πάρα πολλές αποτυχημένες προσπάθειες. Δοκιμάστε αργότερα.";
    case "auth/network-request-failed":
      return "Πρόβλημα σύνδεσης. Ελέγξτε το internet.";
    default:
      return "Παρουσιάστηκε σφάλμα. Δοκιμάστε ξανά.";
  }
}
