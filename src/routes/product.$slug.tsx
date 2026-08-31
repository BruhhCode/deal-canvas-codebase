import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Clock, Eye, Star } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { BrandMark } from "@/components/BrandMark";
import { PriceCompare } from "@/components/PriceCompare";
import { PriceAlert } from "@/components/PriceAlert";
import { ProductCard } from "@/components/ProductCard";
import { SectionHeading } from "@/components/SectionHeading";
import { WishlistButton } from "@/components/WishlistButton";
import { brandName } from "@/data/catalog";
import { storeName } from "@/data/stores";
import {
  bestOffer,
  categoryName,
  getProduct,
  lastUpdatedLabel,
  productDiscount,
  relatedProducts,
  savingsVsHighest,
} from "@/data/products";
import { formatUsd, toUsd, useCurrency } from "@/lib/currency";

export const Route = createFileRoute("/product/$slug")({
  loader: ({ params }) => {
    const product = getProduct(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Product unavailable | DealCanvas" }, { name: "robots", content: "noindex" }] };
    }
    const p = loaderData.product;
    const best = bestOffer(p);
    const title = `${brandName(p.brand)} ${p.name} — Compare Prices Across ${p.offers.length} Stores`;
    const description = `${brandName(p.brand)} ${p.name} from ${formatUsd(best.price)} at ${storeName(best.store)}. Compare live prices, stock and coupons across every store we track.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const { format } = useCurrency();
  const best = bestOffer(product);
  const discount = productDiscount(product);
  const saving = savingsVsHighest(product);
  const related = relatedProducts(product);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${brandName(product.brand)} ${product.name}`,
    brand: { "@type": "Brand", name: brandName(product.brand) },
    description: product.description,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviews,
    },
    offers: product.offers.map((o) => ({
      "@type": "Offer",
      price: Math.round(toUsd(o.price)),
      priceCurrency: "USD",
      availability:
        o.availability === "OUT OF STOCK"
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
      seller: { "@type": "Organization", name: storeName(o.store) },
    })),
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "Shop", to: "/shop" },
          { label: product.name },
        ]}
      />

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-lg bg-cream">
          <img
            src={product.image}
            alt={`${brandName(product.brand)} ${product.name}`}
            width={900}
            height={900}
            className="aspect-square w-full object-cover"
          />
          <WishlistButton id={product.id} className="absolute right-4 top-4" />
        </div>

        <div>
          <Link
            to="/brand/$slug"
            params={{ slug: product.brand }}
            className="flex items-center gap-2 editorial-eyebrow hover:text-clay"
          >
            <BrandMark slug={product.brand} size="sm" />
            {brandName(product.brand)}
          </Link>
          <h1 className="mt-3 text-4xl leading-tight md:text-5xl">{product.name}</h1>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-current" /> {product.rating.toFixed(1)} ({product.reviews})
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" /> {(product.views / 1000).toFixed(1)}k views this month
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" /> {lastUpdatedLabel(product)}
            </span>
          </div>

          <div className="mt-6 flex flex-wrap items-baseline gap-3">
            <span className="text-3xl font-semibold">{format(best.price)}</span>
            <span className="text-base text-muted-foreground line-through">{format(best.originalPrice)}</span>
            <span className="rounded-sm bg-ink px-2 py-1 text-xs font-semibold text-background">
              {discount}% OFF
            </span>
          </div>
          {saving > 0 ? (
            <p className="mt-2 text-sm text-clay">
              Save {format(saving)} by buying at {storeName(best.store)} instead of the priciest store.
            </p>
          ) : null}

          <p className="mt-6 max-w-prose text-sm text-muted-foreground">{product.description}</p>

          <dl className="mt-6 grid grid-cols-2 gap-4 border-t pt-6 text-sm">
            <div>
              <dt className="editorial-eyebrow">Category</dt>
              <dd className="mt-1">
                {categoryName(product.category)} · {product.subcategory}
              </dd>
            </div>
            <div>
              <dt className="editorial-eyebrow">Gender</dt>
              <dd className="mt-1 capitalize">{product.gender}</dd>
            </div>
            {product.colors.length ? (
              <div>
                <dt className="editorial-eyebrow">Colours</dt>
                <dd className="mt-1">{product.colors.join(", ")}</dd>
              </div>
            ) : null}
            {product.sizes.length ? (
              <div>
                <dt className="editorial-eyebrow">Sizes</dt>
                <dd className="mt-1">{product.sizes.join(", ")}</dd>
              </div>
            ) : null}
            <div>
              <dt className="editorial-eyebrow">Product ID</dt>
              <dd className="mt-1">{product.id}</dd>
            </div>
            <div>
              <dt className="editorial-eyebrow">Stores tracked</dt>
              <dd className="mt-1">{product.offers.length}</dd>
            </div>
          </dl>
        </div>
      </div>

      <section className="mt-14 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <SectionHeading eyebrow="Compare" title="Where to Buy" />
          <PriceCompare product={product} />
        </div>
        <div className="space-y-6">
          <PriceAlert productId={product.id} currentPrice={best.price} />
          <div className="rounded-lg border p-5 text-sm text-muted-foreground">
            <p className="editorial-eyebrow text-foreground">How we price</p>
            <p className="mt-2">
              Prices come from merchant feeds and are refreshed through the day. We show the cheapest
              in-stock listing first and mark stores that have run out. Clicking through supports
              DealCanvas through affiliate commission — it never changes your price.
            </p>
          </div>
        </div>
      </section>

      {related.length ? (
        <section className="mt-16">
          <SectionHeading eyebrow="You may also like" title="Similar Products" href="/shop" />
          <div className="grid grid-cols-2 gap-x-5 gap-y-9 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
