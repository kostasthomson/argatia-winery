import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * Locale-aware navigation utilities created from the app's routing config.
 * Import Link, useRouter, usePathname, and redirect from here instead of next/navigation,
 * so they automatically handle locale prefixes (/el/..., /en/...).
 */
export const { Link, useRouter, usePathname, redirect } =
  createNavigation(routing);
