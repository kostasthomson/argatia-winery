import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

/**
 * Server-side i18n configuration.
 * Loads translation messages for the current request locale.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // Ensure valid locale, fallback to default
  if (!locale || !routing.locales.includes(locale as "el" | "en")) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
