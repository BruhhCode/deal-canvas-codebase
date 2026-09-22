# DealsCanvas — project brief

## What it is

DealsCanvas is a fashion/beauty/lifestyle **deal-aggregator and price-comparison
site**. Shoppers search or browse a single catalog of products; for each
product, the site shows every store price it tracks and points shoppers at
the cheapest currently-in-stock listing. Alongside products, it also
publishes hand-curated deal cards, coupon codes, flash sales, and a sales
calendar — the more "editorial marketing" side of the same business, as
opposed to the always-live product/price data.

Tagline (from the homepage hero): **"Find What You Love. Shop It for Less."**

## Business model

Affiliate commission. Every outbound "Shop Now" / "Get Deal" link carries
UTM/affiliate tracking params (`offerAffiliateUrl`/`dealAffiliateUrl` in
`src/data/products.ts` / `deal-products.ts`) and routes through each store's
own affiliate network (Rakuten Advertising, Impact, Awin, CJ Affiliate,
Admitad, Amazon Associates — the closed set of `network` values in the DB).
The footer's own disclosure states this plainly: *"We earn a commission when
you shop through our links — the price you pay never changes."* The product
never charges shoppers directly; there's no cart, checkout, or payment
processing in this codebase at all — every purchase happens on the retailer's
own site.

## Who it's for

Fashion/beauty/lifestyle shoppers who want to compare a specific product
(or a category of products) across many retailers at once, rather than
price-check store by store. Secondary audience: shoppers who arrive with
intent to just "find a deal today" (Deals, Flash Deals, Coupons, Sales
Calendar) rather than a specific product in mind.

## What's tracked

~1,360+ products across ~75 stores and ~79 brands (Nordstrom, Revolve, Nike,
Adidas, Zara, Amazon Fashion, Ulta Beauty, Ssense, Net-a-Porter, and many
more — see `src/data/stores.ts`/`catalog.ts`). Catalog data originates as
scraped/imported CSVs (`scripts/*.csv`, processed by `scripts/import-
products.ts` and friends), not a live product feed — prices/availability are
then kept current through the admin panel (see below), not by continuous
re-scraping.

## Core surfaces

- **Product search & comparison** — `/shop` (filterable/sortable listing),
  `/product/$slug` (price comparison across every store carrying it, price
  alerts, reviews)
- **Deals** — `/deals` (filterable deal directory), `/deal/$slug`,
  `/flash-deals` (time-boxed offers)
- **Coupons** — `/coupons` (verified, testable promo codes)
- **Browse by brand/store/category** — `/brands`, `/brand/$slug`,
  `/stores`, `/store/$slug`, `/category/$slug`
- **Sales calendar** — `/sales-calendar` (today/tomorrow/this-week live and
  upcoming store-wide sales) and `/sale`/`/sale/$slug` (seasonal shopping
  events — Black Friday, July 4th, etc.)
- **Editorial** — `/guides`, `/guides/$slug` (shopping guides), `/pages/
  $slug` (freeform CMS pages authored in the admin panel)
- **Support** — `/faq`, `/contact` (a real form, writes to Supabase,
  currently un-monitored — there's no official support inbox yet)
- **Wishlist** — `/account`, client-side only (localStorage), no real user
  accounts or sign-in on the public site

## Two-repo architecture

DealsCanvas is deliberately split across two independent repositories
sharing one Supabase project:

| | This repo (`deal canvas codebase`) | `Deal canvas admin panel` |
|---|---|---|
| Role | Public storefront | Internal catalog/content CRUD dashboard |
| Auth | None — fully public | Real Supabase Auth, `admin_users`-gated |
| Owns | All shopper-facing pages/routes | Product/price/deal editing, Navigation, CMS Pages, FAQ, Contact-message triage |

Neither repo can see the other's code — [`docs/shared-context.md`](shared-context.md)
is the one file kept byte-identical in both, documenting the DB schema, RLS
state, and pricing contract both must agree on. **This repo has no admin UI
of its own** — a legacy `/admin` route existed early on and was deliberately
removed once the dedicated admin panel repo took over; don't re-add one.

## Explicitly out of scope (for this repo)

- User accounts / authentication for shoppers
- Payments, carts, checkout
- Catalog editing UI (lives in the admin panel repo)
- Continuous/live product scraping (catalog is imported in batches, then
  kept current via the admin panel + this repo's own maintenance scripts)

## Current known gaps (worth knowing before assuming something works)

- No official monitored support email exists yet — the Contact page
  deliberately doesn't display one (`hello@dealscanvas.com` was a
  placeholder, removed).
- `products.rating`/`products.reviews` (the static star rating shown next to
  a product's name) is **not** wired up to the live `reviews` table — they
  can show different numbers; nothing currently recomputes the static fields
  from real review rows.
- Several brand rows in the DB have known malformed duplicates from an
  apostrophe/ampersand slugify bug in the admin panel (`Carter's` vs
  `carter-s`, etc.) — see the "gotchas" section of `CLAUDE.md` for the
  detection pattern; not yet cleaned up as of this writing.
