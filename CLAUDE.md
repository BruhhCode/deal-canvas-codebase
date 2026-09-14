# DealsCanvas

> **Cross-repo note**: this site shares one Supabase project with a separate
> repo, `Deal canvas admin panel` (the actively developed admin dashboard —
> the `admin.tsx` route in *this* repo is a legacy/lightweight one). The DB
> schema, RLS state, realtime config, and pricing contract both repos must
> agree on live in **[`docs/shared-context.md`](docs/shared-context.md)** —
> read it before touching anything Supabase-related, and update it in both
> repos together if you change the contract.

A fashion-deal-aggregator site (formerly "Deal Canvas") built with **TanStack Start** (React 19, file-based routing via `@tanstack/react-router`) + **Vite** + **Tailwind v4**. It lets shoppers search/compare prices for the same product across multiple stores, browse curated deals/coupons/sale events, and now has a real-time admin dashboard backed by **Supabase**.

## Stack

- **Framework**: TanStack Start (`@tanstack/react-start`) — SSR + file-based routes in `src/routes/`.
- **Build**: Vite 8, wrapped by `@lovable.dev/vite-tanstack-config` (keeps the project shaped for Lovable's sandbox preview — server shape, HMR, port detection). This wrapper is a deliberate dependency, not just branding.
- **Styling**: Tailwind v4 + shadcn/ui primitives in `src/components/ui/`.
- **Deploy target**: `nitro` (Cloudflare-oriented build), single deployable app today.
- **Data**: static generated catalog (`src/data/`) **mirrored into Supabase**, kept in sync live via Supabase Realtime (see below).

## Project structure

```
src/
  routes/            file-based routes (index, shop, product.$slug, brand.$slug, store.$slug,
                      deal.$slug, deals, sales-calendar, admin, ...)
  components/         Header, Footer, ProductCard, PriceCompare, DealCard, etc. + components/ui (shadcn)
  data/
    products.ts       Product/Offer types + helpers (bestOffer, filterProducts, sortProducts, ...)
    products.generated.ts   ~1300+ products, auto-generated (see scripts/import-products.ts)
    catalog.ts        Brand types, brands[], deals[], coupons[]
    stores.ts         Store type, stores[]
    deal-products.ts  affiliate URL helpers for deals
  lib/
    currency.tsx      legacy "base unit" pricing + CurrencyProvider (see Pricing below)
    live-catalog.ts   Supabase Realtime -> in-memory catalog sync (see below)
    supabase.ts       browser Supabase client (anon key only)
    categorize.ts, seeded-shuffle.ts, utils.ts
scripts/
  import-products.ts, enrich-products.ts, enrich-images.ts, normalize-categories.ts
                      generate/maintain src/data/products.generated.ts
  seed-supabase.ts    pushes the static catalog into Supabase (re-runnable)
supabase/
  schema.sql          full DB schema, RLS policies, realtime publication setup
```

## Pricing — "legacy base unit" (important, easy to get wrong)

`Offer.price` / `Deal.price` are **not stored in real USD** anywhere in the codebase or database — they're stored in a legacy base unit where `BASE_TO_USD = 1/83` (`src/lib/currency.tsx`).

- `toUsd(amount)` / `formatUsd(amount)` — base unit → real USD, for non-hook contexts (loaders, JSON-LD).
- `fromUsd(usd)` — inverse, real USD → base unit, for writing admin input back to storage.
- `useCurrency()` — React context exposing `convert`/`format`/`toBase` for the user-facing currency switcher (USD/EUR/GBP/AED), all derived from the same base unit.

**Any new code that reads or writes a price must go through one of these conversions.** Never compare/display a raw `.price` value as if it were USD.

## Product identity: `slug`, not `id`

The scraped/imported catalog's `id` field (e.g. `"PI-0081"`) is **not globally unique** — ids are reused across unrelated products from different source import files. `slug` is the reliable unique key (routing already keyed off it), so:
- Supabase's `products` table has `slug` as primary key, with the old `id` renamed to `source_id`.
- `offers.product_slug` (not `product_id`) is the FK into `products`.
- One genuine duplicate slug was found and fixed by hand (`adidas-samba-og-shoes` → `...-2` for one of the two colliding products) — if you ever see a "duplicate key" error seeding `products`, look for this class of bug again.

## Supabase integration

### Why / what

The admin dashboard (`src/routes/admin.tsx`) needs to edit prices/availability/deal status and have those changes appear on the live site **instantly, without a page refresh** — real Supabase Realtime subscriptions, not per-request polling.

### Credentials & env vars

- `.env` (git-ignored, never commit) holds:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY` — safe for the browser, used by `src/lib/supabase.ts`.
  - `SUPABASE_SERVICE_ROLE_KEY` — **server/script-only**, used only by `scripts/seed-supabase.ts`. Never prefix it with `VITE_`, never log it, never let it reach client bundles.
- `.env.example` documents the three keys with empty values.
- `.gitignore` covers `.env` / `.env.*` (with `!.env.example` carved out).

### Schema (`supabase/schema.sql`)

Run once in the Supabase SQL Editor. Tables: `brands`, `stores` (kept, `create table if not exists`), `products`, `offers`, `deals`, `sale_events`, `coupons` (dropped + recreated on each run to guarantee they match the file exactly — earlier iterations hit stray FK dependencies from an unrelated pre-existing `deals` table in the same project, hence `cascade` on the drops).

- RLS is **enabled on all 7 tables**.
- **Read**: public (`anon` key) can read everything.
- **Write**: public (`anon` key) can write to `offers`, `deals`, `sale_events` only — this is intentionally open right now because the admin dashboard has **no real authentication yet**. `schema.sql` has a comment flagging this. **Tighten these write policies (e.g. require an authenticated `admin` role) before deploying the admin app anywhere publicly reachable.**
- Realtime publication (`supabase_realtime`) includes `offers`, `deals`, `sale_events` (and `products`, added later for admin-created products — see `live-catalog.ts` below).

### Seeding (`scripts/seed-supabase.ts`)

`npx tsx scripts/seed-supabase.ts` — re-runnable. Loads `src/data/*` through a throwaway **Vite SSR dev server** (`vite.createServer` + `ssrLoadModule`), not plain Node/tsx, because those data files import image assets (`@/assets/*.jpg`) and use the `@` path alias, which plain Node can't resolve. Upserts everything in batches of 500; `offers` has no natural unique key so it's deleted-and-reinserted on each run instead of upserted.

### Real-time sync (`src/lib/live-catalog.ts`)

The site's data layer is deeply synchronous/module-scope (`products`, `deals`, `saleEvents` arrays imported directly by 40+ files) — rewriting it to hooks/async fetching was out of scope. Instead:

- `initLiveCatalog()` (called once from `src/routes/__root.tsx` in a `useEffect`, client-only) subscribes to Postgres change events on `products`, `offers`, `deals`, `sale_events`, and **mutates the existing shared array/objects in place** (`Object.assign`, `push`, `splice`) rather than replacing them.
- On mount it also does a one-time `hydrateFromSupabase()` pull of current DB state — Realtime only streams changes that happen *while subscribed*, so this catches anything added/edited while no browser tab was open (e.g. a product added in admin overnight), and self-heals drift generally.
- `useCatalogVersion()` — a `useSyncExternalStore` hook — must be called by any component that renders live price/availability/deal/sale-event data, so React knows to re-render when a mutation lands. **Already wired into**: `ProductCard`, `PriceCompare`, `DealCard`, and the routes `shop`, `deals`, `sales-calendar`, `product.$slug`, `admin`, `index` (homepage compare section), `deal.$slug`. **If you add a new place that reads `.price`/`.availability`/deal fields directly (not through `ProductCard`/`PriceCompare`/`DealCard`), you must add `useCatalogVersion()` there too** — this exact gap caused a real bug once (homepage's "Same Product. Different Price." section and the deal detail page silently didn't update live because they read prices directly and had no hook call).
- Handles out-of-order delivery: a product row and its first offer are written as two separate inserts with no ordering guarantee — `pendingProductsBySlug`/`pendingOffersBySlug` buffer whichever arrives first so a product is never published into the shared `products` array with zero offers (several consumers, e.g. `bestOffer`, assume every product has ≥1 offer and will throw on an empty array).

### Admin dashboard (`src/routes/admin.tsx`)

- Products tab: `ProductRow` edits a product's best offer's price + availability, writes via `supabase.from("offers").update({ price: fromUsd(...), availability }).eq("product_slug", p.slug).eq("store", offer.store)`.
- Deals tab: `DealRow` edits price + status, writes via `supabase.from("deals").update({ price: fromUsd(...), status }).eq("id", d.id)`.
- Both show a toast on success/failure and disable Save until the row is actually dirty.
- **No real authentication exists on this route today** — it's reachable by anyone who finds the URL, and (per the RLS note above) anyone with the anon key can write directly to `offers`/`deals`/`sale_events` even without going through the UI. Do not deploy this publicly as-is.

## Known gotchas / history worth knowing before touching this area

- Postgres reserved keyword: `sale_events.window` must stay quoted (`"window"`) in SQL.
- `exactOptionalPropertyTypes: true` is on in `tsconfig` — optional fields typed as `field?: T` (not `T | undefined`) need conditional spreads (`...(x ? { field: x } : {})`), not `field: x ?? undefined`.
- `import.meta.env.SOME_VAR` needs bracket notation (`import.meta.env["SOME_VAR"]`) under this TS config (TS4111).
- Dead product links: `offerAffiliateUrl`/`dealAffiliateUrl` fall back to the brand homepage when a product's own affiliate link is unavailable/dead.

## Verification habits used on this project

- Any non-trivial Supabase/data change gets checked with a small throwaway script (service-role key, run via `npx tsx`) rather than trusted on faith — e.g. confirming a write round-trips through Realtime within a few seconds, confirming RLS still allows the exact read/write shape the app uses. These scripts are deleted immediately after use (`scripts/tmp-*.ts` is the convention) — they should never be committed.
- `npx tsc --noEmit` after any TypeScript change touching `live-catalog.ts`, `admin.tsx`, or the currency helpers.
