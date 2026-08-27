import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { ProductSearch } from "@/components/ProductSearch";
import { HeroCarousel } from "@/components/HeroCarousel";
import { ProductCard } from "@/components/ProductCard";
import { SectionHeading } from "@/components/SectionHeading";
import { Newsletter } from "@/components/Newsletter";
import { StoreMark } from "@/components/StoreMark";
import { BrandMark } from "@/components/BrandMark";
import { brandName, brands } from "@/data/catalog";
import { useCurrency } from "@/lib/currency";
import { stores, storeName } from "@/data/stores";
import {
  bestOffer,
  biggestDiscounts,
  categoryName,
  newArrivals,
  offersSorted,
  popularSearches,
  products,
  saleEvents,
  savingsVsHighest,
  trendingProducts,
} from "@/data/products";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Search & Compare Fashion Prices Across Stores | DealCanvas" },
      {
        name: "description",
        content:
          "Find what you love and shop it for less. Search fashion, beauty and lifestyle products across Nordstrom, Revolve, Nike, Adidas, Zara, Amazon and more — compare live prices and buy at the lowest.",
      },
      { property: "og:title", content: "Find What You Love. Shop It for Less. | DealCanvas" },
      {
        property: "og:description",
        content: "Fashion shopping search: compare products, prices and offers from every store in one place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

const compareShowcase = products
  .filter((p) => p.offers.length >= 3)
  .sort((a, b) => savingsVsHighest(b) - savingsVsHighest(a))
  .slice(0, 3);

const todaysSales = saleEvents.filter((e) => e.window === "today" || e.window === "tomorrow");

function Home() {
  const { format } = useCurrency();
  return (
    <>
      <section className="relative isolate overflow-hidden border-b">
        <HeroCarousel />
        <div className="relative mx-auto max-w-3xl px-4 py-20 text-center md:px-6 md:py-28">
          <p className="editorial-eyebrow text-background/80">
            {products.length} products · {stores.length} stores · updated hourly
          </p>
          <h1 className="mt-5 text-5xl leading-[1.05] text-background md:text-7xl">
            Find What You Love.
            <br />
            Shop It for Less.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base text-background/85">
            Discover fashion, beauty and lifestyle products from your favourite stores — all in one place.
          </p>

          <ProductSearch className="mx-auto mt-9 max-w-2xl" />

          <div className="mt-7">
            <p className="editorial-eyebrow text-background/80">Popular searches</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {popularSearches.map((t) => (
                <Link
                  key={t.slug}
                  to="/brand/$slug"
                  params={{ slug: t.slug }}
                  className="rounded-full border border-background/30 bg-background/10 px-4 py-2 text-sm text-background backdrop-blur-sm transition-colors hover:border-background hover:bg-background/20"
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
        <div className="grid grid-cols-2 gap-x-5 gap-y-9 lg:grid-cols-4">
          {trendingProducts.slice(0, 8).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="border-y bg-ink py-16 text-background">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-background/20 pb-4">
            <div>
              <p className="editorial-eyebrow text-background/60">Compare</p>
              <h2 className="text-3xl text-background md:text-4xl">Same Product. Different Price.</h2>
            </div>
            <Link
              to="/shop"
              search={{ q: "", category: "", department: "", view: "" }}
              className="text-xs font-semibold uppercase tracking-[0.16em] text-background underline underline-offset-4"
            >
              Compare everything
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {compareShowcase.map((p) => {
              const best = bestOffer(p);
              return (
                <Link
                  key={p.id}
                  to="/product/$slug"
                  params={{ slug: p.slug }}
                  className="rounded-lg bg-background p-5 text-foreground"
                >
                  <p className="editorial-eyebrow">{brandName(p.brand)}</p>
                  <h3 className="mt-2 text-xl leading-snug">{p.name}</h3>
                  <ul className="mt-4 space-y-2 text-sm">
                    {offersSorted(p)
                      .slice(0, 3)
                      .map((o) => (
                        <li key={o.store} className="flex items-center justify-between gap-3">
                          <span className="flex items-center gap-2 text-muted-foreground">
                            <StoreMark slug={o.store} /> {storeName(o.store)}
                          </span>
                          <span className={o.store === best.store ? "font-semibold" : "text-muted-foreground"}>
                            {format(o.price)}
                          </span>
                        </li>
                      ))}
                  </ul>
                  <p className="mt-4 border-t pt-3 text-sm">
                    <span className="font-semibold">Best price {format(best.price)}</span>{" "}
                    <span className="text-muted-foreground">at {storeName(best.store)}</span>
                  </p>
                  <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em]">
                    Shop now <ArrowRight className="h-4 w-4" />
                  </span>
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
        <div className="grid grid-cols-2 gap-x-5 gap-y-9 lg:grid-cols-4">
          {biggestDiscounts.slice(0, 8).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="border-y bg-cream">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
          <SectionHeading
            eyebrow="Sales calendar"
            title="Live & Upcoming Store Sales"
            description="Know whether to buy today or wait for the next markdown."
            href="/sales-calendar"
            linkLabel="Full calendar"
          />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {todaysSales.map((e) => (
              <Link
                key={e.id}
                to="/store/$slug"
                params={{ slug: e.store }}
                className="rounded-lg border bg-card p-5 transition-colors hover:border-clay"
              >
                <p className="editorial-eyebrow">{e.window === "today" ? "Today" : "Tomorrow"}</p>
                <h3 className="mt-2 text-lg leading-snug">{e.title}</h3>
                <p className="mt-1 text-sm font-semibold text-clay">{e.discount}</p>
                <p className="mt-2 text-xs text-muted-foreground">{e.detail}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {newArrivals.length ? (
        <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
          <SectionHeading eyebrow="New in" title="Just Landed" href="/shop" />
          <div className="grid grid-cols-2 gap-x-5 gap-y-9 lg:grid-cols-4">
            {newArrivals.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="border-y bg-cream">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
          <SectionHeading
            eyebrow="Stores"
            title="Shop Across Every Store"
            description="We compare live prices, stock and coupons from each retailer."
            href="/stores"
            linkLabel="All stores"
          />
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-3 lg:grid-cols-6">
            {stores.map((s) => (
              <Link
                key={s.slug}
                to="/store/$slug"
                params={{ slug: s.slug }}
                className="flex flex-col items-center gap-3 bg-card px-4 py-8 transition-colors hover:bg-cream"
              >
                <StoreMark slug={s.slug} size="lg" />
                <span className="text-center text-xs font-semibold uppercase tracking-[0.14em]">{s.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <SectionHeading eyebrow="Brands" title="Shop by Brand" href="/brands" linkLabel="All brands" />
        <div className="flex flex-wrap gap-3">
          {brands.slice(0, 14).map((b) => (
            <Link
              key={b.slug}
              to="/brand/$slug"
              params={{ slug: b.slug }}
              className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors hover:border-clay hover:text-clay"
            >
              <BrandMark slug={b.slug} size="sm" />
              {b.name}
            </Link>
          ))}
        </div>

        <div className="mt-14 rounded-lg border bg-cream p-8">
          <p className="editorial-eyebrow">Popular categories</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {["sneakers", "bags", "watches", "clothing", "beauty", "fitness", "travel", "jewelry"].map((c) => (
              <Link
                key={c}
                to="/shop"
                search={{ q: "", category: c, department: "", view: "" }}
                className="rounded-full border bg-card px-4 py-2 text-sm transition-colors hover:border-clay hover:text-clay"
              >
                {categoryName(c)}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Newsletter />
    </>
  );
}
