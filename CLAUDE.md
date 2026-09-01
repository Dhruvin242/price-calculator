# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**Bloom Factory** — a pricing calculator and margin tracker for handmade-product makers. A logged-in maker builds up a product's cost (materials, labor, overhead), sees a recommended retail price and profit-health rating, saves products, and tracks live P&L for market "stalls" (pop-up events) by logging sales against them.

Next.js 16 (App Router, React 19) + Supabase (Postgres, Auth, RLS). TypeScript strict. Tailwind v4. shadcn **base-luma** style.

## Commands

```bash
pnpm dev          # dev server (Next.js, Turbopack off by default)
pnpm build        # production build
pnpm start        # serve the production build
pnpm lint         # eslint (eslint-config-next)
pnpm typecheck    # tsc --noEmit — run this to verify types; there is no test suite
pnpm format       # prettier --write on all ts/tsx
```

There are **no tests** in this repo. Verify changes with `pnpm typecheck` and `pnpm lint`. Package manager is **pnpm**.

## Environment

Copy `.env.example` to `.env.local`. Required:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — note the name: the publishable/anon key, **not** `ANON_KEY`. Never use the service-role key client-side.
- `NEXT_PUBLIC_SITE_URL` (optional) — canonical URL for SEO metadata, sitemap, auth redirects.

## Architecture

### Pricing engine — `lib/pricing.ts`
Pure, dependency-free functions that mirror the maker's spreadsheet model. This is the heart of the app; the header comment documents every formula. `calculatePricing(inputs)` is the single source of truth for base cost → recommended price → net profit → health rating (`LOW` <15% margin, `WATCH` 15–25%, `HEALTHY` ≥25%). Server actions call it before persisting so stored summary columns always match the model. Keep this file pure — no React, no Supabase. `lib/stall.ts` holds the separate stall P&L math (`computeStallPnl`).

### Supabase clients — three creators, never share instances
- `lib/client.ts` — browser (`createBrowserClient`), for Client Components.
- `lib/server.ts` — RSC/Server Actions (`createServerClient` over `next/headers` cookies). **Create a new client per function**, never a module global (Fluid compute).
- `lib/middleware.ts` — `updateSession()` refreshes the session on every request and enforces route guards.

### Auth routing
Root middleware lives in **`proxy.ts`** (Next.js 16 renamed the convention from `middleware.ts`), which delegates to `lib/middleware.ts`. It redirects unauthenticated users away from `/dashboard/*` (to `/login?next=…`) and authenticated users away from the auth pages. Don't run code between `createServerClient` and `supabase.auth.getClaims()` in that file. OAuth/email callbacks are handled in `app/auth/callback` and `app/auth/confirm`.

### Data access split
- `lib/queries.ts` — **reads only**, marked `"server-only"`. `requireUser()` redirects to `/login`. `getProfile()` lazily creates a profile row if the signup trigger hasn't run.
- `lib/actions.ts` — **all mutations**, `"use server"`. Every action re-checks `auth.getUser()`, scopes writes with `.eq("user_id", user.id)`, and calls `revalidatePath` on affected routes. Product/stall summary fields are computed via the pricing engine and rounded before insert.

### Types — `types/index.ts`
Central DB-row and payload types. `ProductInputs` is the JSON shape stored in `products.inputs`; the pricing engine's `MaterialLine`/`OverheadLine`/`HealthStatus` types are re-exported through it. Keep row types in sync with the SQL migrations.

### Database — `supabase/migrations/`
Plain SQL, applied in order (`0001_init.sql`, `0002_stalls.sql`) via the Supabase SQL editor or CLI. Tables: `profiles`, `products`, `stalls`, `stall_sales`. **Every table has RLS enabled with owner-only policies** — any new table needs the same. `stall_sales` snapshots product name/price/cost so historical P&L stays stable when a product is later edited or deleted (`product_id` is nullable, `on delete set null`).

### Route groups
- `app/(auth)/*` — login, signup, forgot/reset password (own layout).
- `app/dashboard/*` — the app: calculator, products, stalls (+ `[id]`), profile, settings. Layout calls `requireUser()`.
- `app/page.tsx` + `components/site/*` — marketing landing page.

## UI conventions — shadcn base-luma (NOT Radix)

`components.json` sets `style: base-luma`. The `components/ui/*` primitives wrap **`@base-ui/react`**, not Radix, and the icon library is **`@phosphor-icons/react`** (feature/marketing icons use `lucide-react`). This changes several APIs:

- Polymorphism uses the `render={<El/>}` prop, **not** `asChild`.
- Any `components/ui` file wrapping a Base UI primitive that uses React context (Accordion, Badge, etc.) **must** start with `"use client"`, or the RSC build fails with `createContext is not a function`.
- Accordion uses `multiple` (not `openMultiple`); items need a `value`. Select uses `value`/`onValueChange`.
- `Button` auto-sets `nativeButton={false}` when a `render` prop is present — keep that logic so anchor buttons don't warn.
- This `lucide-react` (1.34.0) has **no brand icons** (Github/Twitter/etc. removed) — use generic icons.

Add shadcn components with `npx shadcn@latest add <name>`. Import via aliases: `@/components/ui`, `@/lib`, `@/lib/utils` (`cn`).
