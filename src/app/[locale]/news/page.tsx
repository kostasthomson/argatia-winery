import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

interface NewsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: NewsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "news.meta" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `/${locale}/news`,
      languages: { el: "/el/news", en: "/en/news" },
    },
  };
}

/**
 * News listing page.
 * Currently shows a static shell while the Firebase/Firestore integration
 * is built in Week 4. The NewsGrid client component will replace the placeholder
 * once the news API route and SWR hooks are in place.
 */
export default function NewsPage() {
  const t = useTranslations("news");

  return (
    <>
      {/* ══════════════════════════════════════════
          PAGE HERO
      ══════════════════════════════════════════ */}
      <section
        className="relative py-40 text-center text-white"
        style={{
          background:
            "linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.45)), url('/images/vineyard.jpg') center/cover no-repeat",
        }}
        aria-label="News page hero"
      >
        <div className="container mx-auto px-6 max-w-3xl">
          <h1
            className="text-4xl md:text-6xl font-light tracking-widest"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {t("title")}
          </h1>
          <div className="w-16 h-px bg-[var(--color-gold)] mx-auto mt-6 mb-6" aria-hidden="true" />
          <p className="text-lg font-light opacity-80">{t("subtitle")}</p>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          NEWS GRID
          Placeholder skeleton — will be replaced with
          dynamic <NewsGrid> client component in Week 4
          once Firebase Firestore integration is complete.
      ══════════════════════════════════════════ */}
      <section className="section" aria-labelledby="news-list-heading">
        <div className="container mx-auto px-6 max-w-[1200px]">
          <h2 id="news-list-heading" className="sr-only">{t("title")}</h2>

          {/* Static placeholder cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" aria-live="polite">
            {Array.from({ length: 6 }).map((_, i) => (
              <article
                key={i}
                className="card overflow-hidden fade-in"
                aria-label={t("loading")}
              >
                <div className="h-48 bg-gradient-to-br from-[var(--color-background)] to-[var(--color-gold-light)]" />
                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-[var(--color-gold-medium)]" />
                    <div className="h-3 bg-gray-100 rounded w-1/3" />
                  </div>
                  <div className="h-5 bg-gray-100 rounded w-4/5" />
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-100 rounded w-full" />
                    <div className="h-3 bg-gray-100 rounded w-3/4" />
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Coming soon notice */}
          <div className="text-center mt-16 py-12 border border-dashed border-[var(--color-border)] rounded-2xl">
            <p className="text-4xl mb-4" aria-hidden="true">📰</p>
            <p className="text-lg font-light text-[var(--color-text-muted)]">
              {t("comingSoon")}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
