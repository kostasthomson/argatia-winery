import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import Header from "@/components/header/header";
import Footer from "@/components/footer/footer";
import Main from "@/components/main/main";

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home.hero" });

  return {
    alternates: {
      canonical: `/${locale}`,
      languages: {
        el: "/el",
        en: "/en",
      },
    },
    openGraph: {
      locale: locale === "el" ? "el_GR" : "en_US",
      alternateLocale: locale === "el" ? "en_US" : "el_GR",
      siteName: "Αργατία Οινοποιείο",
      title: t("title"),
    },
  };
}

/**
 * Locale-specific layout.
 * Validates the locale param, loads messages, and wraps
 * children with NextIntlClientProvider for translations.
 * Also renders Header and Footer around all pages.
 */
export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  // Redirect to 404 for unsupported locales
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Load translation messages for this locale (server-side)
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      {/* Skip to main content for accessibility */}
      <a href="#main-content" className="skip-link">
        {locale === "el" ? "Μετάβαση στο κύριο περιεχόμενο" : "Skip to main content"}
      </a>
      <Header />
      {/* pt-20/pt-24 offsets the fixed header height on mobile/desktop */}
      <Main id="main-content" className="flex flex-col min-h-screen pt-20 md:pt-24">
        {children}
      </Main>
      <Footer />
    </NextIntlClientProvider>
  );
}
