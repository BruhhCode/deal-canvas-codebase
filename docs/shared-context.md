# DealsCanvas — shared DB & API contract (site ⇄ admin)

**This file must stay byte-identical in both repos:**
- `deal canvas codebase` (public site) — `docs/shared-context.md`
- `Deal canvas admin panel` (admin dashboard) — `docs/shared-context.md`

They are two independent repos/apps that read and write **the same Supabase
project**. Neither repo can see the other's code, so this file is the only
ground truth both Claude sessions share. **Whenever you change a table
column, a policy, the realtime publication, or any cross-repo assumption below,
update this file in both repos in the same sitting** — drift here is exactly
what caused real bugs before (see "History" at the bottom).

## The two apps

| | `deal canvas codebase` | `Deal canvas admin panel` |
|---|---|---|
| Purpose | Public storefront (search, compare prices, deals, coupons, sales calendar) | Internal CRUD dashboard for the catalog |
| Framework | TanStack Start, file routes in `src/routes/` | TanStack Start (separate app/repo), routes in `src/routes/admin/*` |
| Auth | None — this repo has **no admin UI of its own** | Real Supabase Auth (`supabase.auth.signInWithPassword`, see `src/lib/auth.ts`) — login screen at `/login`, deployed at https://deal-canvas-admin-panel.vercel.app |
| Reads Supabase via | `src/lib/supabase.ts` (anon key) + `src/lib/live-catalog.ts` (realtime → mutates static in-memory arrays) | `src/lib/data.ts` (anon key, `useSyncExternalStore`-based store, full CRUD helpers) |

**No merged/duplicate admin UI**: this repo previously had a lightweight `src/routes/admin.tsx` (writes straight to Supabase, briefly gated behind Supabase Auth + `admin_users` before being removed entirely) — it has been **deleted on purpose**, now that the admin panel repo is live and actively developed. Catalog/price/deal editing happens only in the admin panel repo; do not re-add an admin route to this one.

Both apps use the **same Supabase project** (URL + anon key in each repo's
`.env`, never committed — see `.env.example` in each repo). The **service-role
key** exists only in the site repo's `.env`, used by `scripts/seed-supabase.ts`
and `scripts/audit-product-links.ts`, and must never be exposed to any browser
bundle in either app.

## Pricing contract — legacy base unit (do not skip this)

`offers.price`, `offers.original_price`, `deals.price`, `deals.original_price`
are stored in a **legacy base unit**, not real USD:

```
BASE_TO_USD = 1 / 83
usd = base * BASE_TO_USD
base = usd / BASE_TO_USD
```

- Site: `src/lib/currency.tsx` — `toUsd()`, `fromUsd()`, `formatUsd()`, plus the `useCurrency()` multi-currency context.
- Admin panel: `src/lib/currency.ts` — same `toUsd()`/`fromUsd()` pair, USD-only `useCurrency()`.

**Every read or write of a price column in either repo must go through these
conversions.** A raw `.price`/`.original_price` value is never real USD —
treating it as one makes prices ~83x off on whichever surface forgot the
conversion.

## Product identity: `slug`, not `id`

`products.slug` is the **primary key** (not a separate `id` column — the
scraped/imported catalog's original `id` values, e.g. `"PI-0081"`, were
reused across unrelated products and are not globally unique; they're kept
only as `products.source_id`, a plain non-unique text column, for traceability
back to the original import).

- `offers.product_slug` (not `product_id`) is the FK into `products.slug`, `on delete cascade`.
- The admin panel's `updateProduct()` (`src/lib/data.ts`) has to delete-then-reinsert a product's offers when renaming its slug, since there's no `on update cascade` — see that function's comment before changing this flow.

## Tables (current shape — source of truth is Supabase itself; this is a snapshot)

### `brands`
`slug` (PK, text) · `name` · `description` · `category` · `network` · `featured` (bool)

### `stores`
`slug` (PK, text) · `name` · `description` · `network` · `domain` · `campaign` · `store_id` · `sub_id` · `ships_to` · `store_wide_offer` (nullable) · `featured` (bool) · `sponsored` (bool)

### `products`
`slug` (PK, text) · `source_id` · `name` · `brand` (FK → `brands.slug`) · `category` · `subcategory` · `gender` · `description` · `image` · `images` (jsonb array) · `colors` (jsonb array) · `sizes` (jsonb array) · `tags` (jsonb array) · `rating` (numeric) · `reviews` (int) · `views` (int) · `new_in` (bool) · `updated_at`

### `offers`
`id` (PK, uuid, default `gen_random_uuid()`) · `product_slug` (FK → `products.slug`, cascade delete) · `store` (FK → `stores.slug`) · `price` (base unit) · `original_price` (base unit) · `currency` (text, always `"USD"` today — it labels the base-unit currency, not a display currency) · `availability` (text: `"IN STOCK" | "LOW STOCK" | "OUT OF STOCK"`) · `product_url` · `coupon_code` (nullable) · `shipping` · `updated_hours_ago` (int) · `sponsored` (bool) · `updated_at`

A product can have many offers (one per store). `bestOffer()` (implemented independently in both repos — keep the tie-break logic identical) picks the lowest `price`.

### `deals`
`id` (PK, text, e.g. `"DL-<timestamp36>"`) · `slug` (unique) · `title` · `product` (display name) · `brand` (FK → `brands.slug`) · `category` · `subcategory` (nullable) · `original_price` (base unit) · `price` (base unit) · `code` (nullable) · `deal_type` · `badges` (jsonb array) · `description` · `terms` (jsonb array) · `expires_in_hours` (int) · `status` (`"ACTIVE" | "UPCOMING" | "EXPIRED" | "SOLD OUT" | "PAUSED"` — **note**: the admin panel's `DealStatus` type only lists `ACTIVE | PAUSED | EXPIRED | UPCOMING`, missing `SOLD OUT` which the site's type includes; reconcile this if it ever causes a mismatched dropdown/rendering) · `image` · `tags` (jsonb array) · `merchant_url` · `network` · `campaign` · `sub_id` · `tracking_id` · `clicks` (int) · `featured` / `flash` / `sponsored` (bool)

### `sale_events`
`id` (PK, text, e.g. `"SE-<timestamp36>"`) · `store` (FK → `stores.slug`) · `title` · `discount` · `"window"` (text — **quoted in SQL, it's a reserved keyword**; values like `"today" | "tomorrow" | "this-week" | "next-week" | "this-month"`) · `detail` · `code` (nullable)

### `coupons`
`id` (PK, text) · `brand` (FK → `brands.slug`) · `title` · `description` · `code` · `discount` · `expires_in_hours` (int) · `used_today` (int) · `success_rate` (numeric)

### `network` values (CHECK-constrained on `brands`/`stores`/`deals`)
Closed set — Postgres will reject anything else:
`"Rakuten Advertising" | "Impact" | "Awin" | "CJ Affiliate" | "Admitad" | "Amazon Associates"`

## Row Level Security — current live state

**Updated 2026-09 — this used to describe a wide-open write gap; it's now
fixed. Read this whole section before assuming anon-key writes still work
anywhere, in either repo.**

- **Read**: `anon` key can read all 8 tables (`brands`, `stores`, `products`,
  `offers`, `deals`, `sale_events`, `coupons`, `reviews`) — unchanged, still
  fully public.
- **Write on `offers`/`deals`/`sale_events`**: the previous wide-open
  `"public write" ... using (true) with check (true)` policy (no `to` role
  restriction — meaning **any** holder of the public anon key, which ships in
  every page load of both apps, could insert/update/delete directly against
  the REST API with no login at all) **has been dropped**. Both tables now
  carry a single `"admin write" ... for all to authenticated using
  (is_admin()) with check (is_admin())` policy instead — a request must be
  both an authenticated Supabase Auth user *and* have a row in the new
  `admin_users` table to write at all (insert, update, **or** delete — there
  is no separate, looser delete policy).
- **`is_admin()`**: a `security definer` SQL function
  (`exists (select 1 from admin_users where user_id = auth.uid())`) — this is
  what the write policies above check. `admin_users` itself (`user_id uuid
  primary key references auth.users(id)`) has RLS enabled with **no** public
  read or write policy; the only way to query or modify it is through
  `is_admin()` or the service-role key.
- **Making someone an admin** (do this in the Supabase SQL Editor, or via a
  service-role script — RLS blocks the anon/authenticated roles from doing it
  themselves, on purpose): have them sign up/in once via Supabase Auth (either
  app's login flow works, same project), then
  `insert into admin_users (user_id) values ('<their-auth-uid>');`.
- **`reviews`** keeps its own narrower **insert-only** public policy (anyone
  can post a review, nobody — not even the anon key — can edit/delete someone
  else's) — unaffected by this change, listed here for completeness.
- `products`, `brands`, `stores`, `coupons` have **no** write policy for
  either `anon` or `authenticated` — only the service-role key can write to
  them (used by `scripts/seed-supabase.ts` in the site repo).
- The admin panel repo's own `to authenticated` policies
  (`src/scripts/rls-policies.sql`, `restore-products-rls.sql`) are no longer
  redundant now that the permissive policy under them is gone — **but if
  those files grant write access to *every* authenticated user rather than
  checking `is_admin()`, they need to be updated to match this**, or the
  admin-role gate can still be bypassed by anyone who signs up for an account
  without being added to `admin_users`. Check this before assuming the fix is
  complete on that side.
- Source of truth for the actual table/policy DDL is the site repo's
  `supabase/schema.sql` (the `admin_users`/`is_admin()`/policy definitions
  live there) — re-run it in the Supabase SQL Editor to apply.

## Realtime

`supabase_realtime` publication currently includes **all of**: `products`,
`offers`, `deals`, `sale_events` (verified live). `brands`, `stores`,
`coupons` are not in the publication — no current UI needs live updates for
those.

- Site's consumer: `src/lib/live-catalog.ts` — subscribes to all four
  published tables, mutates the shared in-memory `products`/`deals`/
  `saleEvents` arrays/objects in place, exposes `useCatalogVersion()` for
  components to opt into re-rendering on change. On mount it also does a
  one-time full re-fetch (`hydrateFromSupabase()`) to catch anything written
  while no browser tab was subscribed — Realtime never backfills past events.
- **Any component/route in the site that reads a live price/availability/
  deal/sale-event field directly (not through `ProductCard`/`PriceCompare`/
  `DealCard`, which already call the hook) must call `useCatalogVersion()`
  itself**, or it will silently show stale data after an admin edit. This
  exact gap caused a real bug: the homepage's "Same Product. Different
  Price." section and the deal detail page (`deal.$slug.tsx`) read prices
  directly and had no hook call.
- Admin panel does not currently subscribe to realtime itself — it reloads
  the affected table after every write (`reload()` in `src/lib/data.ts`), so
  it doesn't need `useCatalogVersion`-equivalent wiring, but if it ever adds
  a second open tab/session scenario, this is where that would go.

## Verification convention

Both repos favor small, throwaway diagnostic scripts (using the service-role
key from the site repo, or plain anon-key scripts) run with `node`/`npx tsx`
to empirically confirm RLS/realtime behavior against the *live* database
rather than trusting a checked-in `.sql` file was actually the last thing
run — policies here have drifted from file history at least once already
(see History). Delete these scripts immediately after use; never commit them.

## History (context for judgment calls, not exhaustive)

- Site originally shipped `offers`/`deals`/`sale_events` with `anon`-writable
  RLS ("no real admin auth yet"). The admin panel repo later added real
  Supabase Auth + its own `to authenticated` policies, intending to tighten
  this — but the original wide-open policy was never dropped, so it stayed
  wide open in practice for a long time. **Fixed 2026-09**: the wide-open
  policy is dropped, an `admin_users` table + `is_admin()` function were
  added, and `offers`/`deals`/`sale_events` now require `to authenticated`
  *and* `is_admin()` to write at all (see RLS section above). The site's
  legacy `/admin` route was briefly updated to actually sign in via Supabase
  Auth before attempting any write, then removed entirely once this Fixed
  2026-09 note was written — the admin panel repo is the only admin UI now,
  by explicit choice ("don't merge" the two).
- `products` was originally **not** in the realtime publication; the admin
  panel's `src/scripts/enable-products-realtime.sql` added it after
  discovering products created in the admin panel never appeared live on the
  site.
- The site's `products` table was migrated from an `id`-keyed to a
  `slug`-keyed primary key partway through this project (see "Product
  identity" above) — this silently dropped the admin panel's insert/update/
  delete policies on `products` (policies don't survive a table recreation),
  which `restore-products-rls.sql` was written to fix. If `products` is ever
  recreated again (not just altered), remember write policies need re-adding.
