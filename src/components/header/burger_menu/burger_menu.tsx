"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { usePathname, Link, useRouter } from "@/i18n/navigation";

/**
 * Mobile burger menu component.
 * Shows a toggleable overlay with all navigation links and a language switcher.
 * Closes automatically when a link is clicked.
 */
export default function BurgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const navLinks = [
    { href: "/", label: t("home") },
    { href: "/about", label: t("about") },
    { href: "/vineyards", label: t("vineyards") },
    { href: "/wines", label: t("wines") },
    { href: "/news", label: t("news") },
    { href: "/contact", label: t("contact") },
  ];

  function switchLocale() {
    const next = locale === "el" ? "en" : "el";
    router.replace(pathname, { locale: next });
    setIsOpen(false);
  }

  return (
    <div className="relative md:hidden">
      {/* Burger button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
        aria-controls="mobile-nav-menu"
        className="p-2 rounded-md text-[var(--color-gold)] focus-visible:outline-2 focus-visible:outline-[var(--color-gold)] focus-visible:outline-offset-2"
      >
        <motion.div animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.25 }}>
          {isOpen ? (
            /* X icon */
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            /* Hamburger icon */
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </motion.div>
      </button>

      {/* Dropdown menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="absolute top-12 left-0 w-56 bg-white shadow-xl rounded-xl border border-[var(--color-border)] overflow-hidden z-50"
          >
            <nav id="mobile-nav-menu" aria-label="Mobile navigation">
              <ul className="py-2">
                {navLinks.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="block px-5 py-3 text-sm font-light text-[var(--color-dark)] hover:text-[var(--color-gold)] hover:bg-[var(--color-gold-light)] transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
              {/* Language switcher */}
              <div className="border-t border-[var(--color-border)] px-5 py-3">
                <button
                  onClick={switchLocale}
                  className="flex items-center gap-2 text-sm font-light text-[var(--color-text-muted)] hover:text-[var(--color-gold)] transition-colors"
                >
                  <span className="text-base">{locale === "el" ? "🇬🇧" : "🇬🇷"}</span>
                  <span>{locale === "el" ? "English" : "Ελληνικά"}</span>
                </button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
