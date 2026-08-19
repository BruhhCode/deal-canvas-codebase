import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { DealCard } from "@/components/DealCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { brands, categories, deals, discountPct, type Deal } from "@/data/catalog";

export const Route = createFileRoute("/deals")({
  head: () => ({
    meta: [
      { title: "All Deals — Fashion, Beauty & Lifestyle Offers | DealCanvas" },
      {
        name: "description",
        content:
          "Browse every live fashion, beauty, shoes, accessories, lifestyle and travel deal. Filter by brand, category, discount and deal type.",
      },
      { property: "og:title", content: "All Deals | DealCanvas" },
      { property: "og:description", content: "Every live deal, filterable by brand and discount." },
      { property: "og:url", content: "/deals" },
    ],
    links: [{ rel: "canonical", href: "/deals" }],
  }),
  component: DealsPage,
});

const sorts = [
  "Trending",
  "Newest",
  "Ending Soon",
  "Highest Discount",
  "Best Value",
  "Most Popular",
  "Editor's Choice",
] as const;

function sortDeals(list: Deal[], sort: (typeof sorts)[number]) {
  const copy = list.slice();
  switch (sort) {
    case "Newest":
      return copy.reverse();
    case "Ending Soon":
      return copy.sort((a, b) => a.expiresInHours - b.expiresInHours);
    case "Highest Discount":
      return copy.sort((a, b) => discountPct(b) - discountPct(a));
    case "Best Value":
      return copy.sort((a, b) => b.originalPrice - b.price - (a.originalPrice - a.price));
    case "Most Popular":
      return copy.sort((a, b) => b.clicks - a.clicks);
    case "Editor's Choice":
      return copy.sort(
        (a, b) => Number(b.badges.includes("EDITOR'S PICK")) - Number(a.badges.includes("EDITOR'S PICK")),
      );
    default:
      return copy.sort((a, b) => b.clicks - a.clicks);
  }
}

function DealsPage() {
  const [category, setCategory] = useState("all");
  const [brand, setBrand] = useState("all");
  const [minDiscount, setMinDiscount] = useState(0);
  const [maxPrice, setMaxPrice] = useState(200000);
  const [type, setType] = useState("all");
  const [includeExpired, setIncludeExpired] = useState(false);
  const [sort, setSort] = useState<(typeof sorts)[number]>("Trending");

  const dealTypes = useMemo(() => Array.from(new Set(deals.map((d) => d.dealType))), []);

  const results = useMemo(() => {
    const filtered = deals.filter(
      (d) =>
        (includeExpired || d.status !== "EXPIRED") &&
        (category === "all" || d.category === category) &&
        (brand === "all" || d.brand === brand) &&
        discountPct(d) >= minDiscount &&
        d.price <= maxPrice &&
        (type === "all" || d.dealType === type),
    );
    return sortDeals(filtered, sort);
  }, [category, brand, minDiscount, maxPrice, type, includeExpired, sort]);

  const select =
    "w-full rounded-sm border bg-card px-3 py-2 text-sm outline-none focus:border-clay";

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Deals" }]} />

      <header className="mb-10 border-b pb-6">
        <p className="editorial-eyebrow">Deal directory</p>
        <h1 className="mt-3 text-4xl md:text-5xl">All Deals</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Every live offer we track across fashion, beauty, footwear, accessories, lifestyle and
          travel. Filter, sort and click straight through to the merchant.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="h-fit space-y-5 rounded-lg border bg-card p-5 lg:sticky lg:top-36">
          <p className="editorial-eyebrow">Filters</p>

          <label className="block space-y-1.5 text-sm">
            <span className="font-medium">Category</span>
            <select className={select} value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="all">All categories</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </label>

          <label className="block space-y-1.5 text-sm">
            <span className="font-medium">Brand</span>
            <select className={select} value={brand} onChange={(e) => setBrand(e.target.value)}>
              <option value="all">All brands</option>
              {brands.map((b) => (
                <option key={b.slug} value={b.slug}>{b.name}</option>
              ))}
            </select>
          </label>

          <label className="block space-y-1.5 text-sm">
            <span className="font-medium">Deal type</span>
            <select className={select} value={type} onChange={(e) => setType(e.target.value)}>
              <option value="all">All types</option>
              {dealTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>

          <label className="block space-y-1.5 text-sm">
            <span className="font-medium">Minimum discount: {minDiscount}%</span>
            <input
              type="range"
              min={0}
              max={80}
              step={5}
              value={minDiscount}
              onChange={(e) => setMinDiscount(Number(e.target.value))}
              className="w-full accent-clay"
            />
          </label>

          <label className="block space-y-1.5 text-sm">
            <span className="font-medium">Max price: ₹{maxPrice.toLocaleString("en-IN")}</span>
            <input
              type="range"
              min={1000}
              max={200000}
              step={1000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-clay"
            />
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={includeExpired}
              onChange={(e) => setIncludeExpired(e.target.checked)}
              className="accent-clay"
            />
            Include expired deals
          </label>
        </aside>

        <div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">{results.length} deals</p>
            <label className="flex items-center gap-2 text-sm">
              <span className="editorial-eyebrow">Sort</span>
              <select
                className="rounded-sm border bg-card px-3 py-2 text-sm outline-none focus:border-clay"
                value={sort}
                onChange={(e) => setSort(e.target.value as (typeof sorts)[number])}
              >
                {sorts.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </label>
          </div>

          {results.length === 0 ? (
            <p className="rounded-lg border bg-cream p-10 text-center text-sm text-muted-foreground">
              No deals match these filters. Try widening your discount or price range.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((d) => (
                <DealCard key={d.id} deal={d} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
