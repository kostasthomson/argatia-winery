"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useNewsList } from "@/hooks/useNews";
import NewsCard from "@/components/news/news-card";
import type { NewsItemClient } from "@/types/news";

export default function NewsGrid() {
  const t = useTranslations("news");
  const [allArticles, setAllArticles] = useState<NewsItemClient[]>([]);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);

  // Fetch the current page
  const { articles, meta, isLoading, error } = useNewsList({
    startAfter: cursor,
  });

  // Merge into accumulated list when new data arrives
  const displayArticles = cursor ? allArticles : articles;
  const showHasMore = cursor ? hasMore : (meta?.hasMore ?? false);

  function handleLoadMore() {
    if (articles.length === 0) return;
    const lastDate = articles[articles.length - 1].date;
    setAllArticles((prev) =>
      cursor ? [...prev, ...articles] : [...articles],
    );
    setHasMore(meta?.hasMore ?? false);
    setCursor(lastDate);
  }

  // Loading state: skeleton cards
  if (isLoading && !cursor) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" aria-busy="true">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card overflow-hidden" aria-label={t("loading")}>
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
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-[var(--color-text-muted)] mb-4">{t("noNews")}</p>
      </div>
    );
  }

  // Empty state
  if (displayArticles.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed border-[var(--color-border)] rounded-2xl">
        <p className="text-4xl mb-4" aria-hidden="true">📰</p>
        <p className="text-lg font-light text-[var(--color-text-muted)]">
          {t("noNews")}
        </p>
      </div>
    );
  }

  return (
    <div aria-live="polite">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayArticles.map((article) => (
          <NewsCard key={article.id} article={article} />
        ))}
      </div>

      {showHasMore && (
        <div className="text-center mt-12">
          <button
            onClick={handleLoadMore}
            disabled={isLoading}
            className="btn btn-outline text-sm tracking-widest uppercase"
          >
            {isLoading ? t("loading") : t("loadMore")}
          </button>
        </div>
      )}
    </div>
  );
}
