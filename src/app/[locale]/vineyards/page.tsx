import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import vineyardsData from "@/data/vineyards.json";

interface VineyardsPageProps {
	params: Promise<{ locale: string }>;
}

export async function generateMetadata({
	params,
}: VineyardsPageProps): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "vineyards.meta" });
	return {
		title: t("title"),
		description: t("description"),
		alternates: {
			canonical: `/${locale}/vineyards`,
			languages: { el: "/el/vineyards", en: "/en/vineyards" },
		},
	};
}

/**
 * Vineyards page — three vineyard locations with terrain details and organic certification section.
 * Vineyard data comes from /data/vineyards.json; labels from next-intl translations.
 */
export default function VineyardsPage() {
	const t = useTranslations("vineyards");

	// Map vineyard JSON id to translation key
	const vineyardKeys = ["krasna", "lakka", "xerolacos"] as const;

	return (
		<>
			{/* ══════════════════════════════════════════
          PAGE HERO
      ══════════════════════════════════════════ */}
			<section
				className="relative h-[480px] flex items-center justify-center text-center text-white"
				style={{
					background:
						"linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.45)), url('/images/winery.jpeg') center/cover no-repeat",
				}}
				aria-label="Vineyards page hero"
			>
				<div className="container mx-auto px-6 max-w-3xl">
					<p className="text-xs tracking-[0.4em] uppercase text-[var(--color-gold)] mb-4">
						Naoussa · Macedonia · Greece
					</p>
					<h1
						className="text-4xl md:text-6xl font-light tracking-widest"
						style={{ fontFamily: "Georgia, serif" }}
					>
						{t("title")}
					</h1>
					<div
						className="w-16 h-px bg-[var(--color-gold)] mx-auto mt-6 mb-6"
						aria-hidden="true"
					/>
					<p className="text-lg font-light opacity-80">{t("subtitle")}</p>
				</div>
			</section>

			{/* ══════════════════════════════════════════
          VINEYARD CARDS
      ══════════════════════════════════════════ */}
			<section className="section" aria-labelledby="vineyards-heading">
				<div className="container mx-auto px-6 max-w-[1200px]">
					<h2 id="vineyards-heading" className="sr-only">
						{t("title")}
					</h2>

					<div className="space-y-20">
						{vineyardsData.map((vineyard, index) => {
							const key = vineyardKeys[index] ?? "krasna";
							const isEven = index % 2 === 0;

							return (
								<article
									key={vineyard.id}
									className={`grid grid-cols-1 md:grid-cols-2 gap-12 items-center fade-in ${isEven ? "" : "md:[&>*:first-child]:order-last"}`}
								>
									{/* Vineyard image placeholder */}
									<div
										className="relative h-72 md:h-96 rounded-2xl overflow-hidden bg-gradient-to-br from-[var(--color-background)] to-[var(--color-gold-light)] flex items-center justify-center"
										aria-hidden="true"
									>
										<div className="text-center">
											<p className="text-6xl mb-4">🍇</p>
											<p className="text-sm tracking-widest uppercase text-[var(--color-gold)] font-light">
												{t(`${key}.name`)}
											</p>
											<p className="text-xs text-[var(--color-text-muted)] mt-1">
												{vineyard.elevationM}m
											</p>
										</div>
									</div>

									{/* Vineyard info */}
									<div>
										<p className="text-xs tracking-[0.35em] uppercase text-[var(--color-gold)] mb-3 font-light">
											{t(`${key}.location`)}
										</p>
										<h2
											className="text-3xl md:text-4xl font-light mb-5"
											style={{ fontFamily: "Georgia, serif" }}
										>
											{t(`${key}.name`)}
										</h2>
										<p className="text-[var(--color-text-muted)] leading-relaxed font-light mb-8">
											{t(`${key}.description`)}
										</p>

										{/* Specs grid */}
										<dl className="grid grid-cols-2 gap-4">
											{[
												{
													label: t("elevation"),
													value: `${vineyard.elevationM}m`,
												},
												{
													label: t("established"),
													value: String(vineyard.established),
												},
												{ label: t("soil"), value: t(`${key}.soil`) },
												{
													label: t("varieties"),
													value: vineyard.varieties.join(", "),
												},
												{ label: t("rootstock"), value: vineyard.rootstock },
											].map(({ label, value }) => (
												<div
													key={label}
													className="border-l-2 border-[var(--color-gold-medium)] pl-4"
												>
													<dt className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-light mb-1">
														{label}
													</dt>
													<dd className="text-sm font-light text-[var(--color-dark)]">
														{value}
													</dd>
												</div>
											))}
										</dl>
									</div>
								</article>
							);
						})}
					</div>
				</div>
			</section>

			{/* ══════════════════════════════════════════
          ORGANIC CERTIFICATION BANNER
      ══════════════════════════════════════════ */}
			<section className="section-alt" aria-labelledby="organic-heading">
				<div className="container mx-auto px-6 max-w-[1200px]">
					<div className="max-w-3xl mx-auto text-center fade-in">
						<div className="text-5xl mb-6" aria-hidden="true">
							🌿
						</div>
						<h2 id="organic-heading" className="section-title">
							{t("organic.title")}
						</h2>
						<div
							className="w-16 h-px bg-[var(--color-gold)] mx-auto mb-8"
							aria-hidden="true"
						/>
						<p className="text-lg font-light leading-relaxed text-[var(--color-dark)] opacity-80 mb-8">
							{t("organic.text")}
						</p>
						<div className="inline-flex items-center gap-3 border border-[var(--color-gold)] rounded-full px-8 py-3">
							<span
								className="text-[var(--color-gold)] text-lg"
								aria-hidden="true"
							>
								✦
							</span>
							<span className="text-sm tracking-widest uppercase text-[var(--color-dark)] font-light">
								{t("organic.certified")}
							</span>
						</div>
					</div>
				</div>
			</section>
		</>
	);
}
