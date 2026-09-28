import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { ProductSearch } from "@/components/ProductSearch";
import { HeroCarousel, SLIDES, heroSrcSet } from "@/components/HeroCarousel";
import { ProductCard } from "@/components/ProductCard";
import { SectionHeading } from "@/components/SectionHeading";
import { Newsletter } from "@/components/Newsletter";
import { BrandMark } from "@/components/BrandMark";
import { brands } from "@/data/catalog";
import { stores } from "@/data/stores";
import { seededShuffle } from "@/lib/seeded-shuffle";
import { approxCount } from "@/lib/utils";
import { useCatalogVersion } from "@/lib/live-catalog";
import { absoluteUrl } from "@/lib/site";
import bannerDeals from "@/assets/cat-fashion.jpg";
import bannerSale from "@/assets/cat-shoes.jpg";
import bannerNew from "@/assets/cat-beauty.jpg";
import {
  biggestDiscounts,
  newArrivals,
  popularSearches,
  products,
  trendingProducts,
} from "@/data/products";

export const Route = createFileRoute("/")({
  // Re-runs on every navigation to "/" (including a hard refresh), so the
  // homepage's rotating sections pick a fresh set of products each time —
  // computed here rather than with client-only randomness so the server-
  // rendered HTML and the client's initial hydration always agree.
  loader: () => ({ seed: `${Date.now()}-${Math.random()}` }),
  head: () => ({
    meta: [
      { title: "Search & Compare Fashion Prices Across Stores | DealsCanvas" },
      {
        name: "description",
        content:
          "Find what you love and shop it for less. Search fashion, beauty and lifestyle products across Nordstrom, Revolve, Nike, Adidas, Zara, Amazon and more — compare live prices and buy at the lowest.",
      },
      { property: "og:title", content: "Find What You Love. Shop It for Less. | DealsCanvas" },
      {
        property: "og:description",
        content: "Fashion shopping search: compare products, prices and offers from every store in one place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: absoluteUrl("/") },
      {
        rel: "preload",
        as: "image",
        href: SLIDES[0],
        imageSrcSet: heroSrcSet(SLIDES[0]!),
        imageSizes: "100vw",
        fetchPriority: "high",
      },
    ],
  }),
  component: Home,
});

const promoBanners = [
  {
    title: "Live Deals, Updated Hourly",
    subtitle: "Every markdown we track, in one feed.",
    image: bannerDeals,
    to: "/deals",
  },
  {
    title: "Sale Ends Soon",
    subtitle: "Deepest discounts before they're gone.",
    image: bannerSale,
    search: { q: "", category: "", department: "", view: "sale", store: "" },
  },
  {
    title: "Just Landed",
    subtitle: "This week's newest arrivals across every store.",
    image: bannerNew,
    search: { q: "", category: "", department: "", view: "new", store: "" },
  },
] as const;

function Home() {
  const { seed } = Route.useLoaderData();
  useCatalogVersion();

  const trendingPicks = seededShuffle(trendingProducts.slice(0, 24), `${seed}-trending`).slice(0, 10);
  const discountPicks = seededShuffle(biggestDiscounts.slice(0, 24), `${seed}-discounts`).slice(0, 10);
  const newInPicks = seededShuffle(newArrivals, `${seed}-new`).slice(0, 5);

  return (
    <>
      <section className="relative isolate overflow-hidden border-b">
        <HeroCarousel />
        <div className="relative mx-auto max-w-3xl px-4 py-10 text-center md:px-6 md:py-16">
          <p className="editorial-eyebrow text-background/80">
            {approxCount(products.length)} products · {approxCount(stores.length)} stores · updated hourly
          </p>
          <h1 className="mt-4 text-4xl leading-[1.05] text-background md:text-6xl">
            Find What You Love.
            <br />
            Shop It for Less.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-background/85">
            Discover fashion, beauty and lifestyle products from your favourite stores — all in one place.
          </p>

          <ProductSearch className="mx-auto mt-6 max-w-2xl" />

          <div className="mt-5">
            <p className="editorial-eyebrow text-background/80">Popular searches</p>
            <div className="mt-3 flex flex-nowrap justify-center gap-2 overflow-x-auto px-1 md:overflow-visible">
              {popularSearches.map((t) => (
                <Link
                  key={t.slug}
                  to="/brand/$slug"
                  params={{ slug: t.slug }}
                  className="shrink-0 rounded-full border border-background/30 bg-background/10 px-4 py-2 text-sm text-background backdrop-blur-sm transition-colors hover:border-background hover:bg-background/20"
                >
                  {t.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <SectionHeading
          eyebrow="Trending now"
          title="What Shoppers Are Searching"
          description="Ranked by product views, searches and saves over the last seven days."
          href="/shop"
        />
        <div className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 lg:grid-cols-5">
          {trendingPicks.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="border-y bg-ink py-16 text-background">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid gap-6 md:grid-cols-3">
            {promoBanners.map((b) => {
              const content = (
                <>
                  <img
                    src={b.image}
                    alt=""
                    width={640}
                    height={480}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent" />
                  <div className="relative flex h-full flex-col justify-end p-6">
                    <h3 className="text-2xl text-background">{b.title}</h3>
                    <p className="mt-1 text-sm text-background/85">{b.subtitle}</p>
                    <span className="mt-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-background">
                      Shop now <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </>
              );
              const className =
                "group relative isolate h-72 overflow-hidden rounded-lg border border-background/20";
              return "to" in b ? (
                <Link key={b.title} to={b.to} className={className}>
                  {content}
                </Link>
              ) : (
                <Link key={b.title} to="/shop" search={b.search} className={className}>
                  {content}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <SectionHeading
          eyebrow="Biggest discounts"
          title="Deepest Price Drops Today"
          description="Highest percentage off across every store we track."
          href="/shop"
        />
        <div className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 lg:grid-cols-5">
          {discountPicks.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {newInPicks.length ? (
        <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
          <SectionHeading eyebrow="New in" title="Just Landed" href="/shop" />
          <div className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 lg:grid-cols-5">
            {newInPicks.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-7xl px-4 pb-16 pt-10 md:px-6">
        <SectionHeading eyebrow="Brands" title="Shop by Brand" href="/brands" linkLabel="All brands" />
        <div className="flex flex-wrap gap-4">
          {brands.slice(0, 14).map((b) => (
            <Link
              key={b.slug}
              to="/brand/$slug"
              params={{ slug: b.slug }}
              className="flex items-center gap-3 rounded-full border px-5 py-2.5 text-base transition-colors hover:border-clay hover:text-clay"
            >
              <BrandMark slug={b.slug} size="md" />
              {b.name}
            </Link>
          ))}
        </div>
      </section>

      <Newsletter />
    </>
  );
}
