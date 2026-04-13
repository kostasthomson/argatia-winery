import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

interface AboutPageProps {
	params: Promise<{ locale: string }>;
}

export async function generateMetadata({
	params,
}: AboutPageProps): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "about.meta" });
	return {
		title: t("title"),
		description: t("description"),
		alternates: {
			canonical: `/${locale}/about`,
			languages: { el: "/el/about", en: "/en/about" },
		},
	};
}

/**
 * About page — company history, Argatia heritage meaning, philosophy pillars, and team bios.
 * All content is served from next-intl translations (messages/el.json, messages/en.json).
 */
export default function AboutPage() {
	const t = useTranslations("about");
	const team = useTranslations("about.team");

	const founders = [
		{
			key: "panagiotis",
			role: team("panagiotis.role"),
			name: team("panagiotis.name"),
			bio: team("panagiotis.bio"),
		},
		{
			key: "charoula",
			role: team("charoula.role"),
			name: team("charoula.name"),
			bio: team("charoula.bio"),
		},
	];

	const secondGen = [
		{
			key: "christoforos",
			role: team("christoforos.role"),
			name: team("christoforos.name"),
			bio: team("christoforos.bio"),
		},
		{
			key: "konstantinos",
			role: team("konstantinos.role"),
			name: team("konstantinos.name"),
			bio: team("konstantinos.bio"),
		},
	];

	const philosophyPillars = [
		{ icon: "🌿", titleKey: "organic", textKey: "organicText" },
		{ icon: "🍇", titleKey: "greek", textKey: "greekText" },
		{ icon: "🏔️", titleKey: "terroir", textKey: "terroirText" },
	] as const;

	return (
		<>
			{/* ══════════════════════════════════════════
          PAGE HERO
      ══════════════════════════════════════════ */}
			<section
				className="relative py-40 text-center text-white"
				style={{
					background:
						"linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.45)), url('/images/winery.jpeg') center/cover no-repeat",
				}}
				aria-label="About page hero"
			>
				<div className="container mx-auto px-6 max-w-3xl">
					<p className="text-xs tracking-[0.4em] uppercase text-[var(--color-gold)] mb-4">
						Est. 2000
					</p>
					<h1
						className="text-4xl md:text-6xl font-light tracking-widest"
						style={{ fontFamily: "Georgia, serif" }}
					>
						{t("title")}
					</h1>
					<div
						className="w-16 h-px bg-[var(--color-gold)] mx-auto mt-6"
						aria-hidden="true"
					/>
				</div>
			</section>

			{/* ══════════════════════════════════════════
          HISTORY
      ══════════════════════════════════════════ */}
			<section className="section" aria-labelledby="history-heading">
				<div className="container mx-auto px-6 max-w-[1200px]">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
						<div className="fade-in">
							<h2
								id="history-heading"
								className="text-3xl font-light mb-8"
								style={{ fontFamily: "Georgia, serif" }}
							>
								{t("history.title")}
							</h2>
							<div className="space-y-5 text-[var(--color-dark)] font-light leading-relaxed opacity-80">
								<p>{t("history.founding")}</p>
								<p>{t("history.vineyards")}</p>
								<p>{t("history.tourism")}</p>
								<p>{t("history.secondGen")}</p>
							</div>
						</div>
						{/* Timeline visual */}
						<div className="fade-in space-y-6" aria-label="Timeline">
							{[
								{
									year: "2000",
									label: t("history.founding").substring(0, 60) + "…",
								},
								{
									year: "2008",
									label: t("history.vineyards").substring(0, 60) + "…",
								},
								{
									year: "2025",
									label: t("history.secondGen").substring(0, 60) + "…",
								},
							].map(({ year, label }) => (
								<div key={year} className="flex gap-6 items-start">
									<div className="flex-shrink-0 w-16 text-right">
										<span
											className="text-2xl font-light text-[var(--color-gold)]"
											style={{ fontFamily: "Georgia, serif" }}
										>
											{year}
										</span>
									</div>
									<div className="flex-shrink-0 flex flex-col items-center pt-2">
										<div className="w-3 h-3 rounded-full bg-[var(--color-gold)]" />
										<div
											className="w-px flex-1 bg-[var(--color-border)] mt-2"
											style={{ minHeight: "40px" }}
										/>
									</div>
									<p className="text-sm text-[var(--color-text-muted)] font-light leading-relaxed pt-1">
										{label}
									</p>
								</div>
							))}
						</div>
					</div>
				</div>
			</section>

			{/* ══════════════════════════════════════════
          ARGATIA HERITAGE
      ══════════════════════════════════════════ */}
			<section className="section-alt" aria-labelledby="argatia-heading">
				<div className="container mx-auto px-6 max-w-[1200px]">
					<div className="max-w-3xl mx-auto text-center fade-in">
						<h2 id="argatia-heading" className="section-title">
							{t("argatia.title")}
						</h2>
						<div
							className="w-16 h-px bg-[var(--color-gold)] mx-auto mb-8"
							aria-hidden="true"
						/>
						<blockquote className="text-lg font-light leading-relaxed text-[var(--color-dark)] opacity-80 italic border-l-2 border-[var(--color-gold)] pl-6 text-left">
							{t("argatia.text")}
						</blockquote>
					</div>
				</div>
			</section>

			{/* ══════════════════════════════════════════
          PHILOSOPHY PILLARS
      ══════════════════════════════════════════ */}
			<section className="section" aria-labelledby="philosophy-heading">
				<div className="container mx-auto px-6 max-w-[1200px]">
					<h2 id="philosophy-heading" className="section-title">
						{t("philosophy.title")}
					</h2>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
						{philosophyPillars.map(({ icon, titleKey, textKey }) => (
							<div
								key={titleKey}
								className="text-center p-8 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-gold)] transition-colors duration-300 fade-in"
							>
								<div className="text-4xl mb-4" aria-hidden="true">
									{icon}
								</div>
								<h3
									className="text-lg font-light mb-4 text-[var(--color-gold)]"
									style={{ fontFamily: "Georgia, serif" }}
								>
									{t(`philosophy.${titleKey}`)}
								</h3>
								<p className="text-sm text-[var(--color-text-muted)] leading-relaxed font-light">
									{t(`philosophy.${textKey}`)}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ══════════════════════════════════════════
          TEAM — FOUNDERS
      ══════════════════════════════════════════ */}
			<section className="section-alt" aria-labelledby="founders-heading">
				<div className="container mx-auto px-6 max-w-[1200px]">
					<h2 id="founders-heading" className="section-title">
						{t("team.title")}
					</h2>
					<p className="section-subtitle">{t("team.subtitle")}</p>

					{/* Founders row */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-3xl mx-auto mb-12">
						{founders.map(({ key, role, name, bio }) => (
							<article key={key} className="text-center fade-in">
								<div
									className="w-28 h-28 mx-auto mb-5 rounded-full bg-gradient-to-br from-[var(--color-gold-light)] to-[var(--color-background)] flex items-center justify-center border-2 border-[var(--color-gold-medium)]"
									aria-hidden="true"
								>
									<span className="text-3xl">🍷</span>
								</div>
								<p className="text-xs tracking-widest uppercase text-[var(--color-gold)] mb-1">
									{role}
								</p>
								<h3
									className="text-xl font-light mb-3"
									style={{ fontFamily: "Georgia, serif" }}
								>
									{name}
								</h3>
								<p className="text-sm text-[var(--color-text-muted)] leading-relaxed font-light">
									{bio}
								</p>
							</article>
						))}
					</div>

					{/* Second generation */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-3xl mx-auto">
						{secondGen.map(({ key, role, name, bio }) => (
							<article key={key} className="text-center fade-in">
								<div
									className="w-28 h-28 mx-auto mb-5 rounded-full bg-gradient-to-br from-[var(--color-gold-light)] to-[var(--color-background)] flex items-center justify-center border-2 border-[var(--color-gold-medium)]"
									aria-hidden="true"
								>
									<span className="text-3xl">✦</span>
								</div>
								<p className="text-xs tracking-widest uppercase text-[var(--color-gold)] mb-1">
									{role}
								</p>
								<h3
									className="text-xl font-light mb-3"
									style={{ fontFamily: "Georgia, serif" }}
								>
									{name}
								</h3>
								<p className="text-sm text-[var(--color-text-muted)] leading-relaxed font-light">
									{bio}
								</p>
							</article>
						))}
					</div>
				</div>
			</section>
		</>
	);
}
