import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

/**
 * Site-wide footer.
 *
 * Three-column desktop layout:
 *   Left  — Brand statement + organic certification badge
 *   Center — Quick navigation links
 *   Right  — Contact info + social links
 *
 * Collapses to single-column on mobile.
 */
export default function Footer() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");

  const navLinks = [
    { href: "/", label: nav("home") },
    { href: "/about", label: nav("about") },
    { href: "/vineyards", label: nav("vineyards") },
    { href: "/wines", label: nav("wines") },
    { href: "/news", label: nav("news") },
    { href: "/contact", label: nav("contact") },
  ];

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[var(--color-dark)] text-white" role="contentinfo">
      <div className="container mx-auto px-6 max-w-[1200px] py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">

          {/* ── Brand column ── */}
          <div className="space-y-5">
            <h2 className="text-[var(--color-gold)] text-xl font-light tracking-widest uppercase"
                style={{ fontFamily: "Georgia, serif" }}>
              Argatia
            </h2>
            <p className="text-sm leading-relaxed text-gray-300 font-light max-w-xs">
              {t("tagline")}
            </p>
            {/* Organic certification badge */}
            <div className="inline-flex items-center gap-2 border border-[var(--color-gold-medium)] rounded-full px-4 py-2">
              <span className="text-[var(--color-gold)] text-sm">✦</span>
              <span className="text-xs tracking-widest uppercase text-gray-300">{t("organic")}</span>
            </div>
          </div>

          {/* ── Navigation column ── */}
          <div className="space-y-4">
            <h3 className="text-xs tracking-widest uppercase text-[var(--color-gold)] mb-5">
              {t("navigate")}
            </h3>
            <nav aria-label="Footer navigation">
              <ul className="space-y-3">
                {navLinks.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-gray-300 font-light hover:text-[var(--color-gold)] transition-colors duration-200"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* ── Contact column ── */}
          <div className="space-y-4">
            <h3 className="text-xs tracking-widest uppercase text-[var(--color-gold)] mb-5">
              {t("contact")}
            </h3>
            <address className="not-italic space-y-3 text-sm text-gray-300 font-light">
              <p>{t("address")}</p>
              <p>
                <a
                  href="mailto:info@argatia.gr"
                  className="hover:text-[var(--color-gold)] transition-colors duration-200"
                >
                  info@argatia.gr
                </a>
              </p>
              <p>
                <a
                  href="tel:+302310000000"
                  className="hover:text-[var(--color-gold)] transition-colors duration-200"
                >
                  {t("phone")}
                </a>
              </p>
            </address>

            {/* Social links */}
            <div className="flex gap-4 pt-2">
              <a
                href="https://www.instagram.com/argatia_winery"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-gray-400 hover:text-[var(--color-gold)] transition-colors duration-200"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </a>
              <a
                href="https://www.facebook.com/argatia.winery"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-gray-400 hover:text-[var(--color-gold)] transition-colors duration-200"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="border-t border-gray-700 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>© {currentYear} Argatia Winery. {t("rights")}</p>
          <p className="text-[var(--color-gold-medium)]">
            {t("location")}
          </p>
        </div>
      </div>
    </footer>
  );
}
