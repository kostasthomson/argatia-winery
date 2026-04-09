import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://argatia.gr"
  ),
  title: {
    template: "%s | Αργατία Οινοποιείο",
    default: "Αργατία Οινοποιείο | Νάουσα",
  },
  description:
    "Οινοποιείο Αργατία — βιολογικά ελληνικά κρασιά από το Ροδοχώρι Νάουσας από το 2000.",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
};

/**
 * Root layout — minimal HTML shell.
 * Locale-specific layout with Header/Footer/providers
 * is in src/app/[locale]/layout.tsx
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
