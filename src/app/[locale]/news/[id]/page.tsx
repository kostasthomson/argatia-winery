import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import ArticleContent from "@/components/news/article-content";

// Always render on demand — article IDs aren't known at build time
// and Firestore can't be called without live credentials.
export const dynamic = "force-dynamic";

interface ArticlePageProps {
	params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({
	params,
}: ArticlePageProps): Promise<Metadata> {
	const { locale, id } = await params;
	try {
		const { getNewsItemById, toClientNewsItem } = await import("@/lib/news");
		const item = await getNewsItemById(id);
		if (!item || !item.published) return {};
		const article = toClientNewsItem(item);
		const title =
			locale === "el"
				? article.title_el
				: (article.title_en ?? article.title_el);
		const description =
			locale === "el"
				? (article.excerpt_el ?? undefined)
				: (article.excerpt_en ?? article.excerpt_el ?? undefined);

		return {
			title,
			description,
			openGraph: {
				title,
				description,
				images: article.imageUrl ? [article.imageUrl] : undefined,
				type: "article",
				publishedTime: article.date,
				modifiedTime: article.updatedAt,
			},
			alternates: {
				canonical: `/${locale}/news/${id}`,
				languages: { el: `/el/news/${id}`, en: `/en/news/${id}` },
			},
		};
	} catch {
		return {};
	}
}

export default async function NewsArticlePage({ params }: ArticlePageProps) {
	const { locale, id } = await params;
	const t = await getTranslations({ locale, namespace: "news" });

	let article;
	try {
		const { getNewsItemById, toClientNewsItem } = await import("@/lib/news");
		const item = await getNewsItemById(id);
		if (!item || !item.published) notFound();
		article = toClientNewsItem(item!);
	} catch {
		notFound();
	}

	const title =
		locale === "el" ? article.title_el : (article.title_en ?? article.title_el);
	const content =
		locale === "el"
			? article.content_el
			: (article.content_en ?? article.content_el);
	const imageAlt =
		locale === "el"
			? (article.imageAlt_el ?? title)
			: (article.imageAlt_en ?? article.imageAlt_el ?? title);
	const dateFormatted = new Date(article.date).toLocaleDateString(
		locale === "el" ? "el-GR" : "en-US",
		{ year: "numeric", month: "long", day: "numeric" },
	);

	const newsArticleJsonLd = {
		"@context": "https://schema.org",
		"@type": "NewsArticle",
		headline: title,
		description:
			locale === "el"
				? (article.excerpt_el ?? title)
				: (article.excerpt_en ?? article.excerpt_el ?? title),
		image: article.imageUrl ?? undefined,
		datePublished: article.date,
		dateModified: article.updatedAt ?? article.date,
		author: {
			"@type": "Person",
			name: article.author,
		},
		publisher: {
			"@type": "Organization",
			name: "Αργατία Οινοποιείο",
			logo: {
				"@type": "ImageObject",
				url: "https://argatia.gr/images/logo.png",
			},
		},
		inLanguage: locale === "el" ? "el" : "en",
		mainEntityOfPage: {
			"@type": "WebPage",
			"@id": `https://argatia.gr/${locale}/news/${article.id}`,
		},
	};

	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(newsArticleJsonLd) }}
			/>

			{/* Hero */}
			<section
				className="relative h-[480px] flex items-center justify-center text-center text-white -mt-20 md:-mt-24"
				style={{
					background: article.imageUrl
						? `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.45)), url('${article.imageUrl}') center/cover no-repeat`
						: "linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.45)), url('/images/winery.jpeg') center/cover no-repeat",
				}}
			>
				<div className="container mx-auto px-6 max-w-3xl">
					<h1
						className="text-3xl md:text-5xl font-light tracking-wider"
						style={{ fontFamily: "Georgia, serif" }}
					>
						{title}
					</h1>
					<div
						className="w-16 h-px bg-[var(--color-gold)] mx-auto mt-6 mb-4"
						aria-hidden="true"
					/>
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

					{/* HTML content — DOMPurify-sanitized client-side after hydration */}
					<ArticleContent
						html={content}
						className="prose prose-lg max-w-none prose-headings:font-light prose-headings:tracking-wide prose-a:text-[var(--color-gold)] prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-[var(--color-gold)] prose-blockquote:text-[var(--color-text-muted)] prose-img:rounded-lg prose-img:my-4 prose-hr:border-[var(--color-border)]"
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
