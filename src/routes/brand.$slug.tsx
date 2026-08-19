import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/Breadcrumbs";
import { BrandMark } from "@/components/BrandMark";
import { DealCard } from "@/components/DealCard";
import { CouponCard } from "@/components/CouponCard";
import { SectionHeading } from "@/components/SectionHeading";
import { couponsByBrand, dealsByBrand, getBrand, guides } from "@/data/catalog";
import { ProductCard } from "@/components/ProductCard";
import { StoreMark } from "@/components/StoreMark";
import { storeName } from "@/data/stores";
import { newArrivals, productDiscount, productsByBrand } from "@/data/products";

export const Route = createFileRoute("/brand/$slug")({
  loader: ({ params }) => {
    const brand = getBrand(params.slug);
    if (!brand) throw notFound();
    return { brand };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Brand not found | DealCanvas" }, { name: "robots", content: "noindex" }] };
    }
    const { brand } = loaderData;
    const title = `${brand.name} Deals, Coupons & Offers — Save Today | DealCanvas`;
    const description = `Live ${brand.name} deals, discount codes and current sales, verified daily. ${brand.description}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: `/brand/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/brand/${params.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", item: "/" },
              { name: "Brands", item: "/brands" },
              { name: brand.name, item: `/brand/${params.slug}` },
            ]),
          ),
        },
      ],
    };
  },
  component: BrandPage,
});

function BrandPage() {
  const { brand } = Route.useLoaderData();
  const all = dealsByBrand(brand.slug);
  const active = all.filter((d) => d.status === "ACTIVE");
  const expired = all.filter((d) => d.status === "EXPIRED");
  const coupons = couponsByBrand(brand.slug);
  const related = guides.slice(0, 3);
  const brandProducts = productsByBrand(brand.slug);
  const popularProducts = brandProducts.slice().sort((a, b) => b.views - a.views);
  const brandNew = newArrivals.filter((p) => p.brand === brand.slug);
  const brandSale = brandProducts.filter((p) => productDiscount(p) >= 25).slice(0, 8);
  const availableStores = Array.from(
    new Set(brandProducts.flatMap((p) => p.offers.map((o) => o.store))),
  );

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <Breadcrumbs
        items={[{ label: "Home", to: "/" }, { label: "Brands", to: "/brands" }, { label: brand.name }]}
      />

      <header className="mb-12 flex flex-wrap items-start gap-6 border-b pb-8">
        <BrandMark slug={brand.slug} size="lg" />
        <div className="max-w-2xl">
          <p className="editorial-eyebrow">
            {brand.category} · {active.length} live deals · {coupons.length} coupons
          </p>
          <h1 className="mt-3 text-4xl md:text-5xl">{brand.name} Deals & Coupons</h1>
          <p className="mt-3 text-sm text-muted-foreground">{brand.description}</p>
          <a
            href={`https://track.dealcanvas.example/click?merchant=${brand.slug}&network=${encodeURIComponent(brand.network)}`}
            target="_blank"
            rel="nofollow sponsored noopener"
            className="mt-6 inline-block rounded-sm bg-primary px-7 py-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-clay hover:text-clay-foreground"
          >
            Shop All Deals
          </a>
        </div>
      </header>

      {popularProducts.length > 0 ? (
        <section className="mb-16">
          <SectionHeading
            eyebrow="Products"
            title={`Popular ${brand.name} Products`}
            description="Live prices compared across every store stocking this brand."
          />
          <div className="grid grid-cols-2 gap-x-5 gap-y-9 lg:grid-cols-4">
            {popularProducts.slice(0, 8).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : null}

      {brandNew.length > 0 ? (
        <section className="mb-16">
          <SectionHeading eyebrow="New in" title={`New ${brand.name} Arrivals`} />
          <div className="grid grid-cols-2 gap-x-5 gap-y-9 lg:grid-cols-4">
            {brandNew.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : null}

      {brandSale.length > 0 ? (
        <section className="mb-16">
          <SectionHeading eyebrow="Sale" title={`${brand.name} on Sale`} />
          <div className="grid grid-cols-2 gap-x-5 gap-y-9 lg:grid-cols-4">
            {brandSale.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : null}

      {availableStores.length > 0 ? (
        <section className="mb-16">
          <SectionHeading eyebrow="Where to buy" title={`Stores Selling ${brand.name}`} href="/stores" />
          <div className="flex flex-wrap gap-3">
            {availableStores.map((st) => (
              <Link
                key={st}
                to="/store/$slug"
                params={{ slug: st }}
                className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm hover:border-clay hover:text-clay"
              >
                <StoreMark slug={st} /> {storeName(st)}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {active.length > 0 ? (
        <section className="mb-16">
          <SectionHeading eyebrow="Live now" title={`Current ${brand.name} Deals`} />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {active.map((d) => (
              <DealCard key={d.id} deal={d} />
            ))}
          </div>
        </section>
      ) : null}

      {coupons.length > 0 ? (
        <section className="mb-16">
          <SectionHeading eyebrow="Codes" title={`${brand.name} Coupon Codes`} />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {coupons.map((c) => (
              <CouponCard key={c.id} coupon={c} />
            ))}
          </div>
        </section>
      ) : null}

      {expired.length > 0 ? (
        <section className="mb-16">
          <SectionHeading
            eyebrow="Archive"
            title="Expired Deals"
            description="Kept for reference — these prices are no longer available."
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {expired.map((d) => (
              <DealCard key={d.id} deal={d} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mb-4">
        <SectionHeading eyebrow="Reading" title={`Guides featuring ${brand.name}`} />
        <div className="grid gap-6 md:grid-cols-3">
          {related.map((g) => (
            <Link
              key={g.slug}
              to="/guides/$slug"
              params={{ slug: g.slug }}
              className="rounded-lg border bg-card p-5 transition-colors hover:border-clay"
            >
              <p className="editorial-eyebrow">{g.category}</p>
              <h3 className="mt-2 text-lg leading-snug">{g.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{g.excerpt}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
