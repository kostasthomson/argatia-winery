import { useTranslations, useLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import Image from "next/image";
import winesDataRaw from "@/data/wines.json";
import type { Wine } from "@/types/wine";

const winesData = winesDataRaw as Wine[];

function buildWineListJsonLd(locale: string) {
	return {
		"@context": "https://schema.org",
		"@type": "ItemList",
		name: locale === "el" ? "Κρασιά Αργατία" : "Argatia Wines",
		itemListElement: winesData.map((wine, index) => ({
			"@type": "ListItem",
			position: index + 1,
			item: {
				"@type": "Product",
				name: locale === "el" ? wine.name_el : (wine.name_en ?? wine.name_el),
				description:
					locale === "el"
						? wine.description_el
						: (wine.description_en ?? wine.description_el),
				image: `https://argatia.gr${wine.image}`,
				brand: { "@type": "Brand", name: "Αργατία / Argatia" },
				manufacturer: {
					"@type": "Organization",
					name: "Αργατία Οινοποιείο",
					url: "https://argatia.gr",
				},
				countryOfOrigin: "GR",
				additionalProperty: wine.abv
					? [{ "@type": "PropertyValue", name: "ABV", value: `${wine.abv}%` }]
					: undefined,
			},
		})),
	};
}

interface WinesPageProps {
	params: Promise<{ locale: string }>;
}

export async function generateMetadata({
	params,
}: WinesPageProps): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "wines.meta" });
	return {
		title: t("title"),
		description: t("description"),
		alternates: {
			canonical: `/${locale}/wines`,
			languages: { el: "/el/wines", en: "/en/wines" },
		},
	};
}

/**
 * Wines page — full wine collection with tasting notes, food pairings, and production details.
 * Static data from /data/wines.json, labels from next-intl translations.
 */
export default function WinesPage() {
	const locale = useLocale();
	const t = useTranslations("wines");

	const wineKeys = ["red", "white", "nevma"] as const;
	const wineListJsonLd = buildWineListJsonLd(locale);

	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(wineListJsonLd) }}
			/>

			{/* ══════════════════════════════════════════
          PAGE HERO
      ══════════════════════════════════════════ */}
			<section
				className="relative h-[480px] flex items-center justify-center text-center text-white"
				style={{
					background:
						"linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.45)), url('/images/winery.jpeg') center/cover no-repeat",
				}}
				aria-label="Wines page hero"
			>
				<div className="container mx-auto px-6 max-w-3xl">
					<p className="text-xs tracking-[0.4em] uppercase text-[var(--color-gold)] mb-4">
						Naoussa · Xinomauro · Malagousia
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
          WINE CARDS
          Alternating layout: image left / right.
      ══════════════════════════════════════════ */}
			<section className="section" aria-labelledby="wines-collection-heading">
				<div className="container mx-auto px-6 max-w-[1200px]">
					<h2 id="wines-collection-heading" className="sr-only">
						{t("title")}
					</h2>

					<div className="space-y-24">
						{winesData.map((wine, index) => {
							const key = wineKeys[index] ?? "red";
							const isEven = index % 2 === 0;

							return (
								<article
									key={wine.id}
									id={`wine-${wine.id}`}
									className={`grid grid-cols-1 md:grid-cols-2 gap-16 items-center fade-in ${isEven ? "" : "md:[&>*:first-child]:order-last"}`}
								>
									{/* Bottle image */}
									<div className="flex justify-center">
										<div className="relative group">
											<div
												className="absolute inset-0 bg-[var(--color-gold-light)] rounded-full blur-3xl scale-75 opacity-60 group-hover:opacity-90 transition-opacity duration-500"
												aria-hidden="true"
											/>
											<Image
												src={wine.image}
												alt={wine[`name_el`]}
												width={200}
												height={340}
												sizes="(max-width: 768px) 200px, 200px"
												className="relative h-80 w-auto object-contain drop-shadow-xl transition-transform duration-500 group-hover:-translate-y-3"
												loading="lazy"
											/>
										</div>
									</div>

									{/* Wine details */}
									<div>
										<p className="text-xs tracking-[0.35em] uppercase text-[var(--color-gold)] mb-3 font-light">
											{t(`${key}.type`)}
										</p>
										<h2
											className="text-3xl md:text-4xl font-light mb-2"
											style={{ fontFamily: "Georgia, serif" }}
										>
											{t(`${key}.name`)}
										</h2>
										<p className="text-[var(--color-text-muted)] text-sm mb-6 font-light">
											{wine.varieties.join(" · ")}
										</p>
										<p className="text-[var(--color-dark)] leading-relaxed font-light mb-8 opacity-80">
											{t(`${key}.description`)}
										</p>

										{/* Detail rows */}
										<dl className="space-y-4">
											<div className="flex items-start gap-4 border-b border-[var(--color-border)] pb-4">
												<dt className="w-32 flex-shrink-0 text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-light pt-0.5">
													{t("tastingNotes")}
												</dt>
												<dd className="text-sm font-light text-[var(--color-dark)]">
													{t(`${key}.tastingNotes`)}
												</dd>
											</div>
											<div className="flex items-start gap-4 border-b border-[var(--color-border)] pb-4">
												<dt className="w-32 flex-shrink-0 text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-light pt-0.5">
													{t("foodPairing")}
												</dt>
												<dd className="text-sm font-light text-[var(--color-dark)]">
													{t(`${key}.pairing`)}
												</dd>
											</div>
											{wine.abv && (
												<div className="flex items-start gap-4 border-b border-[var(--color-border)] pb-4">
													<dt className="w-32 flex-shrink-0 text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-light pt-0.5">
														ABV
													</dt>
													<dd className="text-sm font-light text-[var(--color-dark)]">
														{wine.abv}%
													</dd>
												</div>
											)}
											{wine.productionBottles && (
												<div className="flex items-start gap-4">
													<dt className="w-32 flex-shrink-0 text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-light pt-0.5">
														{t("production")}
													</dt>
													<dd className="text-sm font-light text-[var(--color-dark)]">
														{wine.productionBottles.toLocaleString()} bottles
													</dd>
												</div>
											)}
										</dl>
									</div>
								</article>
							);
						})}
					</div>
				</div>
			</section>
		</>
	);
}
