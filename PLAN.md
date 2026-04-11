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

### Week 4 — News Management

- `src/lib/firestore.ts` — Firestore CRUD helpers for news
- `src/lib/storage.ts` — Firebase Storage upload/delete helpers
- `src/hooks/useNews.ts` — SWR hooks (`useNewsList`, `useNewsItem`, `useFeaturedNews`)
- `src/app/api/news/route.ts` — `GET` published news (public, paginated)
- `src/app/api/news/[id]/route.ts` — `GET` single article
- `src/app/api/admin/news/route.ts` — `POST` (create), admin-only
- `src/app/api/admin/news/[id]/route.ts` — `PATCH` (update), `DELETE`, admin-only
- `/admin/news` — admin news list with publish/unpublish toggles
- `/admin/news/new` — create form (bilingual fields, Markdown editor, image upload)
- `/admin/news/[id]` — edit form
- Home page featured news section wired to Firestore (replaces placeholder skeleton)
- `src/app/[locale]/news/[slug]/page.tsx` — public article view with `react-markdown`

### Week 5 — Performance & Security

- `next/image` audit across all pages (lazy loading, priority on hero)
- Dynamic import for Markdown renderer (admin only)
- SWR cache configuration (5 min stale-while-revalidate for news)
- Input sanitisation for all Markdown content (DOMPurify)
- Rate limiting on contact form API route (5 req/hr per IP)
- Lighthouse audit — target >90 on all pages
- WCAG 2.1 AA accessibility audit
- `src/lib/validation.ts` — shared Zod schemas for form + API validation

### Week 6 — SEO, Docs & Launch

- JSON-LD structured data: `Organization`, `WineProduct`, `NewsArticle` schemas
- `sitemap.xml` (static pages + dynamic news slugs)
- `robots.txt` (allow `/`, disallow `/admin`)
- `hreflang` alternates on every page (already in `generateMetadata`)
- Documentation: `README.md`, `ARCHITECTURE.md`, `CONTRIBUTING.md`, `API.md`
- JSDoc on all lib functions and hooks
- Cross-browser testing (Chrome, Firefox, Safari, Edge)
- Deploy to Vercel (`argatia.gr`), Firebase rules deployed
- Vercel Analytics + Google Analytics 4 setup
- Owner walkthrough: admin login, create/edit/publish news, image upload, featured toggle

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

- [ ] Firestore rules: public read only `published == true`, writes require owner UID
- [ ] Storage rules: public read, owner-only write
- [ ] `REPLACE_WITH_OWNER_UID` replaced in both rule files before deploy
- [ ] DOMPurify sanitisation on all Markdown rendered content
- [ ] Input validation (Zod) on all API routes
- [ ] Rate limiting on `/api/contact` (5/hr) and auth (Firebase native, 5 attempts)
- [ ] Security response headers in `next.config.ts` (X-Frame-Options, X-Content-Type-Options, etc.)
- [ ] `robots.txt` disallows `/admin`
- [ ] `.env.local` never committed (confirmed in `.gitignore`)

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
