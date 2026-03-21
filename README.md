# smart-charging (tts64.ru)

Next.js 14 (App Router) site for ООО «Умная зарядка» — lead generation, catalog, admin CMS.

See `.cursorrules` for stack, structure, and conventions. Session handoff: `PROJECT_MEMORY.md`.

**Cursor:** open this directory (`smart-charging/`) as the workspace root so `.cursorrules` is picked up (not a parent folder that only contains specs).

## Quick start

```bash
pnpm install
cp .env.example .env.local
# Ensure DATABASE_URL matches your Postgres (see docker-compose.yml for local defaults)
pnpm dev
```

Package manager: **pnpm** (`corepack enable pnpm` or `npx pnpm@9`).

## Local database

```bash
docker compose up -d
export DATABASE_URL="postgresql://smartcharging:localdev123@127.0.0.1:5432/smart_charging?schema=public"
pnpm prisma db push
```

## Scripts

| Script          | Description               |
| --------------- | ------------------------- |
| `pnpm dev`      | Next.js dev server        |
| `pnpm build`    | `prisma generate` + build |
| `pnpm lint`     | ESLint                    |
| `pnpm format`   | Prettier (writes)         |
| `pnpm db:*`     | Prisma shortcuts          |

## Config note

Next.js **14.2** loads `next.config.mjs` / `next.config.js` only — **`next.config.ts` is not supported** in this version. Image `remotePatterns` live in `next.config.mjs`.

## Placeholder scaffolding

`scripts/generate-placeholders.mjs` was used once to emit route/component stubs; safe to delete or keep for reference.
