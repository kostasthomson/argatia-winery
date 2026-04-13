"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import DOMPurify from "dompurify";
import { Link } from "@/i18n/navigation";
import { useNewsItem } from "@/hooks/useNews";

export default function NewsArticlePage() {
  const { id } = useParams<{ id: string }>();
  const locale = useLocale();
  const t = useTranslations("news");
  const { article, isLoading, error } = useNewsItem(id);

  // Loading state
  if (isLoading) {
    return (
      <>
        <section
          className="relative py-40 text-center text-white -mt-20 md:-mt-24"
          style={{
            background:
              "linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.45)), url('/images/vineyard.jpg') center/cover no-repeat",
          }}
        >
          <div className="container mx-auto px-6 max-w-3xl">
            <div className="h-10 bg-white/20 rounded mx-auto w-2/3 animate-pulse" />
          </div>
        </section>
        <div className="section">
          <div className="container mx-auto px-6 max-w-3xl space-y-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-6 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
          </div>
        </div>
      </>
    );
  }

  // Error / not found
  if (error || !article) {
    return (
      <>
        <section
          className="relative py-40 text-center text-white -mt-20 md:-mt-24"
          style={{
            background:
              "linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.45)), url('/images/vineyard.jpg') center/cover no-repeat",
          }}
        >
          <div className="container mx-auto px-6 max-w-3xl">
            <h1
              className="text-4xl md:text-5xl font-light tracking-widest"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {t("title")}
            </h1>
          </div>
        </section>
        <div className="section">
          <div className="container mx-auto px-6 max-w-3xl text-center py-16">
            <p className="text-4xl mb-4" aria-hidden="true">🔍</p>
            <p className="text-lg font-light text-[var(--color-text-muted)] mb-6">
              {locale === "el" ? "Το άρθρο δεν βρέθηκε." : "Article not found."}
            </p>
            <Link href="/news" className="btn btn-outline text-sm tracking-widest uppercase">
              {t("backToNews")}
            </Link>
          </div>
        </div>
      </>
    );
  }

  const title =
    locale === "el" ? article.title_el : (article.title_en ?? article.title_el);
  const content =
    locale === "el" ? article.content_el : (article.content_en ?? article.content_el);
  const imageAlt =
    locale === "el"
      ? (article.imageAlt_el ?? title)
      : (article.imageAlt_en ?? article.imageAlt_el ?? title);
  const dateFormatted = new Date(article.date).toLocaleDateString(
    locale === "el" ? "el-GR" : "en-US",
    { year: "numeric", month: "long", day: "numeric" },
  );

  // Sanitize HTML content with DOMPurify
  const sanitizedContent = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [
      "h2", "h3", "h4", "p", "br", "hr",
      "strong", "em", "u", "s", "del",
      "ul", "ol", "li",
      "blockquote", "pre", "code",
      "a", "img",
      "div", "span",
    ],
    ALLOWED_ATTR: [
      "href", "target", "rel",
      "src", "alt", "width", "height",
      "class", "style",
    ],
  });

  return (
    <>
      {/* Hero */}
      <section
        className="relative py-40 text-center text-white -mt-20 md:-mt-24"
        style={{
          background: article.imageUrl
            ? `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.45)), url('${article.imageUrl}') center/cover no-repeat`
            : "linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.45)), url('/images/vineyard.jpg') center/cover no-repeat",
        }}
      >
        <div className="container mx-auto px-6 max-w-3xl">
          <h1
            className="text-3xl md:text-5xl font-light tracking-wider"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {title}
          </h1>
          <div className="w-16 h-px bg-[var(--color-gold)] mx-auto mt-6 mb-4" aria-hidden="true" />
          <div className="flex items-center justify-center gap-4 text-sm opacity-80">
            <time dateTime={article.date}>{dateFormatted}</time>
            <span aria-hidden="true">·</span>
            <span>{article.author}</span>
          </div>
        </div>
      </section>

      {/* Article body */}
      <article className="section">
        <div className="container mx-auto px-6 max-w-3xl">
          {/* Back link */}
          <Link
            href="/news"
            className="inline-flex items-center gap-2 text-sm text-[var(--color-gold)] hover:text-[var(--color-gold-dark)] transition-colors mb-8"
          >
            <span aria-hidden="true">&larr;</span>
            {t("backToNews")}
          </Link>

          {/* Article image */}
          {article.imageUrl && (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-10">
              <Image
                src={article.imageUrl}
                alt={imageAlt}
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* HTML content rendered with DOMPurify sanitization */}
          <div
            className="prose prose-lg max-w-none prose-headings:font-light prose-headings:tracking-wide prose-a:text-[var(--color-gold)] prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-[var(--color-gold)] prose-blockquote:text-[var(--color-text-muted)] prose-img:rounded-lg prose-img:my-4 prose-hr:border-[var(--color-border)]"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />

          {/* Bottom nav */}
          <div className="mt-16 pt-8 border-t border-[var(--color-border)]">
            <Link
              href="/news"
              className="btn btn-outline text-sm tracking-widest uppercase"
            >
              {t("backToNews")}
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
