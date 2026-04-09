import type { Metadata } from "next";
import AuthProvider from "@/components/auth/auth-provider";

// Admin pages are always server-rendered on demand (never statically generated)
// because they require live Firebase Auth state and real credentials.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    template: "%s | Admin — Argatia",
    default: "Admin — Argatia Winery",
  },
  // Prevent search engines from indexing admin pages
  robots: { index: false, follow: false },
};

/**
 * Admin area layout.
 * Isolated from the public locale layout — no Header/Footer, no i18n provider.
 * AuthProvider makes useAuth() available to all admin child components.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
