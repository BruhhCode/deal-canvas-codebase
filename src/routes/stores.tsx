import { createFileRoute, Link } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SectionHeading } from "@/components/SectionHeading";
import { StoreMark } from "@/components/StoreMark";
import { stores } from "@/data/stores";
import { productsByStore } from "@/data/products";

export const Route = createFileRoute("/stores")({
  head: () => ({
    meta: [
      { title: "All Stores We Track — Compare Prices | DealCanvas" },
      {
        name: "description",
        content:
          "Browse every retailer DealCanvas tracks — Nordstrom, Revolve, Nike, Adidas, Amazon Fashion, Ulta Beauty, Zara and more — with live product counts and store-wide offers.",
      },
      { property: "og:title", content: "All Stores | DealCanvas" },
      { property: "og:description", content: "Every store we compare prices across, in one directory." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StoresPage,
});

function StoresPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Stores" }]} />
      <header className="mb-10 max-w-2xl">
        <p className="editorial-eyebrow">{stores.length} stores</p>
        <h1 className="mt-3 text-4xl md:text-5xl">Every Store, One Search</h1>
        <p className="mt-4 text-muted-foreground">
          We pull live pricing and stock from each of these retailers so you can compare before you buy.
        </p>
      </header>

      <SectionHeading eyebrow="Directory" title="Store Directory" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stores.map((s) => (
          <Link
            key={s.slug}
            to="/store/$slug"
            params={{ slug: s.slug }}
            className="group rounded-lg border bg-card p-6 transition-colors hover:border-clay"
          >
            <div className="flex items-center gap-3">
              <StoreMark slug={s.slug} size="lg" />
              <div>
                <h2 className="text-lg group-hover:text-clay">{s.name}</h2>
                <p className="text-xs text-muted-foreground">
                  {productsByStore(s.slug).length} products tracked
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">{s.description}</p>
            {s.storeWideOffer ? (
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-clay">
                {s.storeWideOffer}
              </p>
            ) : null}
            {s.sponsored ? (
              <p className="mt-3 text-[10px] uppercase tracking-wider text-muted-foreground">Partner offer</p>
            ) : null}
          </Link>
        ))}
      </div>
    </div>
  );
}
