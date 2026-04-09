import { defineRouting } from "next-intl/routing";

/**
 * Defines the routing configuration for internationalization.
 * Greek (el) is the primary language, English (en) is secondary.
 */
export const routing = defineRouting({
  locales: ["el", "en"],
  defaultLocale: "el",
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];
