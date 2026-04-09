import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

/**
 * Next.js middleware:
 * 1. i18n locale routing — redirects / → /el (or /en based on Accept-Language)
 * 2. Admin routes at /admin/** are excluded from locale handling;
 *    they use their own auth guard (Firebase Auth, client-side).
 */
export default createMiddleware(routing);

export const config = {
  // Exclude: API routes, Next.js internals, static assets, and /admin/**
  matcher: [
    "/((?!api|admin|_next/static|_next/image|favicon.ico|images|robots.txt|sitemap.xml).*)",
  ],
};
