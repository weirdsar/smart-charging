# Deploy: Neon + Vercel (after code is on GitHub)

Repo: `https://github.com/weirdsar/smart-charging`

## Done: Step 2 — Git

- `main` pushed to `origin` (SSH).

## Step 3 — Neon ([neon.tech](https://neon.tech))

1. New project, PostgreSQL **16**, region **eu-central-1**.
2. Copy **connection string** → this is `DATABASE_URL` (keep `?sslmode=require`).

## Step 4 — Schema + seed (run locally once)

```bash
cd smart-charging
export DATABASE_URL="postgresql://...neon...?sslmode=require"
pnpm prisma db push
pnpm prisma db seed
```

## Step 5–6 — Vercel ([dashboard](https://vercel.com/dashboard))

1. **Add New → Project** → import `weirdsar/smart-charging` (or `vercel link` from repo root).
2. Framework: Next.js (auto). Root: `./`.
3. **Connect Git** (Settings → Git): link `weirdsar/smart-charging` so Preview env and auto-deploys work. Without Git, `vercel env add … preview` may fail for branch-scoped variables.
4. **Environment variables** (Production) — minimum:

| Name | Notes |
|------|--------|
| `DATABASE_URL` | Neon connection string |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `NEXTAUTH_SECRET` | same as `AUTH_SECRET` (middleware fallback) |
| `AUTH_TRUST_HOST` | `true` |
| `AUTH_URL` | `https://tts64.ru` after DNS, or `https://<project>.vercel.app` until then |
| `NEXTAUTH_URL` | same as `AUTH_URL` |
| `NEXT_PUBLIC_SITE_URL` | same public URL |
| `NEXT_PUBLIC_COMPANY_PHONE` | e.g. `+79172100660` |
| `TELEGRAM_*`, `SMTP_*`, analytics | as in `.env.example` (optional until forms need them) |

5. **Deploy** (`vercel deploy --prod` or push to `main`).

Build uses `pnpm run build` (`prisma generate` + `next build`). No DB is required at build time for this app (dynamic sitemap).

### Done (2026-03-22)

- Project **smart-charging** on Vercel; production alias: **https://smart-charging-gray.vercel.app**
- `next.config.mjs`: `experimental.outputFileTracingExcludes` for `/api/upload` so `public/images/**` is not bundled into the serverless function (Vercel 300MB limit).
- `.vercelignore`: do not upload `.env` / `.env.*` with CLI deploys.

## Step 8 — Domain `tts64.ru`

Vercel → Project → **Settings → Domains** → add `tts64.ru` / `www`.  
At registrar (e.g. Beget): DNS records exactly as Vercel shows (often **A** or **CNAME** to Vercel).

## Updates

```bash
git add .
git commit -m "chore: message"
git push origin main
```

Vercel redeploys automatically.
