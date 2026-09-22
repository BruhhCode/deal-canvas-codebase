# DealsCanvas — design system

The editorial fashion-deal aesthetic: cream background, black + rust (clay)
accents, serif headlines over sans body text. All of this is defined as CSS
custom properties in [`src/styles.css`](../src/styles.css) — that file is the
source of truth; this doc explains the *intent* behind it so future changes
don't quietly re-introduce the inconsistencies a full polish pass already
fixed once (mismatched card styles, sharp-vs-rounded corners, cream-vs-solid
badges — see git history around the "UI polish pass" commits for the before/
after).

## Color tokens

Defined in `:root`/`.dark` as oklch values, exposed as Tailwind utilities via
the `@theme inline` block (`bg-background`, `text-clay`, etc.).

| Token | Role |
|---|---|
| `background` / `cream` / `sand` | Page background, section background, a slightly deeper neutral — three steps of the same warm off-white, in increasing depth |
| `ink` | Near-black, used for high-contrast dark sections (hero overlay, "Compare" band, newsletter band) |
| `foreground` / `card` / `border` | Body text, card surfaces, hairline borders |
| `clay` (rust) | **Price / discount / urgency only.** Discount badges, "Save $X", sale accents, the primary hover color on buttons/links |
| `sage` (muted green, added in the polish pass) | **Trust / info / brand-neutral signals only** — e.g. "Best Price". If what you're coloring isn't about price or time pressure, it should not be clay |
| `primary` / `secondary` / `muted` / `accent` | shadcn-style semantic slots, used mostly by `components/ui/*` primitives |

**Rule of thumb**: clay = "this is about money or a deadline." Sage = "this
is a fact you can trust." Don't reach for clay just because it's the brand
accent color — that's what caused the original "discount and brand identity
signaled by the same color" problem.

## Spacing scale

Section-level (page wrappers, `<section>` top/bottom padding) spacing is
constrained to **8 / 16 / 24 / 40 / 64 / 96px** — `py-2 / py-4 / py-6 / py-10
/ py-16 / py-24` in Tailwind's default 4px-unit scale. No other `py-*` value
belongs on a section wrapper. This is documented as a comment directly above
the `@theme` block in `styles.css` — read it before adding a new top-level
section.

This is specifically about section rhythm, not every padding in the app —
a card's internal `p-3`/`p-6` isn't held to this scale.

One consequence worth knowing: two visually-light sections sitting back to
back (e.g. a white section directly above a `bg-cream` one) will read as one
oversized dead gap if both use the full `py-16` — there's no color contrast
to break up the whitespace the way there is next to an `bg-ink` section. The
fix used throughout is asymmetric padding at that one seam (`pb-16 pt-10` on
the lower section) rather than dropping the whole page to a tighter rhythm.

## Border radius

**One radius, used everywhere.** `--radius` is a single value (`0.5rem`
currently), and `rounded-sm`/`rounded-md`/`rounded-lg`/`rounded-xl`/
`rounded-2xl` all resolve to it — Tailwind's calc() offsets between those
sizes were deliberately removed from the `@theme` block. Practical effect:
you can use whichever `rounded-*` class reads best grammatically in context
(a small badge vs. a large card) without worrying it'll render a different
actual corner size — they're all the same. `rounded-full` (pills, avatars,
the wishlist button) is a shape, not part of this scale, and is unaffected.

## Typography

- Body/UI text: **Poppins** (`--font-sans`), loaded via Google Fonts in
  `__root.tsx`. This is the default for everything, including product
  descriptions and detail text — don't override it.
- `h1`/`h2`/`h3`: **Playfair Display** (`--font-serif`), weight 500, tight
  letter-spacing — the editorial-headline voice, applied globally in
  `@layer base`, not per-component.
- `.editorial-eyebrow` utility: the small-caps label pattern used above
  nearly every section title and form label ("SORT", "FILTERS", "GET IN
  TOUCH") — 11px, 0.18em tracking, uppercase, semibold, muted color. Use
  this utility rather than re-implementing the same five classes inline.

## Badges

Exactly two treatments, both defined in `DealBadge.tsx` and mirrored by the
inline discount badge in `Tile.tsx`:

- **Soft (default)** — tinted background, colored text/border. Used for
  ordinary discount percentages, "Best Price," "Coupon," category chips.
- **Solid (urgency)** — full-fill background. Reserved for genuine
  time-pressure states only: flash sales, "ends in Xh." `Tile.tsx` decides
  this automatically for deal cards (`deal.flash || deal.expiresInHours <
  24`) rather than leaving it to a per-usage judgment call.

Don't add a third treatment, and don't reach for solid just to make
something stand out — that's exactly the inconsistency ("cream badges on
Shop/Sale, solid-black badges on Deals") the polish pass resolved.

## The shared card: `Tile.tsx`

`ProductCard` and `DealCard` are both thin wrappers around one base
component, [`Tile.tsx`](../src/components/Tile.tsx) — this is the only place
that should define what a product/deal card looks like. If you need a new
place that renders a product or deal as a card, use `ProductCard`/`DealCard`
(or extend `Tile`'s props), don't hand-roll another card markup.

What `Tile` standardizes:
- **Image slot**: fixed 1:1 aspect ratio, `ProductImage` for the actual
  `<img>` (see below).
- **Badge placement**: top-left, soft or solid per the rule above.
- **Wishlist button**: top-right, from `WishlistButton.tsx`.
- **CTA button**: always filled (`bg-primary`, hover `bg-clay`), same
  shape/weight/padding regardless of context — only the label differs
  ("Shop Now" vs "Get Deal") and deals get an optional coupon-code
  sub-element via `CopyCode`.
- **Reserved-height footnote slot**: a fixed-min-height row for optional
  per-card content ("Save $X vs highest store price," a coupon code) so
  cards in the same grid row stay equal height whether or not that field is
  present, instead of some cards being visibly shorter than their neighbors.

## Image placeholders: `ProductImage.tsx`

When a product/deal image is missing or fails to load, this renders a
**branded monogram placeholder** — initials (from the alt text) in serif
type, centered on a soft cream/sand gradient block — not a generic
broken-image icon. Same convention as `BrandMark`'s logo-fallback initials.

## Logo tiles: `BrandMark.tsx` / `StoreMark.tsx`

Both render a third-party brand/store logo with a fallback chain
(primary logo → fallback logo → initials). Their default (non-`"free"`)
variant boxes the logo in a fixed square with a `bg-secondary` (a subtle
off-white, not pure white) so logos of very different native aspect ratios
still read as one consistent tile — use this variant anywhere logos appear
in a grid/list. `StoreMark`'s `size="free"` variant (unconstrained aspect
ratio, used only on the homepage's curated store row) additionally caps
`max-width` so wordmark logos don't dominate next to icon marks, and expects
a grayscale-by-default/color-on-hover treatment applied by the caller
(`grayscale opacity-70 ... group-hover:grayscale-0 group-hover:opacity-100`
on a parent with `className="group"`).

## Filters: `FilterControls.tsx`

One filter UI paradigm — dropdown selects + range sliders — shared by the
Shop and Deals listing pages via `FilterSelect` / `FilterRange` /
`FilterCheckbox` / `FilterPanel` / `SortControl`. Don't reintroduce a
pill-button/chip filter list (the earlier Shop-page pattern) — it doesn't
scale to long option lists (Brand, Store) without an awkward internal
scrollbar, which is why it was replaced. `SortControl` also standardizes the
"Sort" label's casing (`.editorial-eyebrow`, i.e. always renders as "SORT")
— don't hand-write a differently-styled sort label elsewhere.

## Icons

`lucide-react`, always at its default stroke width — grep the codebase for
`strokeWidth` before adding a custom one; as of this writing there are zero
overrides anywhere, and that consistency is intentional.

## Motion / micro-interactions

- Card hover: `hover:shadow-card` (a soft, warm-toned shadow defined as
  `--shadow-card`), image `scale-[1.03]` on hover inside an `overflow-hidden`
  frame.
- Wishlist heart (`WishlistButton.tsx`): a brief `scale-125` pop plus a
  `transition-colors` fill-color change on click — not an instant class
  swap. If you touch this component, keep both parts; the pop alone or the
  color swap alone reads as unfinished.
- Hero carousel (`HeroCarousel.tsx`): 4.5s per slide, 1.8s crossfade. The
  slide images are pure background/ambiance and never carry their own
  headline text (the hero's actual `<h1>` is static, not per-slide), so this
  timing isn't paced against anything readable — don't add per-slide copy
  without revisiting the timing.

## Layout conventions

- Page content width: `mx-auto max-w-7xl px-4 md:px-6` (or `px-6` on a few
  older pages — `max-w-7xl` is the constant, treat `px-4 md:px-6` as the
  preferred horizontal padding for new pages).
- Product/deal grids: `grid-cols-2` on mobile, stepping up through
  `sm:grid-cols-3` to `lg:grid-cols-5` (product cards) — pick a result count
  that's a clean multiple of the largest column count so grids don't end on
  a ragged last row (see how homepage section product counts are chosen).
