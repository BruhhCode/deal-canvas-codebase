import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/Breadcrumbs";
import { BrandMark } from "@/components/BrandMark";
import { DealBadge } from "@/components/DealBadge";
import { DealCard } from "@/components/DealCard";
import { CopyCode } from "@/components/CopyCode";
import { SectionHeading } from "@/components/SectionHeading";
import {
  affiliateUrl,
  brandName,
  deals,
  discountPct,
  expiryLabel,
  getDeal,
} from "@/data/catalog";
import { formatUsd, toUsd, useCurrency } from "@/lib/currency";

export const Route = createFileRoute("/deal/$slug")({
  loader: ({ params }) => {
    const deal = getDeal(params.slug);
    if (!deal) throw notFound();
    return { deal };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Deal not found | DealCanvas" }, { name: "robots", content: "noindex" }] };
    }
    const { deal } = loaderData;
    const title = `${deal.title} | DealCanvas`;
    const description = `${brandName(deal.brand)} ${deal.product} at ${formatUsd(deal.price)} (was ${formatUsd(
      deal.originalPrice,
    )}) — ${discountPct(deal)}% off.${deal.code ? ` Use code ${deal.code}.` : ""}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { property: "og:url", content: `/deal/${params.slug}` },
        ...(deal.status === "EXPIRED" ? [{ name: "robots", content: "index, follow" }] : []),
      ],
      links: [{ rel: "canonical", href: `/deal/${params.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: deal.product,
            description,
            brand: { "@type": "Brand", name: brandName(deal.brand) },
            offers: {
              "@type": "Offer",
              price: Math.round(toUsd(deal.price)),
              priceCurrency: "USD",
              availability:
                deal.status === "ACTIVE"
                  ? "https://schema.org/InStock"
                  : "https://schema.org/OutOfStock",
            },
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", item: "/" },
              { name: "Deals", item: "/deals" },
              { name: deal.product, item: `/deal/${params.slug}` },
            ]),
          ),
        },
      ],
    };
  },
  component: DealPage,
});

function DealPage() {
  const { deal } = Route.useLoaderData();
  const { format } = useCurrency();
  const expired = deal.status === "EXPIRED";
  const sameBrand = deals.filter((d) => d.brand === deal.brand && d.id !== deal.id && d.status === "ACTIVE");
  const similar = deals
    .filter((d) => d.category === deal.category && d.id !== deal.id && d.status === "ACTIVE")
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "Deals", to: "/deals" },
          { label: brandName(deal.brand), to: "/brand/$slug", params: { slug: deal.brand } },
          { label: deal.product },
        ]}
      />

      <div className="grid gap-10 lg:grid-cols-2">
        <img
          src={deal.image}
          alt={`${brandName(deal.brand)} ${deal.product}`}
          width={900}
          height={900}
          className="aspect-square w-full rounded-lg border object-cover"
        />

        <div>
          <div className="flex items-center gap-3">
            <BrandMark slug={deal.brand} />
            <Link
              to="/brand/$slug"
              params={{ slug: deal.brand }}
              className="text-sm font-semibold uppercase tracking-[0.16em] hover:text-clay"
            >
              {brandName(deal.brand)}
            </Link>
          </div>

          <h1 className="mt-4 text-3xl leading-tight md:text-4xl">{deal.title}</h1>

          <div className="mt-4 flex flex-wrap gap-2">
            {deal.badges.map((b: string) => (
              <DealBadge key={b} badge={b} />
            ))}
            <DealBadge badge={deal.status} />
          </div>

          {expired ? (
            <div className="mt-6 rounded-lg border border-dashed bg-cream p-5">
              <p className="font-semibold">This deal has expired.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                We've kept the page for reference. Similar active deals are listed below.
              </p>
            </div>
          ) : (
            <>
              <div className="mt-6 flex flex-wrap items-baseline gap-3">
                <span className="font-serif text-4xl">{format(deal.price)}</span>
                <span className="text-lg text-muted-foreground line-through">
                  {format(deal.originalPrice)}
                </span>
                <span className="rounded-sm bg-ink px-2 py-1 text-xs font-semibold text-background">
                  {discountPct(deal)}% OFF
                </span>
              </div>

              {deal.code ? (
                <div className="mt-5 max-w-xs">
                  <p className="editorial-eyebrow mb-2">Coupon code</p>
                  <CopyCode code={deal.code} />
                </div>
              ) : null}

              <p className="mt-4 text-sm text-clay">{expiryLabel(deal.expiresInHours)}</p>

              <a
                href={affiliateUrl(deal)}
                target="_blank"
                rel="nofollow sponsored noopener"
                className="mt-6 block rounded-sm bg-primary px-8 py-4 text-center text-sm font-semibold uppercase tracking-[0.16em] text-primary-foreground transition-colors hover:bg-clay hover:text-clay-foreground"
              >
                Get This Deal
              </a>
              <p className="mt-2 text-center text-xs text-muted-foreground">
                You'll be redirected to {brandName(deal.brand)}. We may earn a commission.
              </p>
            </>
          )}

          <div className="mt-8 space-y-4 border-t pt-6">
            <div>
              <h2 className="text-xl">About this deal</h2>
              <p className="mt-2 text-sm text-muted-foreground">{deal.description}</p>
            </div>
            <div>
              <h2 className="text-xl">Terms & conditions</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {deal.terms.map((t: string) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {similar.length > 0 ? (
        <section className="mt-16">
          <SectionHeading
            eyebrow={expired ? "Still available" : "You may also like"}
            title={expired ? "Similar Active Deals" : "Related Deals"}
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {similar.map((d) => (
              <DealCard key={d.id} deal={d} />
            ))}
          </div>
        </section>
      ) : null}

      {sameBrand.length > 0 ? (
        <section className="mt-16">
          <SectionHeading eyebrow="Same store" title={`More from ${brandName(deal.brand)}`} />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {sameBrand.slice(0, 4).map((d) => (
              <DealCard key={d.id} deal={d} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
