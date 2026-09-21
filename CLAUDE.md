# DealsCanvas

> **Cross-repo note**: this site shares one Supabase project with a separate
> repo, `Deal canvas admin panel` (the actively developed admin dashboard,
> deployed at https://deal-canvas-admin-panel.vercel.app — this repo has
> **no admin UI of its own**; the two apps are deliberately not merged). The
> DB schema, RLS state, realtime config, and pricing contract both repos must
> agree on live in **[`docs/shared-context.md`](docs/shared-context.md)** —
> read it before touching anything Supabase-related, and update it in both
> repos together if you change the contract.

A fashion-deal-aggregator site (formerly "Deal Canvas") built with **TanStack Start** (React 19, file-based routing via `@tanstack/react-router`) + **Vite** + **Tailwind v4**. It lets shoppers search/compare prices for the same product across multiple stores, browse curated deals/coupons/sale events, and stays in sync with the separate admin panel's edits via **Supabase Realtime**.

## Stack

- **Framework**: TanStack Start (`@tanstack/react-start`) — SSR + file-based routes in `src/routes/`.
- **Build**: Vite 8, wrapped by `@lovable.dev/vite-tanstack-config` (keeps the project shaped for Lovable's sandbox preview — server shape, HMR, port detection). This wrapper is a deliberate dependency, not just branding.
- **Styling**: Tailwind v4 + shadcn/ui primitives in `src/components/ui/`.
- **Deploy target**: `nitro` (Cloudflare-oriented build), single deployable app today.
- **Data**: static generated catalog (`src/data/`) **mirrored into Supabase**, kept in sync live via Supabase Realtime (see below).

## Project structure

```
src/
  routes/            file-based routes (index, shop, product.$slug, brand.$slug, brands, store.$slug,
                      deal.$slug, deals, sales-calendar, contact, ...) — no admin route; that lives
                      in the separate admin-panel repo (see cross-repo note above)
  components/         Header, Footer, ProductCard, PriceCompare, DealCard, ProductGallery,
                      ProductReviews, etc. + components/ui (shadcn)
  data/
    products.ts       Product/Offer types + helpers (bestOffer, filterProducts, sortProducts, ...)
    products.generated.ts   ~1360+ products, auto-generated (see scripts/import-products.ts)
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
  upgrade-image-resolution.ts  rewrites low-res CDN image URLs to higher-res variants (re-runnable)
  seed-reviews.ts     backfills ~5 product-specific reviews per product (re-runnable)
  audit-product-links.ts  live-checks every offer's outbound URL, clears confirmed-dead ones
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
- This has happened twice for `adidas-samba-og-shoes` alone — two separate real products (different `id`, gender, subcategory) collided on the same slug, fixed by hand by renaming the extra one (`...-2`, then `...-3` for the next collision found). If you ever see a "duplicate key" error seeding `products`, grep `products.generated.ts` for duplicate `slug:` values and rename the extras — don't just retry the seed.

## Supabase integration

### Why / what

The separate admin panel repo edits prices/availability/deal status, and this site needs those changes to appear **instantly, without a page refresh** — real Supabase Realtime subscriptions, not per-request polling.

### Credentials & env vars

- `.env` (git-ignored, never commit) holds:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY` — safe for the browser, used by `src/lib/supabase.ts`.
  - `SUPABASE_SERVICE_ROLE_KEY` — **server/script-only**, used by `scripts/seed-supabase.ts` and `scripts/audit-product-links.ts` (any script writing to a table with no anon-writable RLS policy needs it). Never prefix it with `VITE_`, never log it, never let it reach client bundles.
- `.env.example` documents the three keys with empty values.
- `.gitignore` covers `.env` / `.env.*` (with `!.env.example` carved out).

### Schema (`supabase/schema.sql`)

Run once in the Supabase SQL Editor. Tables: `brands`, `stores` (kept, `create table if not exists`), `products`, `offers`, `deals`, `sale_events`, `coupons` (dropped + recreated on each run to guarantee they match the file exactly — earlier iterations hit stray FK dependencies from an unrelated pre-existing `deals` table in the same project, hence `cascade` on the drops), and `reviews` (kept, `create table if not exists` — shopper-submitted, so dropping it on every schema run would nuke real reviews).

- RLS is **enabled on all 9 tables** (the 8 above plus `admin_users`).
- **Read**: public (`anon` key) can read everything except `admin_users` (no public read policy on that one at all).
- **Write**: `offers`, `deals`, `sale_events` require `to authenticated` + `is_admin()` — see "Admin auth & RLS lockdown" below. There is **no** public/anon write policy on these anymore.
- `reviews` gets a narrower **insert-only** public policy — anyone can post a review, nobody (not even the anon key) can edit/delete someone else's.
- `brands`, `stores`, `products` have no public-write policy at all — only readable by anon key. Writing to them (e.g. `scripts/seed-supabase.ts`, or deleting a bad row) requires the service-role key.
- Realtime publication (`supabase_realtime`) includes `offers`, `deals`, `sale_events` (and `products`, added later for admin-created products — see `live-catalog.ts` below).

#### Admin auth & RLS lockdown

`offers`/`deals`/`sale_events` writes require BOTH a signed-in Supabase Auth user AND a row in `admin_users` (`user_id uuid references auth.users(id)`) — checked via the `is_admin()` security-definer SQL function, which the write policies call. There's no public read/write policy on `admin_users` itself, so the only way to grant someone admin access is with the service-role key or directly in the Supabase SQL Editor:
```sql
insert into admin_users (user_id) values ('<their-auth-uid>');
```
This replaced a previous wide-open `"public write" ... using (true) with check (true)` policy with no `to` role restriction — meaning the anon key (which ships in every page load) used to be able to write directly to those tables with no login at all. See `docs/shared-context.md`'s RLS section for the full history and the note to the sibling admin-panel repo about checking `is_admin()` in its own policies too, not just `to authenticated`.

### Seeding (`scripts/seed-supabase.ts`)

`npx tsx scripts/seed-supabase.ts` — re-runnable. Loads `src/data/*` through a throwaway **Vite SSR dev server** (`vite.createServer` + `ssrLoadModule`), not plain Node/tsx, because those data files import image assets (`@/assets/*.jpg`) and use the `@` path alias, which plain Node can't resolve. Upserts everything in batches of 500; `offers` has no single-column natural key, and `(product_slug, store)` alone **isn't** unique either — a product can have multiple offers from the same store (different colorway/SKU rows grouped under one product name by `import-products.ts`, e.g. two Nike Air Force 1 colorways both from `nike-store`) — so it upserts on the `(product_slug, store, product_url)` triple instead (`offers_product_slug_store_url_key` in `schema.sql`). Only offers actually removed from the source data get an explicit delete, so a Realtime-subscribed client never sees a still-current offer flash to "gone" mid-seed (the old behavior, before this was changed to an upsert, deleted every row and reinserted on every run). This was discovered the hard way — a first attempt at a `(product_slug, store)`-only unique index failed against the live DB with 73 real conflicting groups; ~124 rows with no real `product_url` (pure duplicate noise from the old reinsert-every-run seeding) were cleaned up by hand before the widened index could be created. Any edit to `products.generated.ts` (image URLs, a slug fix, etc.) only reaches the live site after this is re-run — the app reads from Supabase via `live-catalog.ts`, not the bundled file directly.

### Reviews (`reviews` table, `src/components/ProductReviews.tsx`)

Shopper-submitted ratings/reviews, rendered under "Similar Products" on every `/product/$slug` page. Read/write goes straight through the browser `supabase` client with the anon key (no admin gate) — `reviews` is the one table the public site itself writes to, via the insert-only RLS policy described above. `scripts/seed-reviews.ts` backfilled ~5 category-aware, product-specific reviews (4-5★ only) per product; it's re-runnable and skips products that already have 5+.

**Not wired up**: the star rating shown at the top of the product page (next to the product name) comes from `products.rating`/`products.reviews` — a separate, static field seeded from the original catalog import, unrelated to the live `reviews` table. The two will show different numbers unless something explicitly recomputes `products.rating`/`reviews` from the real review rows (not done — would need the service-role key to write to `products`).

### Real-time sync (`src/lib/live-catalog.ts`)

The site's data layer is deeply synchronous/module-scope (`products`, `deals`, `saleEvents` arrays imported directly by 40+ files) — rewriting it to hooks/async fetching was out of scope. Instead:

- `initLiveCatalog()` (called once from `src/routes/__root.tsx` in a `useEffect`, client-only) subscribes to Postgres change events on `products`, `offers`, `deals`, `sale_events`, and **mutates the existing shared array/objects in place** (`Object.assign`, `push`, `splice`) rather than replacing them.
- On mount it also does a one-time `hydrateFromSupabase()` pull of current DB state — Realtime only streams changes that happen *while subscribed*, so this catches anything added/edited while no browser tab was open (e.g. a product added in admin overnight), and self-heals drift generally.
- `useCatalogVersion()` — a `useSyncExternalStore` hook — must be called by any component that renders live price/availability/deal/sale-event data, so React knows to re-render when a mutation lands. **Already wired into**: `ProductCard`, `PriceCompare`, `DealCard`, and the routes `shop`, `deals`, `sales-calendar`, `product.$slug`, `admin`, `index` (homepage compare section), `deal.$slug`. **If you add a new place that reads `.price`/`.availability`/deal fields directly (not through `ProductCard`/`PriceCompare`/`DealCard`), you must add `useCatalogVersion()` there too** — this exact gap caused a real bug once (homepage's "Same Product. Different Price." section and the deal detail page silently didn't update live because they read prices directly and had no hook call).
- Handles out-of-order delivery: a product row and its first offer are written as two separate inserts with no ordering guarantee — `pendingProductsBySlug`/`pendingOffersBySlug` buffer whichever arrives first so a product is never published into the shared `products` array with zero offers (several consumers, e.g. `bestOffer`, assume every product has ≥1 offer and will throw on an empty array).

### Image resolution (`scripts/upgrade-image-resolution.ts`)

Several scraped image sources bake a low resolution into the URL itself (Adidas `w_280,h_280`, Amazon `._AC_UL320_`, Farfetch `_480.jpg`, SHEIN `thumbnail_405x552`, New Balance's `$pdpflexf2$` preset, Nike's `t_default` preset) — this rewrites each to a verified higher-res equivalent on the same CDN (each pattern was curl-checked by hand before being added). Re-runnable/idempotent; safe to re-run after `scripts/import-products.ts` brings in fresh low-res URLs. Only touches `products.generated.ts` — **must be followed by `npx tsx scripts/seed-supabase.ts`** to actually reach the live site. Deliberately does *not* touch ASOS (its CDN was unreachable from this environment for verification — better to leave it alone than guess) or hosts that were already serving full resolution (Zara, Shopify, Nordstrom, Nike's non-`t_default` images, Puma, H&M, Uniqlo, Mango, Gap, REI, Lululemon, boohoo, PrettyLittleThing).

### Product link auditing (`scripts/audit-product-links.ts`)

Live-checks every `offers.product_url` and blanks out ones that are confirmed dead (HTTP 404/410, DNS failure, connection refused, timeout) — doesn't add new fallback logic, just triggers the *existing* one (`offerAffiliateUrl()` in `src/data/products.ts` already sends shoppers to the brand homepage whenever `product_url` is empty or unparsable, see the gotcha below). Deliberately does **not** touch 403/429/5xx responses — several stores (Farfetch in particular) bot-block automated/headless requests inconsistently (the same URL can 200, 403, or 429 across consecutive requests), which looks identical to a dead link from a script's point of view but a real shopper's browser would likely still get through. Those are logged as "uncertain" and left untouched rather than risk sending a working link to the brand homepage instead. Defaults to a dry run (prints what it would change); pass `--apply` to actually write the fix. Writes through the **service-role** key — `offers` requires `to authenticated` + `is_admin()` to write now (see the RLS note above), so the anon key this originally used no longer works.

### Contact form (`contact_messages` table, `src/routes/contact.tsx`)

A real working form (name/email/topic/message), linked from the footer. Writes straight through the browser `supabase` client with the anon key — `contact_messages` has an insert-only RLS policy, same pattern as `reviews`, except there is **no public read policy at all** (unlike reviews, submitted messages aren't meant to be listable by anyone holding the anon key). Read them with the service-role key or the Supabase dashboard's table editor.

### No admin UI in this repo

There is deliberately no `/admin` route or dashboard here — this repo is the public storefront only. Catalog/price/deal editing happens entirely in the separate `Deal canvas admin panel` repo (https://deal-canvas-admin-panel.vercel.app), which writes to the same Supabase project this site reads from via `live-catalog.ts`. A lightweight `src/routes/admin.tsx` used to exist in this repo (writing straight to Supabase with the anon key, no auth) but was removed once the real admin panel repo took over that job — **don't re-add an admin route here**, per explicit instruction; if you need to inspect/edit catalog data, do it in the admin panel repo or directly in Supabase.

## Known gotchas / history worth knowing before touching this area

- Postgres reserved keyword: `sale_events.window` must stay quoted (`"window"`) in SQL.
- `exactOptionalPropertyTypes: true` is on in `tsconfig` — optional fields typed as `field?: T` (not `T | undefined`) need conditional spreads (`...(x ? { field: x } : {})`), not `field: x ?? undefined`.
- `import.meta.env.SOME_VAR` needs bracket notation (`import.meta.env["SOME_VAR"]`) under this TS config (TS4111).
- Dead product links: `offerAffiliateUrl`/`dealAffiliateUrl` fall back to the brand homepage when a product's own affiliate link is unavailable/dead — this only triggers when `product_url`/`merchantUrl` is empty or fails `new URL()` parsing, it doesn't live-check reachability. `scripts/audit-product-links.ts` is what actually finds dead links and clears the field so this fallback kicks in.
- Admin-panel-created rows can silently duplicate: the separate admin panel repo has, at least once, created a near-duplicate `brands` row when editing a brand whose name has an apostrophe/ampersand (its slugify couldn't round-trip `Carter's`/`H&M`/`OshKosh B'gosh`/`The Children's Place`/`Armani`, so it inserted a new malformed-slug row — e.g. `h-m`/"H M" — instead of updating the existing one). These duplicates have `category: null` and zero products attached, which is how to distinguish them from a real second brand. Check `brands` for this pattern (case-insensitive name match, or a null `category`) if `/brands` ever looks cluttered.

## Verification habits used on this project

- Any non-trivial Supabase/data change gets checked with a small throwaway script (service-role key, run via `npx tsx`) rather than trusted on faith — e.g. confirming a write round-trips through Realtime within a few seconds, confirming RLS still allows the exact read/write shape the app uses. These scripts are deleted immediately after use (`scripts/tmp-*.ts` is the convention) — they should never be committed.
- `npx tsc --noEmit` after any TypeScript change touching `live-catalog.ts`, `supabase.ts`, or the currency helpers.
