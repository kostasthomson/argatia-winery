# Argatia Winery — Full Implementation Plan

## Project overview

Build a modern, bilingual (Greek/English) marketing website for **Argatia Winery**, a small organic winery in Rodochori, Naoussa, Macedonia (Greece). The site targets both consumers (B2C) and trade buyers (B2B).

**Owner:** Kostas Thomson  
**Stack:** Next.js 15 · Firebase · next-intl · Tailwind CSS 4 · TypeScript

---

## Confirmed requirements

- [x] Bilingual: Greek (primary `/el`) + English (`/en`) — **non-negotiable**
- [x] 6 public pages: Home, About & Team, Vineyards, Wines, News, Contact
- [x] Home page shows 4–5 featured news items (manually curated by owner)
- [x] News/blog managed through a password-protected admin panel
- [x] Firebase Auth — single owner account (email/password)
- [x] Firebase Firestore — news CRUD
- [x] Firebase Storage — news image uploads
- [x] Markdown support for news article body (react-markdown + DOMPurify)
- [x] High-quality photo support with Next.js image optimisation
- [x] Mobile-first responsive design
- [x] SEO: meta tags, hreflang alternates, JSON-LD structured data
- [x] Security: XSS/CSRF protection, input validation, rate limiting, security headers
- [x] Performance: Core Web Vitals targets (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- [x] Accessibility: WCAG 2.1 AA
- [x] LLM/bot-friendly structure (semantic HTML, JSON-LD, public API)
- [x] Comprehensive code documentation (README, ARCHITECTURE, CONTRIBUTING, API)

---

## Architecture decisions

| Decision | Choice | Reason |
|---|---|---|
| i18n approach | URL-based (`/el/`, `/en/`) | Easier Next.js management, better SEO than subdomains |
| i18n library | next-intl v4 | App Router native, no client bundle for server translations |
| News storage | Firestore with `_el`/`_en` field pairs | Single document, optional English, owner creates in Greek |
| Admin auth | Firebase Auth email/password | Single owner, no user registration needed |
| Admin protection | Client-side `AuthGuard` + Firestore rules | Firebase Auth is client-only; rules are the true security layer |
| Image handling | Firebase Storage CDN + `next/image` | Owner uploads via admin UI; CDN-served to visitors |
| News rendering | `react-markdown` + DOMPurify sanitisation | Allows rich formatting; sanitisation prevents XSS |
| Data fetching (admin) | SWR | Stale-while-revalidate, auto-revalidation on focus |
| Static pages | ISR (revalidate: 3600) | Fast, cacheable; content rarely changes |
| Admin routing | `/admin/**` outside locale routing | No Header/Footer needed; avoids locale middleware conflicts |
| Public article rendering | Server component + `ArticleContent` client component | SSR fetches Firestore data → page arrives pre-rendered; `ArticleContent` runs DOMPurify post-hydration (browser-only API); bundle 285 kB → 132 kB |
| Root layout `lang` attribute | `getLocale()` from `next-intl/server` with `"el"` fallback | Locale layout must not render `<html>/<body>` (nesting causes hydration mismatch); root layout sets `lang` for the single true `<html>` element |
| Contact form delivery | Server logs only (Vercel Functions) | No email service configured; rate-limited API route validates and logs; wire Resend/SendGrid pre-launch |

---

## Routing structure

```
/                          → redirects to /el (middleware)
/el/                       → Home (Greek)
/en/                       → Home (English)
/[locale]/about            → About & Team
/[locale]/vineyards        → Vineyards & Terroir
/[locale]/wines            → Wine Collection
/[locale]/news             → News listing (paginated)
/[locale]/news/[slug]      → Single news article
/[locale]/contact          → Contact page

/admin/login               → Admin login (no locale prefix)
/admin                     → Admin dashboard (protected)
/admin/news                → News list (admin)
/admin/news/new            → Create news article
/admin/news/[id]           → Edit news article

/api/news                  → GET published news (public)
/api/news/[id]             → GET single article (public)
/api/admin/news            → POST / PATCH / DELETE (admin, authed)
```

---

## Layout tree

```
src/app/
  layout.tsx                 # Root HTML shell — fonts only
  [locale]/
    layout.tsx               # Public shell — Header, Footer, i18n provider,
                             #   locale validation, skip-link
    page.tsx                 # Home
    about/page.tsx
    vineyards/page.tsx
    wines/page.tsx
    news/
      page.tsx               # Listing
      [slug]/page.tsx        # Article
    contact/page.tsx
  admin/
    layout.tsx               # Admin shell — AuthProvider, force-dynamic
    page.tsx                 # Dashboard
    login/page.tsx
    news/
      page.tsx               # Admin news list
      new/page.tsx           # Create form
      [id]/page.tsx          # Edit form
```

---

## Data model

### Firestore: `news/{id}`

```ts
interface NewsItem {
  id: string
  title_el: string          // required
  title_en?: string
  content_el: string        // Markdown, required
  content_en?: string
  excerpt_el?: string       // short preview text
  excerpt_en?: string
  imageUrl?: string         // Firebase Storage CDN URL
  imageAlt_el?: string
  imageAlt_en?: string
  author: string
  featured: boolean         // show on home page
  published: boolean        // false = draft
  date: Timestamp
  updatedAt: Timestamp
}
```

### Static JSON: wines & vineyards

All bilingual fields follow `_el` / `_en` suffix. English is optional — always fall back to `_el`.

**Wine IDs:** `red`, `white`, `nevma`  
**Vineyard IDs:** `krasna`, `lakka`, `xerolacos`

These IDs double as translation namespace keys: `t("wines.red.name")`.

---

## Design system

### Brand palette

| Token | Hex | Usage |
|---|---|---|
| `--color-gold` | `#c69d53` | CTAs, active nav, dividers, accents |
| `--color-gold-dark` | `#b8925a` | Gold hover state |
| `--color-gold-light` | `rgba(198,157,83,0.1)` | Subtle gold backgrounds |
| `--color-gold-medium` | `rgba(198,157,83,0.3)` | Borders, badges |
| `--color-dark` | `#2c2c2c` | Body text, headings |
| `--color-background` | `#f8f6f3` | Section alternating background |
| `--color-wine-red` | `#8b1538` | Wine type badges |
| `--color-text-muted` | `#666666` | Secondary / caption text |

### Typography

- **Headings / display:** Georgia serif, `font-weight: 300`
- **Body:** Geist Sans (Next.js default), `font-weight: 300–400`
- **Section title pattern:** `.section-title` — centred, gold underline bar via `::after`

### Utility classes (defined in `globals.css`)

| Class | Purpose |
|---|---|
| `.container` | `max-width: 1200px`, centred, horizontal padding |
| `.section` | Standard section padding (`6rem 0`) |
| `.section-alt` | Section with `--color-background` fill |
| `.section-title` | Centred h2 with gold underline |
| `.section-subtitle` | Muted centred subtitle |
| `.btn` | Base button (flex, transitions) |
| `.btn-gold` | Gold filled CTA |
| `.btn-primary` | Outlined white (for dark/image backgrounds) |
| `.btn-outline` | Outlined dark (for light backgrounds) |
| `.card` | White card with hover lift shadow |
| `.nav-link` | Underline slide animation on hover/`.active` |
| `.form-input` / `.form-label` / `.form-error` | Form field system |
| `.fade-in` + `.visible` | Scroll-triggered entrance animation |
| `.animate-fadeInUp` | One-shot entrance animation |

### Header behaviour

The header is `position: fixed`. It starts `bg-transparent` over the hero image, then transitions to `bg-white/95 backdrop-blur-sm shadow-md` when `window.scrollY > 60`. The locale layout compensates with `pt-20 md:pt-24` on `<main>`. Hero sections use `-mt-20 md:-mt-24` to extend behind the header.

---

## i18n

**Rule:** In all `[locale]` pages and components, import `Link`, `useRouter`, `usePathname` from `@/i18n/navigation` — never from `next/link` or `next/navigation`. The re-exports in `src/i18n/navigation.ts` handle locale prefixes automatically.

Admin pages (outside `[locale]`) use plain `next/link` and `next/navigation`.

**Translation files:** `messages/el.json` and `messages/en.json` must stay in sync. Top-level namespaces: `nav`, `home`, `about`, `vineyards`, `wines`, `news`, `contact`, `footer`, `common`, `admin`.

**Bilingual rendering:**
```ts
const title = locale === "el" ? item.title_el : (item.title_en ?? item.title_el);
```

---

## Firebase setup

### Environment variables (`.env.local`)

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_SITE_URL=https://argatia.gr
```

### Security rules

**Firestore (`firestore.rules`):**
- `news/{id}` public read if `published == true`
- All writes require `request.auth.uid == OWNER_UID`
- Everything else denied

**Storage (`storage.rules`):**
- `news-images/*` public read
- Writes require owner UID
- Everything else denied

> Replace `REPLACE_WITH_OWNER_UID` in both rules files before deploying.  
> Deploy with: `firebase deploy --only firestore:rules,storage`

### Auth flow

```
onAuthStateChanged
  └─ AuthProvider          context wrapping /admin layout
       └─ useAuth()        hook used by any admin component
            └─ AuthGuard   redirects to /admin/login if !user
```

Auth is entirely client-side (no server session cookies). The Firestore rules are the actual security layer — the UI guard is just UX.

---

## 6-week delivery plan

### Week 1 — Foundation ✅ Complete

- Dependencies installed: `firebase`, `next-intl`, `react-markdown`, `swr`, `dompurify`
- TypeScript types: `NewsItem`, `Wine`, `Vineyard`, `ApiResponse`
- Static data files: `wines.json`, `vineyards.json`
- i18n routing config (`src/i18n/routing.ts`, `request.ts`, `navigation.ts`)
- Full translation files: `messages/el.json`, `messages/en.json`
- Firebase singleton (`src/lib/firebase.ts`)
- Auth helpers (`src/lib/auth.ts`)
- Design system CSS variables + utility classes (`globals.css`)
- Security response headers (`next.config.ts`)
- Middleware with locale routing + admin exclusion

### Week 2 — Pages & Content ✅ Complete

- Sticky header: desktop 3-column split nav + logo + language switcher; mobile burger menu
- Footer: 3-column (brand + organic badge, nav, contact + social)
- **Home:** hero, about snapshot, 3-wine preview, news placeholder, vineyard banner
- **About:** history timeline, Argatia heritage blockquote, 3 philosophy pillars, 4 team bios
- **Vineyards:** 3 vineyard cards with terrain specs (elevation, soil, varieties), organic certification badge
- **Wines:** alternating bottle + details layout, tasting notes, food pairings, production info
- **News:** static shell (Firebase wired in Week 4)
- **Contact:** contact details, accessible validated form, Google Maps embed
- Removed stale `src/app/page.tsx` and `src/app/about/` (pre-i18n)

### Week 3 — Authentication ✅ Complete

- `AuthProvider` context (`src/components/auth/auth-provider.tsx`)
- `AuthGuard` component — redirects unauthenticated users (`src/components/auth/auth-guard.tsx`)
- `useAuth()` hook (`src/hooks/useAuth.ts`)
- `/admin/login` — Firebase email/password login, Greek error messages
- `/admin` — protected dashboard shell with quick-action cards
- `firestore.rules` + `storage.rules`

### Week 4 — News Management ✅ Complete

**Architecture decision:** Admin writes go directly through the Firebase client SDK (no server-side admin routes needed — Firestore rules are the true security layer). API routes cover public reads only.

**Library layer:**
- `src/lib/validation.ts` — HTML-aware validation (`requireHtmlContent` strips tags before checking emptiness); `toOptionalString`/`toOptionalHtml` return `undefined` (not `""`) so Firestore never receives empty optional fields
- `src/lib/storage.ts` — `uploadNewsImage`, `deleteNewsImage` (silent failure)
- `src/lib/news.ts` — Full Firestore CRUD with `stripUndefined()` utility to prevent `invalid data: undefined` write errors; cursor-based pagination; `toClientNewsItem` Timestamp → ISO converter

**API routes (public reads only):**
- `src/app/api/news/route.ts` — `GET` published news (paginated, cached, `force-dynamic`)
- `src/app/api/news/[id]/route.ts` — `GET` single published article

**Hooks:**
- `src/hooks/useNews.ts` — `useNewsList`, `useFeaturedNews`, `useNewsItem` (SWR via API); `useAdminNewsList`, `useAdminNewsItem` (SWR directly against Firestore for draft access)

**Components:**
- `src/components/news/news-card.tsx` — Bilingual public news card
- `src/components/news/news-grid.tsx` — Paginated grid with load-more, skeleton, empty/error states
- `src/components/home/featured-news.tsx` — Home page featured news (replaces static skeleton)
- `src/components/admin/admin-header.tsx` — Shared admin top bar
- `src/components/admin/rich-text-editor.tsx` — TipTap WYSIWYG editor (bold, italic, underline, headings H2–H4, lists, blockquote, HR, alignment, link, image, undo/redo); full error-state styling
- `src/components/admin/news-form.tsx` — Bilingual create/edit form; WYSIWYG content; image upload with preview; publish/featured toggles; preview panel (DOMPurify HTML); delete with confirmation; validation summary banner; scroll-to-first-error; red label/border/glow on invalid fields

**Pages:**
- `src/app/admin/news/page.tsx` — Admin news list (all articles incl. drafts), publish/featured toggles
- `src/app/admin/news/new/page.tsx` — Create article
- `src/app/admin/news/[id]/page.tsx` — Edit article (loading/404 states)
- `src/app/[locale]/news/[id]/page.tsx` — Public article view; server-rendered; `generateMetadata` with OG tags; `ArticleContent` client component for DOMPurify post-hydration sanitization

**Integrations:**
- Home page news section replaced with `<FeaturedNews />`
- News listing page replaced with `<NewsGrid />` (async server component)
- Admin dashboard "coming soon" placeholder removed

### Week 5 — Performance, Security & Polish ✅ Complete

**Architecture fixes (post-Week-4 bugs):**
- **Hydration mismatch fixed** — `[locale]/layout.tsx` was rendering `<html lang><body>` nested inside root layout's `<html><body>`. Browser auto-corrected the invalid HTML, React DOM didn't match, entire tree was regenerated client-side on every navigation. Fix: locale layout no longer renders `<html>/<body>`; root layout uses `getLocale()` from `next-intl/server` to set `lang` (falls back to `"el"` for non-locale routes like `/admin`)
- **News article page converted to server component** — was `"use client"` + SWR, causing a visible loading skeleton on every navigation. Now fetches directly from Firestore during SSR; page arrives pre-rendered. Bundle: 285 kB → 132 kB. `generateMetadata` added for per-article OG tags. `ArticleContent` client component handles DOMPurify sanitization post-hydration

**Week 5 tasks:**
- [x] **`@tailwindcss/typography` plugin** — already installed (v0.5.19); prose overrides in `globals.css`; article page uses `prose` classes via `ArticleContent`
- [x] **`next/image` audit** — `priority` on logo + article hero; `sizes` added to all bottle images; lazy load on below-fold images
- [x] **Contact form API route** (`src/app/api/contact/route.ts`) — server-side validation; in-memory rate limiting (5 req/hr per IP); form wired to API (no more mailto fallback); logs submissions to server console (Vercel Functions logs); TODO: wire email service (Resend/SendGrid) for actual delivery
- [x] **JSON-LD structured data** — `NewsArticle` on `/[locale]/news/[id]`; `Winery` schema on home; `ItemList + Product` on wines page
- [x] **`sitemap.xml`** — `src/app/sitemap.ts`; static pages × 2 locales + dynamic news articles (fetched from `/api/news`); 1h ISR revalidation
- [x] **`robots.txt`** — `src/app/robots.ts`; allow `/`, disallow `/admin` + `/api/`
- [ ] **Lighthouse audit** — run on Home, News, Article pages after Firebase is live; target > 90 all categories
- [x] **WCAG 2.1 AA pass** — focus rings on all interactive elements; skip-link in locale layout; `aria-label` on language switcher; burger button `aria-controls` + proper `focus-visible` gold ring (previously `outline-none` which removed the ring entirely)
- [ ] **Firestore/Storage rules finalisation** — replace `REPLACE_WITH_OWNER_UID` in `storage.rules` with real UID; `firebase deploy --only firestore:rules,storage`
- [x] **ISR on news listing** — `export const revalidate = 3600` on `/[locale]/news/page.tsx`

### Week 6 — SEO, Docs & Launch

- [ ] Email delivery for contact form — wire Resend / SendGrid / SMTP (API key + `from` address required)
- [ ] Lighthouse audit — run after Firebase credentials are live; fix any regressions
- [ ] Firestore + Storage rules — replace `REPLACE_WITH_OWNER_UID`, deploy
- [ ] `hreflang` alternates — already in `generateMetadata` on all pages; verify in GSC after deploy
- [ ] Documentation: `README.md`, `ARCHITECTURE.md`, `CONTRIBUTING.md`, `API.md`
- [ ] JSDoc on all lib functions and hooks
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Deploy to Vercel (`argatia.gr`), Firebase rules deployed
- [ ] Vercel Analytics + Google Analytics 4 setup
- [ ] Owner walkthrough: admin login, create/edit/publish news, image upload, featured toggle

---

## Performance targets

| Metric | Target |
|---|---|
| LCP | < 2.5s |
| FID / INP | < 100ms |
| CLS | < 0.1 |
| TTI | < 3.5s |
| Lighthouse score | > 90 all categories |

---

## Security checklist

- [x] Firestore rules: public read only `published == true`, writes require owner UID (`firestore.rules`)
- [x] Storage rules: public read, owner-only write (`storage.rules`)
- [ ] `REPLACE_WITH_OWNER_UID` replaced in `storage.rules` before deploy (Firestore rules already have real UID)
- [x] DOMPurify sanitisation on rendered article HTML — client-side via `ArticleContent` post-hydration
- [ ] Input validation (Zod) on all API routes — currently manual validation; Zod optional upgrade
- [x] Rate limiting on `/api/contact` — 5 req/hr per IP (in-memory); Firebase Auth handles login rate limiting natively
- [x] Security response headers in `next.config.ts` (X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy)
- [x] `robots.txt` disallows `/admin` and `/api/`
- [x] `.env.local` never committed (confirmed in `.gitignore`)

---

## Deployment

| Service | Purpose |
|---|---|
| Vercel | Frontend hosting, auto-deploy on push to `main` |
| Firebase | Auth, Firestore (news DB), Storage (images) |
| Custom domain | `argatia.gr` (DNS → Vercel) |

**Monitoring:**
- Vercel Analytics (Core Web Vitals, deployments)
- Google Analytics 4 (user behaviour)
- Firebase Console (DB reads/writes, storage usage)

---

## Owner training (pre-launch)

Before handing over, walk the owner through:

1. Logging in at `/admin/login`
2. Creating a news article (Greek required, English optional)
3. Uploading and cropping a cover image
4. Toggling `published` (draft → live)
5. Toggling `featured` (appears on home page — max 5)
6. Editing and deleting articles
7. What happens when more than 5 articles are marked featured
