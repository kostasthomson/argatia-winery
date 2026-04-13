"use client";

import Image from "next/image";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { NewsItemClient } from "@/types/news";

interface NewsCardProps {
  article: NewsItemClient;
}

export default function NewsCard({ article }: NewsCardProps) {
  const locale = useLocale();

  const title =
    locale === "el"
      ? article.title_el
      : (article.title_en ?? article.title_el);
  const excerpt =
    locale === "el"
      ? (article.excerpt_el ?? "")
      : (article.excerpt_en ?? article.excerpt_el ?? "");
  const imageAlt =
    locale === "el"
      ? (article.imageAlt_el ?? title)
      : (article.imageAlt_en ?? article.imageAlt_el ?? title);

  const dateFormatted = new Date(article.date).toLocaleDateString(
    locale === "el" ? "el-GR" : "en-US",
    { year: "numeric", month: "long", day: "numeric" },
  );

  return (
    <article className="card overflow-hidden group">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        {article.imageUrl ? (
          <Image
            src={article.imageUrl}
            alt={imageAlt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full bg-gradient-to-br from-[var(--color-background)] to-[var(--color-gold-light)]" />
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <time
          dateTime={article.date}
          className="text-xs tracking-wider uppercase text-[var(--color-gold)]"
        >
          {dateFormatted}
        </time>

        <h3
          className="text-xl font-light mt-2 mb-3 text-[var(--color-dark)] line-clamp-2"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {title}
        </h3>

        {excerpt && (
          <p className="text-sm text-[var(--color-text-muted)] font-light line-clamp-3">
            {excerpt}
          </p>
        )}

        <Link
          href={`/news/${article.id}`}
          className="inline-flex items-center gap-1 mt-4 text-sm tracking-wider text-[var(--color-gold)] hover:text-[var(--color-gold-dark)] transition-colors"
        >
          {locale === "el" ? "Διαβάστε περισσότερα" : "Read more"}
          <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>
    </article>
  );
}
