import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import ContactForm from "@/components/contact/contact-form";

interface ContactPageProps {
	params: Promise<{ locale: string }>;
}

export async function generateMetadata({
	params,
}: ContactPageProps): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "contact.meta" });
	return {
		title: t("title"),
		description: t("description"),
		alternates: {
			canonical: `/${locale}/contact`,
			languages: { el: "/el/contact", en: "/en/contact" },
		},
	};
}

/**
 * Contact page — address, hours, contact form, and embedded Google Map.
 * The form is extracted to <ContactForm> (client component) for interactivity.
 */
export default function ContactPage() {
	const t = useTranslations("contact");

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
				aria-label="Contact page hero"
			>
				<div className="container mx-auto px-6 max-w-3xl">
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
          CONTACT INFO + FORM
      ══════════════════════════════════════════ */}
			<section className="section" aria-labelledby="contact-heading">
				<div className="container mx-auto px-6 max-w-[1200px]">
					<h2 id="contact-heading" className="sr-only">
						{t("title")}
					</h2>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-16">
						{/* Contact details */}
						<div className="space-y-10 fade-in">
							{/* Address */}
							<div>
								<h3 className="text-xs tracking-widest uppercase text-[var(--color-gold)] mb-4">
									{t("address.label")}
								</h3>
								<address className="not-italic text-[var(--color-dark)] font-light leading-relaxed">
									{t("address.value")}
								</address>
							</div>

							{/* Phone */}
							<div>
								<h3 className="text-xs tracking-widest uppercase text-[var(--color-gold)] mb-4">
									{t("phone.label")}
								</h3>
								<a
									href={`tel:${t("phone.value").replace(/\s/g, "")}`}
									className="text-[var(--color-dark)] font-light hover:text-[var(--color-gold)] transition-colors"
								>
									{t("phone.value")}
								</a>
							</div>

							{/* Email */}
							<div>
								<h3 className="text-xs tracking-widest uppercase text-[var(--color-gold)] mb-4">
									{t("email.label")}
								</h3>
								<a
									href={`mailto:${t("email.value")}`}
									className="text-[var(--color-dark)] font-light hover:text-[var(--color-gold)] transition-colors"
								>
									{t("email.value")}
								</a>
							</div>

							{/* Hours */}
							<div>
								<h3 className="text-xs tracking-widest uppercase text-[var(--color-gold)] mb-4">
									{t("hours.label")}
								</h3>
								<div className="space-y-1 text-[var(--color-dark)] font-light">
									<p>{t("hours.weekdays")}</p>
									<p>{t("hours.sunday")}</p>
								</div>
							</div>

							{/* Social links */}
							<div>
								<h3 className="text-xs tracking-widest uppercase text-[var(--color-gold)] mb-4">
									{t("social.title")}
								</h3>
								<div className="flex gap-4">
									<a
										href="https://www.instagram.com/argatia_winery"
										target="_blank"
										rel="noopener noreferrer"
										className="text-sm font-light text-[var(--color-dark)] hover:text-[var(--color-gold)] transition-colors"
									>
										Instagram
									</a>
									<span
										aria-hidden="true"
										className="text-[var(--color-border)]"
									>
										·
									</span>
									<a
										href="https://www.facebook.com/argatia.winery"
										target="_blank"
										rel="noopener noreferrer"
										className="text-sm font-light text-[var(--color-dark)] hover:text-[var(--color-gold)] transition-colors"
									>
										Facebook
									</a>
								</div>
							</div>
						</div>

						{/* Contact form (client component) */}
						<div className="fade-in">
							<ContactForm />
						</div>
					</div>
				</div>
			</section>

			{/* ══════════════════════════════════════════
          MAP
          Lazy-loaded iframe for Google Maps embed.
          Replace the src with the actual embed URL from Google Maps.
      ══════════════════════════════════════════ */}
			<section className="section-alt" aria-label="Map">
				<div className="container mx-auto px-6 max-w-[1200px]">
					<div className="rounded-2xl overflow-hidden shadow-lg h-80 md:h-96 bg-[var(--color-background)] flex items-center justify-center">
						{/* Google Maps embed — replace href with the real embed URL */}
						<iframe
							title="Argatia Winery location"
							src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3025.2743144419187!2d22.021622275508527!3d40.689955838965666!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x13579815354c3055%3A0x9006daf3b5f25865!2zzp_Ouc69zr_PgM6_zrnOtc6vzr8gzpHPgc6zzrHPhM6vzrEgzqHOv860zr_Ph8-Oz4HOuSDOnc6szr_Phc-DzrE!5e0!3m2!1sel!2sgr!4v1776116669990!5m2!1sel!2sgr"
							width="100%"
							height="100%"
							style={{ border: 0 }}
							allowFullScreen
							loading="lazy"
							referrerPolicy="no-referrer-when-downgrade"
						/>
					</div>
				</div>
			</section>
		</>
	);
}
