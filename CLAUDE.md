# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project purpose

Argatia is a small organic winery in Rodochori, Naoussa, Macedonia (Greece). This is their marketing and e-commerce website targeting both consumers (B2C) and trade buyers (B2B). The site must work fluently in Greek (primary) and English (secondary).

Core features:
- Public marketing pages: home, about & team, vineyards, wines, news/blog, contact
- Bilingual routing: every public URL has a `/el/` or `/en/` prefix
- News/blog managed entirely by the winery owner via a password-protected admin panel
- Firebase backend for news storage, image uploads, and authentication (single owner account)

## Commands

```bash
npm run dev        # Dev server with Turbopack (faster HMR)
npm run build      # Production build — also runs tsc + ESLint
npm run start      # Serve the production build
npm run lint       # ESLint only
```

No test suite exists yet. Type errors surface during `npm run build`.

## Stack

| Concern | Library |
|---|---|
| Framework | Next.js 15.2.4 — App Router |
| Styling | Tailwind CSS 4 + custom CSS variables |
| Animations | Framer Motion 12 |
| i18n | next-intl 4.9.0 |
| Backend | Firebase 12 (Auth, Firestore, Storage) |
| News content | react-markdown 10 + DOMPurify (XSS sanitisation) |
| Admin data fetching | SWR 2 |
| Language | TypeScript strict mode |

## Routing architecture

```
src/app/
  layout.tsx              # Root HTML shell — Geist fonts, global metadata only
  [locale]/
    layout.tsx            # Public shell — validates locale, loads translations,
                          #   renders Header + skip-link + Footer
    page.tsx              # /el  or  /en  (home)
    about/  wines/  vineyards/  news/  contact/
  admin/
    layout.tsx            # Admin shell — AuthProvider only, force-dynamic,
                          #   no public Header/Footer
    page.tsx              # /admin  (dashboard, requires auth)
    login/page.tsx        # /admin/login
```

**Two completely separate layout trees:**
- `[locale]/layout.tsx` handles all public-facing pages. It validates the locale param with `hasLocale()`, loads `messages/{locale}.json` server-side, and wraps children in `NextIntlClientProvider`.
- `admin/layout.tsx` is auth-only. It has `export const dynamic = "force-dynamic"` to prevent build-time prerendering, which would fail without real Firebase credentials in CI.

The middleware (`src/middleware.ts`) uses next-intl's `createMiddleware` to redirect `/` → `/el` and enforce locale prefixes on all public routes. The matcher **explicitly excludes `/admin/**`** so admin routes are never touched by locale logic.

## i18n

```ts
// CORRECT — always use this for public [locale] pages
import { Link, useRouter, usePathname } from "@/i18n/navigation";

// WRONG — breaks locale prefix handling
import Link from "next/link";
import { useRouter } from "next/navigation";
```

`src/i18n/navigation.ts` re-exports locale-aware versions of `Link`, `useRouter`, `usePathname`, and `redirect` created by `createNavigation(routing)`. Admin pages (outside locale routing) use plain `next/link` and `next/navigation`.

Translation files are `messages/el.json` and `messages/en.json`. Both must always be kept in sync — every key added to one must be added to the other. Top-level namespaces: `nav`, `home`, `about`, `vineyards`, `wines`, `news`, `contact`, `footer`, `common`, `admin`.

When using `generateMetadata` on a page, call `await getTranslations(...)` but don't assign to a variable if the return value is unused — the linter flags unused variables.

## Design system

The entire visual language lives in `src/app/globals.css` as CSS custom properties and utility classes. Tailwind is used for layout and spacing; brand-specific styles use these classes.

**Brand palette:**
| Token | Value | Use |
|---|---|---|
| `--color-gold` | `#c69d53` | CTAs, active nav, accents, dividers |
| `--color-gold-dark` | `#b8925a` | Hover state for gold elements |
| `--color-gold-light` | `rgba(198,157,83,0.1)` | Subtle backgrounds |
| `--color-dark` | `#2c2c2c` | Body text, headings |
| `--color-background` | `#f8f6f3` | Off-white page / section backgrounds |
| `--color-wine-red` | `#8b1538` | Accent (wine type badges etc.) |
| `--color-text-muted` | `#666666` | Secondary text |

**Commonly used utility classes:**
- Layout: `.container`, `.section`, `.section-alt` (off-white bg)
- Typography: `.section-title` (centred, gold underline bar), `.section-subtitle`
- Buttons: `.btn .btn-gold`, `.btn .btn-primary` (outlined white), `.btn .btn-outline` (outlined dark)
- Cards: `.card` (white, rounded, hover lift)
- Nav: `.nav-link` (underline slide animation on hover/active, `.active` class sets gold colour)
- Forms: `.form-input`, `.form-label`, `.form-error`
- Animation: `.fade-in` + `.visible` (scroll-triggered via JS), `.animate-fadeInUp`

**Typography rule:** headings and display text use `style={{ fontFamily: "Georgia, serif" }}` inline (or `var(--font-serif)`) at font-weight 300. Body copy uses Geist Sans at 300–400.

**Header behaviour:** the header component (`src/components/header/header.tsx`) is `"use client"` and transitions from `bg-transparent` (over the hero) to `bg-white/95 backdrop-blur-sm shadow-md` once `window.scrollY > 60`. Because the header is `position: fixed`, the locale layout applies `pt-20 md:pt-24` to `<main>`. Hero sections pull back with `-mt-20 md:-mt-24` to extend behind the header.

## Bilingual content fields

All dynamic content that needs translation follows the `_el` / `_en` suffix pattern:

```ts
// Firestore news document
title_el, title_en?, content_el, content_en?, excerpt_el?, excerpt_en?
imageAlt_el?, imageAlt_en?

// Static wine data (wines.json)
name_el, name_en, type_el, type_en, description_el, description_en
pairing_el, pairing_en, aging_el?, aging_en?

// Static vineyard data (vineyards.json)
name_el, name_en, location_el, location_en, description_el, description_en
soil_el, soil_en
```

When rendering bilingual fields in a component, select the field for the current locale:
```ts
const title = locale === "el" ? item.title_el : (item.title_en ?? item.title_el);
```

English (`_en`) fields are optional — always fall back to `_el` if the English version is absent.

## Static data

`src/data/wines.json` and `src/data/vineyards.json` hold the winery's product catalogue. TypeScript infers narrow union types from JSON imports, so always cast when using optional fields:

```ts
import winesDataRaw from "@/data/wines.json";
import type { Wine } from "@/types/wine";
const winesData = winesDataRaw as Wine[];
```

Wine IDs: `red`, `white`, `nevma`. Vineyard IDs: `krasna`, `lakka`, `xerolacos`. These IDs double as translation namespaces (e.g. `t("wines.red.name")`).

## Firebase & authentication

**Setup required before the app works:**
1. Copy `.env.local.example` → `.env.local` and fill all six `NEXT_PUBLIC_FIREBASE_*` vars
2. Replace `REPLACE_WITH_OWNER_UID` in `firestore.rules` and `storage.rules` with the admin's UID (Firebase Console → Authentication → Users)
3. `firebase deploy --only firestore:rules,storage`

**Auth flow (client-side only — no server session):**
```
onAuthStateChanged
  └─ AuthProvider (context)  [src/components/auth/auth-provider.tsx]
       └─ useAuth() hook     [src/hooks/useAuth.ts]
            └─ AuthGuard     [src/components/auth/auth-guard.tsx]
                 └─ protected page content
```

`AuthGuard` renders a spinner while `loading === true`, then redirects to `/admin/login` if `user === null`. The login page itself redirects to `/admin` if the user is already authenticated. Use `src/lib/auth.ts` helpers (`signIn`, `signOut`) — never call Firebase Auth SDK methods directly in components.

**Firestore security model:**
- `news/{id}`: public `read` only when `published == true`; `create/update/delete` only for the owner UID
- Everything else: denied by default

**Storage security model (`storage.rules`):**
- `news-images/{file}`: public `read`, owner-only `write`
- Everything else: denied

## Types

`src/types/` contains four interfaces:

| File | Key types |
|---|---|
| `news.ts` | `NewsItem` (Firestore doc with `Timestamp`), `NewsItemClient` (dates serialised to `string` for client), `CreateNewsInput`, `UpdateNewsInput` |
| `wine.ts` | `Wine` — bilingual catalogue entry |
| `vineyard.ts` | `Vineyard` — bilingual, includes `coordinates: [number, number]` |
| `api.ts` | `ApiResponse<T>`, `ApiError`, `ApiMeta` (pagination), `NewsQueryParams` |

Always use `NewsItemClient` (not `NewsItem`) when passing news data to client components — Firestore `Timestamp` objects are not serialisable across the server/client boundary.

## Planned but not yet built (Week 4+)

The following are scaffolded but incomplete:
- `src/app/[locale]/news/page.tsx` — static shell, no live Firestore data yet
- Home page news section — placeholder skeleton, will be wired to Firestore featured news
- Admin news editor (`/admin/news/new`, `/admin/news/[id]`) — not yet created
- Firestore CRUD library (`src/lib/news.ts`)
- Firebase Storage upload helper
- SWR hooks for news data (`src/hooks/useNews.ts`)
- API routes (`src/app/api/news/`)
- JSON-LD structured data, sitemap.xml, robots.txt

When building these, use `NewsItemClient` for all client-side data, `COLLECTIONS.news` (not the string `"news"`) for Firestore collection references, and `STORAGE_PATHS.newsImages` for the Storage path.
