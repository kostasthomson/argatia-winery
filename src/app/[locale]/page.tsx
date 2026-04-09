import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import winesData from "@/data/wines.json";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  await getTranslations({ locale, namespace: "home.hero" });

  return {
    title: locale === "el" ? "Αρχική | Αργατία Οινοποιείο" : "Home | Argatia Winery",
    description:
      locale === "el"
        ? "Οινοποιείο Αργατία στο Ροδοχώρι Νάουσας — βιολογικά ελληνικά κρασιά από το 2000."
        : "Argatia Winery in Rodochori, Naoussa — organic Greek wines since 2000.",
    alternates: {
      canonical: `/${locale}`,
      languages: { el: "/el", en: "/en" },
    },
  };
}

export default function HomePage() {
  const hero = useTranslations("home.hero");
  const about = useTranslations("home.about");
  const winesT = useTranslations("home.wines");
  const newsT = useTranslations("home.news");
  const winesDetail = useTranslations("wines");
  const nav = useTranslations("nav");

  return (
    <>
      {/* ══════════════════════════════════════════
          HERO SECTION
          Full-viewport background image with fade-in headline.
          Negative margin pulls it under the fixed header.
      ══════════════════════════════════════════ */}
      <section
        id="home"
        className="relative flex items-center justify-center min-h-screen text-center text-white -mt-20 md:-mt-24"
        style={{
          background:
            "linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.35))" //, url('/images/vineyard.jpg') center/cover no-repeat",
        }}
        aria-label="Hero section"
      >
        <div className="container animate-fadeInUp px-6 max-w-3xl mx-auto">
          <p className="text-xs tracking-[0.4em] uppercase text-[var(--color-gold)] mb-4 font-light">
            Rodochori · Naoussa · Greece
          </p>
          <h1
            className="text-5xl md:text-7xl font-light tracking-widest mb-6"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {hero("title")}
          </h1>
          <div className="w-16 h-px bg-[var(--color-gold)] mx-auto mb-6" aria-hidden="true" />
          <p className="text-lg md:text-xl font-light leading-relaxed mb-10 opacity-90 max-w-2xl mx-auto">
            {hero("subtitle")}
          </p>
          <Link
            href="/about"
            className="btn btn-primary text-sm tracking-widest uppercase"
          >
            {hero("cta")}
          </Link>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-60" aria-hidden="true">
          <span className="text-xs tracking-widest uppercase text-white">Scroll</span>
          <svg width="16" height="24" viewBox="0 0 16 24" fill="none">
            <rect x="1" y="1" width="14" height="22" rx="7" stroke="white" strokeWidth="1.5"/>
            <circle cx="8" cy="8" r="2" fill="white">
              <animateTransform attributeName="transform" type="translate" values="0,0;0,8;0,0" dur="1.8s" repeatCount="indefinite"/>
            </circle>
          </svg>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          ABOUT SNAPSHOT
          Brief company introduction with a CTA to the full about page.
      ══════════════════════════════════════════ */}
      <section id="about" className="section" aria-labelledby="about-heading">
        <div className="container mx-auto px-6 max-w-[1200px]">
          <div className="max-w-3xl mx-auto text-center fade-in">
            <h2 id="about-heading" className="section-title">{about("title")}</h2>
            <p className="section-subtitle">{about("subtitle")}</p>
            <p className="text-[var(--color-dark)] leading-relaxed text-lg font-light mb-8 opacity-80">
              {about("body")}
            </p>
            <Link href="/about" className="btn btn-outline text-sm tracking-widest uppercase">
              {about("learnMore")}
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          WINES PREVIEW
          3 wine cards on an off-white background.
      ══════════════════════════════════════════ */}
      <section id="wines" className="section-alt" aria-labelledby="wines-heading">
        <div className="container mx-auto px-6 max-w-[1200px]">
          <h2 id="wines-heading" className="section-title">{winesT("title")}</h2>
          <p className="section-subtitle">{winesT("subtitle")}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-4">
            {winesData.map((wine) => {
              const nameKey = wine.id as "red" | "white" | "nevma";
              return (
                <article key={wine.id} className="card text-center group fade-in">
                  <div className="relative h-56 bg-gradient-to-b from-[var(--color-background)] to-white overflow-hidden flex items-center justify-center">
                    <Image
                      src={wine.image}
                      alt={wine[`name_el`]}
                      width={120}
                      height={200}
                      className="h-44 w-auto object-contain transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-6">
                    <p className="text-xs tracking-widest uppercase text-[var(--color-gold)] mb-2 font-light">
                      {winesDetail(`${nameKey}.type`)}
                    </p>
                    <h3 className="text-xl font-light mb-3" style={{ fontFamily: "Georgia, serif" }}>
                      {winesDetail(`${nameKey}.name`)}
                    </h3>
                    <p className="text-sm text-[var(--color-text-muted)] leading-relaxed font-light line-clamp-3">
                      {winesDetail(`${nameKey}.description`)}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Link href="/wines" className="btn btn-gold text-sm tracking-widest uppercase">
              {winesT("viewAll")}
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURED NEWS PLACEHOLDER
          When Firebase is connected, this section will render
          the 4-5 latest featured news items via SWR.
          For now it shows a static teaser section.
      ══════════════════════════════════════════ */}
      <section id="news" className="section" aria-labelledby="news-heading">
        <div className="container mx-auto px-6 max-w-[1200px]">
          <h2 id="news-heading" className="section-title">{newsT("title")}</h2>
          <p className="section-subtitle">{newsT("subtitle")}</p>

          {/* Placeholder grid — replaced with dynamic cards in Week 4 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <article key={i} className="card fade-in" aria-hidden="true">
                <div className="h-48 bg-gradient-to-br from-[var(--color-background)] to-[var(--color-gold-light)] animate-pulse" />
                <div className="p-6 space-y-3">
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/3" />
                  <div className="h-5 bg-gray-200 rounded animate-pulse w-4/5" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-full" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
                </div>
              </article>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/news" className="btn btn-outline text-sm tracking-widest uppercase">
              {newsT("viewAll")}
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          VINEYARD TEASER BANNER
          Full-width image with an overlay CTA.
      ══════════════════════════════════════════ */}
      <section
        className="relative py-32 text-center text-white"
        style={{
          background:
            "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('/images/vineyard.jpg') center/cover no-repeat fixed",
        }}
        aria-label="Vineyard CTA"
      >
        <div className="container mx-auto px-6 max-w-2xl fade-in">
          <p className="text-xs tracking-[0.4em] uppercase text-[var(--color-gold)] mb-4">
            480m · Naoussa · Macedonia
          </p>
          <h2 className="text-3xl md:text-5xl font-light tracking-wide mb-6" style={{ fontFamily: "Georgia, serif" }}>
            {nav("vineyards")}
          </h2>
          <div className="w-16 h-px bg-[var(--color-gold)] mx-auto mb-6" aria-hidden="true" />
          <Link href="/vineyards" className="btn btn-primary text-sm tracking-widest uppercase">
            {nav("vineyards")} →
          </Link>
        </div>
      </section>
    </>
  );
}
