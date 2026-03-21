# PROJECT_MEMORY — ООО «Умная зарядка» (tts64.ru)

**Canonical copy:** this file lives at the Next.js app root (`smart-charging/PROJECT_MEMORY.md`). Do not duplicate — update here only.

Persistent project context for long sessions. Update after major milestones. No secrets in this file.

---

## Project Overview

- **Business:** Official TSS (generators) and Pandora (EV charging) dealer in Saratov, Russia. Service company (warranty/post-warranty). Geography: Saratov and nearby regions; nationwide delivery not required.
- **Primary goal:** Lead generation for turnkey installation/engineering — **≥10 qualified leads/month** (minimum: name + phone). Secondary: credibility and expertise (image site).
- **Traffic strategy:** Organic SEO first; paid ads optional post-launch.
- **Product scope:** Portable generators (≤10 kW, AVR emphasized), industrial (>10 kW, segment >100 kW), Pandora EV chargers (filters: power, connector Type2/CCS2/CHAdeMO, use case).
- **Conversion funnel:** Price → callback; cases → commercial offer; undecided → quiz → email result; video → callback. Lead magnets: B2C/B2B PDFs after form submission.
- **Lead handling:** **No CRM.** Notifications via Telegram bot to a closed manager chat + email to managers. Callback phone noted in ТЗ: +79172100660 (verify in production config).
- **Non-goals:** E-commerce checkout, visitor-facing auth, third-party CRM integration.

---

## Tech Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | Next.js **14.2.x** (App Router) | No Pages Router |
| Language | TypeScript 5.x | `strict: true` |
| Runtime | Node.js 20 LTS | |
| DB | PostgreSQL 16 | |
| ORM | Prisma 5.x | Single `schema.prisma`, migrations versioned |
| Styling | Tailwind CSS 3.4 | No CSS Modules / styled-components |
| UI | Headless UI + custom primitives | No MUI/Chakra/Ant/shadcn |
| Forms | React Hook Form + Zod | Shared schemas client + server |
| Auth | NextAuth.js v5 | Credentials only; admin routes |
| Rich text | TipTap | Admin blog/content |
| Email | Nodemailer | Beget SMTP |
| Telegram | grammy | Async notifications; failure must not block lead save |
| HTML sanitization | **sanitize-html** | `src/lib/sanitize.ts` allowlist for `dangerouslySetInnerHTML` (SSR-safe; avoids `isomorphic-dompurify`/jsdom breaking build) |
| Images | `next/image` + Sharp | WebP; `remotePatterns` in `next.config.mjs` |
| Icons | lucide-react | |
| Analytics | Yandex Metrika + GA4 | `AnalyticsScripts` + `lib/analytics.ts` |
| Animations | Framer Motion | Sparingly |
| Package manager | **pnpm** | Not npm/yarn |
| Tailwind typography | `@tailwindcss/typography` | `prose` for product HTML descriptions |
| Deploy target | Beget VPS | Docker: `Dockerfile` (`output: 'standalone'`), `docker-compose.prod.yml` |

**Performance / SEO targets:** LCP ≤ 2.5s mobile (PSI); ISR where configured; `sitemap.ts` / `robots.ts`; JSON-LD on key pages.

---

## Current Status (audit sync)

**Workspace:** Application code lives in **`smart-charging/`**; parent `Gen/` may hold specs — **not** the app root for tooling.

**Implemented end-to-end**

- **Homepage** (`/`): `dynamic = 'force-dynamic'` (DB). **Hero** (`HOME_HERO_IMAGE` / `main2`), **CatalogPreview** — Prisma: featured products + **category card images** = first image of latest in-stock product per `CategoryType`. **ProjectsCarousel** — `getHomepageProjects()` from Prisma; **MOCK_PROJECTS** only if DB returns zero rows.
- **Catalog:** Listings + product detail for portable/industrial/charging; filters; JSON-LD Product on detail; product HTML via **`sanitizeHtml`** in `ProductDetailView`.
- **Comparison:** `useComparison`, `POST /api/comparison`, bar + modal + `CompareButton`.
- **Quiz:** `/quiz`, `POST /api/quiz`, `POST /api/quiz/partial`, hooks + exit intent, analytics helpers.
- **Leads:** `POST /api/leads` (rate limit 5/min/IP), Telegram + email; **`leadMagnetType`** → PDF attachments from `public/docs/lead-magnet-b2c.pdf` / `b2b.pdf`.
- **Contacts:** `YandexMap` — iframe without key; optional `NEXT_PUBLIC_YANDEX_MAPS_API_KEY` for JS API (`COMPANY_MAP_CENTER` in `constants.ts`).
- **Public content (STEP A):** **`/blog`**, **`/blog/[slug]`**, **`/projects`**, **`/projects/[slug]`**, **`/documents`** — Prisma (`published` where applicable), `dynamic = 'force-dynamic'`; blog/project body HTML via **`sanitizeHtml`**; **`MOCK_PROJECTS`** remains only for **ProjectsCarousel** fallback when DB has no projects.
- **Admin UI:** login, dashboard, **products** / **categories** (CRUD), **blog** / **projects** / **documents** (CRUD), **leads** list/detail; **settings**, **pages**, **filter-pages** (screens + **STEP B** APIs).
- **API routes implemented:** `auth`, `products`, `categories`, `leads`, `upload`, `quiz`, `quiz/partial`, `comparison`, `projects`, `projects/[id]`, `blog`, `blog/[id]`, `documents`, `documents/[id]`, **`settings`** (GET + POST upsert map), **`pages`** (GET list), **`pages/[id]`** (GET/PUT/DELETE), **`filter-pages`** + **`filter-pages/[id]`** (CRUD). `dynamic = 'force-dynamic'` on these route files.
- **SEO infra:** `sitemap.ts` (dynamic; Prisma: products, projects, blog posts + static routes), `robots.ts` (`disallow` `/admin/`, `/api/`, `/_next/`), `lib/seo.ts`, canonical/metadata on major public routes.
- **Ops:** `Dockerfile`, `docker-compose.yml` (dev DB), `docker-compose.prod.yml`, `.env.production.example`, `.dockerignore`.

**Partial / inconsistent (optional)**

- **Homepage** FAQ + testimonials (`FAQSection`, `TestimonialsSection`) still use **mock** copy from `mockData.ts`.

**Assets:** `public/content/main1.png`, `main2.png`, `public/images/logo.png` — placeholders unless replaced for production.

**Verification:** Run `npx tsc --noEmit` and `pnpm build` from `smart-charging/` before release (DB needed for runtime; `sitemap` is dynamic).

---

## Recent Changes

| Date | Change |
|------|--------|
| 2026-03-22 | **Deploy prep:** репозиторий **запушен** на GitHub (`main` → `git@github.com:weirdsar/smart-charging.git`). Добавлены **`vercel.json`** (`pnpm install --frozen-lockfile`, `pnpm run build`), **`docs/DEPLOY_VERCEL.md`** — чеклист Neon → `db push` / `seed` → Vercel env → домен. |
| 2026-03-21 | **STEP B:** Оставшиеся admin API — **`/api/settings`** (GET: map ключ→значение, POST: upsert `z.record` строк), **`/api/pages`** (GET список), **`/api/pages/[id]`** (GET/PUT/DELETE, `revalidatePath`), **`/api/filter-pages`** + **`/api/filter-pages/[id]`** (CRUD; POST требует **`categoryId`** + опционально **`appliedFilters`** как JSON-объект). Заглушки 501 сняты. |
| 2026-03-21 | **STEP A:** Публичные **блог / проекты / документы** переведены на **Prisma** — `src/app/(site)/blog/page.tsx`, `blog/[slug]/page.tsx`, `projects/page.tsx`, `projects/[slug]/page.tsx`, `documents/page.tsx`; убраны `MOCK_BLOG_*`, документы и блоки блога из `mockData.ts` (остались `MOCK_PRODUCTS`, `MOCK_PROJECTS`, FAQ, отзывы). `dynamic = 'force-dynamic'`; URL в **sitemap** соответствуют контенту из БД. |
| 2026-03-21 | **Project memory audit** — `PROJECT_MEMORY.md` fully synced with codebase: Current Status, Backlog, Known Issues; removed obsolete «CatalogPreview = MOCK» note; documented blog/projects public vs Prisma mismatch and remaining **501** APIs. |
| 2026-03-21 | **Homepage «Наш каталог»:** откат стилизованных WebP-обложек; снова **первое фото товара из Prisma** по типу категории (`CatalogPreview`). Удалены `scripts/stylize-catalog-covers.mjs` и `public/images/catalog-covers/*`. |
| 2026-03-21 | **STEP 18: Final polish** — `src/components/site/YandexMap.tsx` (Yandex Map iframe by default; JS API + placemark when `NEXT_PUBLIC_YANDEX_MAPS_API_KEY` set). `COMPANY_MAP_CENTER` in `constants.ts`. `/contacts`: map replaces placeholder. **`public/docs/lead-magnet-b2c.pdf`**, **`lead-magnet-b2b.pdf`** (placeholder PDFs). `email.ts`: `getLeadMagnetAttachments`, `leadMagnetType` on `sendEmail` → attachments `pamyatka.pdf` / `oprosnik.pdf`; `/api/leads`, `/api/quiz` pass `leadMagnetType`. **`public/content/main1.png`**, **`main2.png`** (hero placeholders), **`public/images/logo.png`** (Schema.org). `.env.example` / `.env.production.example`: optional maps key. |
| 2026-03-21 | **STEP 17: Security + Docker** — `src/lib/sanitize.ts` (`sanitizeHtml` via **sanitize-html** allowlist). `ProductDetailView` sanitizes product `description`. `next.config.mjs`: `output: 'standalone'`. **`Dockerfile`**, **`docker-compose.prod.yml`**, **`.env.production.example`**, **`.dockerignore`**. `sitemap.ts`: `dynamic = 'force-dynamic'` so `next build` does not require DB at compile time. |
| 2026-03-21 | **STEP 16: Product comparison** — `useComparison`, `POST /api/comparison`, `ComparisonBar`, `ComparisonModal`, `CompareButton`. |
| 2026-03-21 | **STEP 15: Admin CRUD for content** — API + admin UI for projects, blog, documents; validations in `validations.ts`; `POST /api/upload` for images/PDFs. |
| 2026-03-21 | **STEP 14: Quiz funnel** — `/quiz`, `/api/quiz*`, partial save, exit intent, analytics hooks. |
| 2026-03-21 | **STEP 13: Homepage catalog fix** — `CatalogPreview` server component + Prisma featured products; `homepage-data.ts` for projects carousel. |

*(Older rows omitted here; see git history if needed.)*

---

## Architectural Decisions

1. **Custom CMS in-app (Next.js admin)** — single codebase, Prisma; aligns with ТЗ “custom / no constructor limits”.
2. **No CRM** — leads in DB + Telegram + email.
3. **Filter URLs** — schema supports `FilterPage` + `applied_filters`; public `[...filters]` + editorial SEO not fully wired vs backlog.
4. **Comparison** — up to 4 products (`MAX_COMPARISON_ITEMS`); `localStorage` + `POST /api/comparison`.
5. **Quiz** — dedicated funnel; partial progress + exit capture; Metrika-friendly events in `lib/analytics.ts`.
6. **sanitize-html** for product + **blog/project** HTML output — avoids jsdom during Next SSG/SSR (see `src/lib/sanitize.ts`).
7. **Hosting** — Beget VPS + Docker; domain **tts64.ru**.

---

## Pending Tasks

*Milestone checklist; see **Backlog** for prioritized gaps.*

1. [x] Next.js 14 App Router + strict TS + ESLint/Prettier — **`smart-charging/`**.
2. [x] Prisma schema + seed; [ ] run **`prisma migrate deploy`** on production before go-live.
3. [x] Docker Compose local DB — **`docker-compose.yml`**; [x] production **`Dockerfile`** + **`docker-compose.prod.yml`** + **`.env.production.example`**.
4. [x] Public catalog + product detail + leads + core site pages.
5. [x] Admin: products, categories, upload, **blog, projects, documents**, leads.
6. [x] Quiz UI + `/api/quiz*` + exit intent + partial save; [x] rate limit on `/api/leads`.
7. [x] SEO foundations: sitemap, robots, JSON-LD helpers; [ ] optional full OG/canonical audit; [ ] filter landing URLs + `filter_pages` content.
8. [x] Analytics scripts + `lib/analytics.ts`; [ ] configure Metrika/GA4 goals in vendor UIs.
9. [x] STEP 17–18: XSS sanitization, Docker prod, Yandex map, lead magnet PDFs, placeholder hero/logo.

---

### Backlog (by priority — highest first)

1. [x] **Public blog / projects / documents → Prisma** — **STEP A done** (2026-03-21).
2. **SEO — filter landings** — `[...filters]` + `filter_pages` editorial content; extend sitemap if/when shipped.
3. [x] **Admin APIs (settings / pages / filter-pages)** — **STEP B done** (2026-03-21): реальные handlers вместо 501.
4. **Rate limiting** — extend beyond `/api/leads` for `/api/quiz*` if abuse becomes an issue.
5. **Dependencies** — `dompurify` / `@types/dompurify` appear in `package.json` but **unused** (sanitization uses `sanitize-html`); optional cleanup to reduce bundle confusion.
6. **Assets** — replace placeholder **`logo.png`**, hero **`main1`/`main2`** with final brand files.
7. **Content** — FAQ/testimonials on homepage still mock; can move to CMS/DB later.

---

## Known Issues & Gotchas

- **Cursor workspace:** Use **`smart-charging/`** as the workspace root so `.cursorrules` and `PROJECT_MEMORY.md` apply.
- **pnpm CLI:** If `pnpm` is missing, use `corepack enable pnpm` or `npx pnpm@9 <command>` from `smart-charging/`.
- **next-auth / nodemailer peers:** `pnpm.peerDependencyRules.allowedVersions` allows `nodemailer@7` with `@auth/core` peer range.
- **Next.js dev cache:** White screen / missing `/_next/static` → `pnpm dev:clean` or `rm -rf .next` + restart.
- **`tsc` “`.next/types` not found”:** Stale `tsconfig.tsbuildinfo` — same fix as dev cache.
- **Git:** Often initialized only under `smart-charging/`; parent `Gen/` may not be a git root.
- **Beget / deployment:** SMTP and VPS secrets — environment only.

---

## Environment & Credentials

Placeholders only — copy to `.env.local` / `.env` (gitignored). See **`.env.example`**.

```env
DATABASE_URL="postgresql://..."
AUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"
TELEGRAM_BOT_TOKEN="..."
TELEGRAM_CHAT_ID="..."
SMTP_HOST="smtp.beget.com"
SMTP_PORT="465"
SMTP_USER="..."
SMTP_PASS="..."
EMAIL_FROM="..."
NEXT_PUBLIC_SITE_URL="https://tts64.ru"
NEXT_PUBLIC_YANDEX_METRIKA_ID=""
NEXT_PUBLIC_GA_MEASUREMENT_ID=""
# Optional — Yandex Maps JS API on /contacts
# NEXT_PUBLIC_YANDEX_MAPS_API_KEY=""
```

---

*Last memory sync: **2026-03-22** — GitHub push + Vercel/Neon deploy docs (`docs/DEPLOY_VERCEL.md`, `vercel.json`).*

---

## Production deploy (Vercel + Neon)

- **GitHub:** [weirdsar/smart-charging](https://github.com/weirdsar/smart-charging) — `main` пушится; **подключите репозиторий в Vercel** (Settings → Git), если ещё не сделано — иначе нет автодеплоя и Preview env.
- **Vercel production URL:** [smart-charging-gray.vercel.app](https://smart-charging-gray.vercel.app) (шаг 5–6: env + деплой).
- **Домены в Vercel:** `tts64.ru`, `www.tts64.ru` — добавлены; **осталось в Beget:** A-записи на `76.76.21.21` для `@` и `www` (см. `docs/DEPLOY_VERCEL.md`).
- **Git → Vercel:** подключение репозитория из CLI падает без OAuth в браузере — в [Vercel → Project → Settings → Git](https://vercel.com/dashboard) подключите `weirdsar/smart-charging` вручную.
- **Подробный чеклист:** `docs/DEPLOY_VERCEL.md`.
