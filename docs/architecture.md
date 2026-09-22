# DealsCanvas — architecture

How this repo is put together. For the Supabase schema/RLS contract shared
with the admin panel repo, see [`shared-context.md`](shared-context.md) — this
file is about the site's own code, not the cross-repo data contract.

## Stack

| Layer | Choice |
|---|---|
| Framework | TanStack Start (`@tanstack/react-start` 1.168) — SSR + file-based routing |
| Router | `@tanstack/react-router` 1.170, routes generated into `src/routeTree.gen.ts` |
| UI | React 19 |
| Build | Vite 8, wrapped by `@lovable.dev/vite-tanstack-config` (keeps the dev server shaped for Lovable's sandbox preview — a real dependency, not just branding) |
| Styling | Tailwind v4 (CSS-first config, no `tailwind.config.js`) + shadcn/ui primitives in `src/components/ui/` |
| Data | Supabase (Postgres + Realtime), `@supabase/supabase-js` 2.116 |
| Deploy target | `nitro` (Cloudflare-oriented build) |
| Icons | `lucide-react` 0.575, used at its default stroke width everywhere — never override `strokeWidth` |
| Toasts | `sonner` |

## Directory map

```
src/
  routes/          file-based routes — see "Routes" below
  components/       Header, Footer, Tile (shared card base), ProductCard,
                     DealCard, FilterControls, ProductGallery, ProductImage,
                     BrandMark, StoreMark, WishlistButton, HeroCarousel,
                     SectionHeading, ... + components/ui (shadcn primitives)
  data/
    products.ts      Product/Offer types + filter/sort/search helpers
    products.generated.ts   ~1360+ products, machine-generated (see scripts/)
    catalog.ts        Brand/Deal/Coupon types, brands[], deals[], coupons[]
    stores.ts          Store type, stores[]
    deal-products.ts    affiliate URL helpers for deals
  lib/
    currency.tsx       legacy "base unit" pricing + CurrencyProvider
    live-catalog.ts     Supabase Realtime → in-memory catalog sync
    supabase.ts         browser Supabase client (anon key only)
    categorize.ts, seeded-shuffle.ts, utils.ts
    error-capture.ts    recovers the original Error/stack when h3 has
                         already flattened a throw into a generic 500
    error-page.ts        renders that recovered error for the error boundary
scripts/
  import-products.ts, enrich-products.ts, enrich-images.ts,
  normalize-categories.ts, upgrade-image-resolution.ts
                        generate/maintain products.generated.ts
  seed-supabase.ts      pushes the static catalog into Supabase (re-runnable)
  seed-reviews.ts        backfills product reviews
  audit-product-links.ts live-checks offer URLs, clears confirmed-dead ones
supabase/
  schema.sql            full DB schema, RLS policies, realtime publication
docs/
  shared-context.md     cross-repo DB/RLS contract (site ⇄ admin panel)
  architecture.md        this file
  design-system.md       tokens + component conventions
  project-brief.md        what this product is and who it's for
```

## Data flow

There are three layers, and it matters which one a given piece of code is
actually reading:

1. **Static generated catalog** (`src/data/products.generated.ts`,
   `catalog.ts`, `stores.ts`) — the source of truth for anything not editable
   live. Built/maintained by the `scripts/*.ts` import/enrich pipeline from
   scraped CSVs, checked into git.
2. **Supabase mirror** — the same data, pushed into Postgres by
   `scripts/seed-supabase.ts`. This is what the separate admin-panel repo
   edits (prices, availability, deal status, nav items, CMS pages, FAQs).
3. **Live sync back into the static arrays** (`src/lib/live-catalog.ts`) —
   subscribes to Postgres changes on `products`/`offers`/`deals`/
   `sale_events` and **mutates the existing in-memory arrays in place**
   (`Object.assign`, `push`, `splice`), because the site's component tree
   reads those module-scope arrays directly (`products`, `deals`,
   `saleEvents` imported by 40+ files) rather than through a data-fetching
   layer. `useCatalogVersion()` (a `useSyncExternalStore` hook) is what tells
   React to re-render when a mutation lands — any component reading a live
   price/availability/deal/sale-event field directly (not through
   `ProductCard`/`Tile`/`PriceCompare`/`DealCard`, which already call it)
   must call it too, or it'll silently show stale data.

Editing `products.generated.ts` (a slug fix, an image URL change) only
reaches the live site after `scripts/seed-supabase.ts` is re-run — the app
reads from Supabase via `live-catalog.ts`, not the bundled file directly, at
runtime.

## Pricing — legacy base unit

Every price in the data model (`Offer.price`, `Deal.price`, etc.) is stored
in a legacy base unit, not real USD: `BASE_TO_USD = 1/83` (`src/lib/currency.tsx`).
`toUsd`/`formatUsd` convert base → USD for non-hook contexts; `fromUsd` is the
inverse; `useCurrency()` exposes the user-facing multi-currency
(USD/EUR/GBP/AED) conversion built on the same base unit. Any new code that
reads or writes a price must go through one of these — never compare or
display a raw `.price` as if it were USD.

## Product identity

`products.slug` is the real primary key, not `id` (the scraped catalog's
`id`, e.g. `"PI-0081"`, is reused across unrelated products and kept only as
`source_id` for traceability). Routing, `offers.product_slug`, and every
cross-reference in this codebase key off `slug`.

## Auth & data access

The public site itself has **no authentication** — every page is public, and
the only thing the site ever writes directly to Supabase is `reviews`
(product page) and `contact_messages` (`/contact`), both insert-only,
anon-key, no login required. All catalog/price/deal editing happens in the
separate `Deal canvas admin panel` repo, which has real Supabase Auth gated
by an `admin_users` table + `is_admin()` SQL function. Full RLS state is
documented in [`shared-context.md`](shared-context.md) — it changes
independently of this repo's code, so treat that file (and empirical
verification against the live project) as the source of truth, not this one.

`SUPABASE_SERVICE_ROLE_KEY` exists only in this repo's `.env`
(git-ignored), used only by server-side scripts (`seed-supabase.ts`,
`audit-product-links.ts`) — never in a browser bundle.

## Routes

File-based, under `src/routes/`. Notable ones beyond the obvious
(`index`, `shop`, `product.$slug`, `brand.$slug`, `store.$slug`):

- `deal.$slug`, `deals`, `sale.$slug`, `sale` (seasonal-sales calendar —
  distinct from `sales-calendar`, the "today/tomorrow/this week" live
  sales list), `flash-deals`, `coupons`
- `category.$slug`, `brands`, `stores`
- `account` — client-only wishlist (localStorage, see `WishlistButton.tsx`),
  no real user accounts
- `contact`, `faq`, `pages.$slug` (CMS pages authored in the admin panel),
  `guides`, `guides.$slug`
- `search` — search results, separate from `/shop?q=`
- `sitemap[.]xml.ts` — generated sitemap

There is **no `/admin` route in this repo** — a legacy lightweight one was
removed once the separate admin-panel repo took over that job; `/admin` and
`/admin/*` are intercepted at the raw server level (`src/server.ts`) and
return a bare empty 404, not the site's branded not-found page.

## Header nav

The nav shown in `Header.tsx` is **live data**, not hardcoded: it queries a
Supabase `nav_items` table (owned/seeded by the admin panel's Navigation
CMS section) and only falls back to the hardcoded `defaultNav` array in that
file if the table is empty or the query fails. Changing `defaultNav` alone
does not change what's live in production — the `nav_items` rows have to be
updated too (via the admin panel's own UI, or a one-off service-role script;
see git history around the nav-consolidation commit for precedent).

## Build & dev

- `npm run dev` — Vite dev server via the Lovable-sandbox-shaped config.
- `npm run build` / `npm run preview` — production build / preview it.
- `npm run lint` (eslint) / `npm run format` (prettier --write).
- `npx tsc --noEmit` after any non-trivial TypeScript change — the fastest
  correctness check, and the one most consistently run in practice.
- `exactOptionalPropertyTypes: true` is on — optional props typed `field?: T`
  need a conditional spread (`...(x ? { field: x } : {})`) or an explicit
  `T | undefined` in the type, not `field: x ?? undefined`.
- `import.meta.env.SOME_VAR` needs bracket notation
  (`import.meta.env["SOME_VAR"]`) under this `tsconfig`.
