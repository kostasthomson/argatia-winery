"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { usePathname, Link, useRouter } from "@/i18n/navigation";
import logoImg from "../../../public/images/logo.png";
import BurgerMenu from "./burger_menu/burger_menu";

/**
 * Site-wide sticky header.
 *
 * Layout (desktop):  [Nav Links Left]  [Logo Center]  [Nav Links Right + Lang Switcher]
 * Layout (mobile):   [Burger Menu]     [Logo Center]  (empty right slot)
 *
 * The header transitions from transparent (over the hero) to a white frosted-glass
 * background once the user scrolls past 60px, improving readability on inner pages.
 */
export default function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 60);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const leftLinks = [
    { href: "/", label: t("home") },
    { href: "/about", label: t("about") },
    { href: "/vineyards", label: t("vineyards") },
  ];

  const rightLinks = [
    { href: "/wines", label: t("wines") },
    { href: "/news", label: t("news") },
    { href: "/contact", label: t("contact") },
  ];

  function switchLocale() {
    const next = locale === "el" ? "en" : "el";
    router.replace(pathname, { locale: next });
  }

  /** Returns true when the given href matches the current page path. */
  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  const headerBg = scrolled
    ? "bg-white/95 backdrop-blur-sm shadow-md"
    : "bg-transparent";

  const linkColor = scrolled ? "text-[var(--color-dark)]" : "text-white";
  const logoFilter = scrolled ? "" : "brightness-0 invert";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${headerBg}`}
      role="banner"
    >
      <div className="container mx-auto px-6 max-w-[1200px]">
        <div className="flex items-center justify-between h-20 md:grid md:grid-cols-3 md:h-24">

          {/* ── Mobile: Burger (left slot) ── */}
          <div className="md:hidden">
            <BurgerMenu />
          </div>

          {/* ── Desktop: Left nav links ── */}
          <nav
            className="hidden md:flex items-center gap-6 justify-start"
            aria-label="Primary navigation left"
          >
            {leftLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`nav-link text-sm tracking-wide uppercase ${linkColor} ${isActive(href) ? "active" : ""}`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* ── Logo (center) ── */}
          <div className="flex justify-center items-center">
            <Link href="/" aria-label="Argatia Winery — home">
              <Image
                src={logoImg}
                alt="Argatia Winery Logo"
                width={160}
                height={80}
                className={`h-16 md:h-20 w-auto object-contain transition-all duration-300 ${logoFilter}`}
                priority
              />
            </Link>
          </div>

          {/* ── Desktop: Right nav links + language switcher ── */}
          <nav
            className="hidden md:flex items-center gap-6 justify-end"
            aria-label="Primary navigation right"
          >
            {rightLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`nav-link text-sm tracking-wide uppercase ${linkColor} ${isActive(href) ? "active" : ""}`}
              >
                {label}
              </Link>
            ))}

            {/* Language switcher */}
            <button
              onClick={switchLocale}
              aria-label={locale === "el" ? "Switch to English" : "Μετάβαση στα Ελληνικά"}
              className={`text-xs tracking-widest uppercase font-medium px-2 py-1 border rounded transition-colors duration-200 ${
                scrolled
                  ? "border-[var(--color-gold)] text-[var(--color-gold)] hover:bg-[var(--color-gold)] hover:text-white"
                  : "border-white text-white hover:bg-white hover:text-[var(--color-dark)]"
              }`}
            >
              {locale === "el" ? "EN" : "EL"}
            </button>
          </nav>

          {/* ── Mobile: empty right slot for balance ── */}
          <div className="md:hidden w-10" aria-hidden="true" />
        </div>
      </div>
    </header>
  );
}
