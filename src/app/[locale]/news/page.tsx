import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import NewsGrid from "@/components/news/news-grid";

// Revalidate cached page every hour; ISR keeps content fresh without on-demand rebuilds.
export const revalidate = 3600;

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

export default async function NewsPage({ params }: NewsPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "news" });

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
      ══════════════════════════════════════════ */}
      <section className="section" aria-labelledby="news-list-heading">
        <div className="container mx-auto px-6 max-w-[1200px]">
          <h2 id="news-list-heading" className="sr-only">{t("title")}</h2>
          <NewsGrid />
        </div>
      </section>
    </>
  );
}
