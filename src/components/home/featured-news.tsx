"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useFeaturedNews } from "@/hooks/useNews";
import NewsCard from "@/components/news/news-card";

export default function FeaturedNews() {
  const t = useTranslations("home.news");
  const { articles, isLoading } = useFeaturedNews();

  return (
    <section id="news" className="section" aria-labelledby="news-heading">
      <div className="container mx-auto px-6 max-w-[1200px]">
        <h2 id="news-heading" className="section-title">{t("title")}</h2>
        <p className="section-subtitle">{t("subtitle")}</p>

        {isLoading ? (
          /* Skeleton placeholder while loading */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card" aria-hidden="true">
                <div className="h-48 bg-gradient-to-br from-[var(--color-background)] to-[var(--color-gold-light)] animate-pulse" />
                <div className="p-6 space-y-3">
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/3" />
                  <div className="h-5 bg-gray-200 rounded animate-pulse w-4/5" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-full" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.slice(0, 3).map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <p className="text-center text-[var(--color-text-muted)] font-light py-8">
            {t("noNews")}
          </p>
        )}

        <div className="text-center mt-12">
          <Link href="/news" className="btn btn-outline text-sm tracking-widest uppercase">
            {t("viewAll")}
          </Link>
        </div>
      </div>
    </section>
  );
}
