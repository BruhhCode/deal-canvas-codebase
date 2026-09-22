import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { DealCard } from "@/components/DealCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FilterCheckbox, FilterPanel, FilterRange, FilterSelect, SortControl } from "@/components/FilterControls";
import { brands, categories, deals, discountPct, type Deal } from "@/data/catalog";
import { useCurrency } from "@/lib/currency";
import { useCatalogVersion } from "@/lib/live-catalog";

export const Route = createFileRoute("/deals")({
  head: () => ({
    meta: [
      { title: "All Deals — Fashion, Beauty & Lifestyle Offers | DealsCanvas" },
      {
        name: "description",
        content:
          "Browse every live fashion, beauty, shoes, accessories and lifestyle deal. Filter by brand, category, discount and deal type.",
      },
      { property: "og:title", content: "All Deals | DealsCanvas" },
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
  const { format } = useCurrency();
  const version = useCatalogVersion();
  const [category, setCategory] = useState("all");
  const [brand, setBrand] = useState("all");
  const [minDiscount, setMinDiscount] = useState(0);
  const [maxPrice, setMaxPrice] = useState(200000);
  const [type, setType] = useState("all");
  const [includeExpired, setIncludeExpired] = useState(false);
  const [sort, setSort] = useState<(typeof sorts)[number]>("Trending");

  const dealTypes = useMemo(() => Array.from(new Set(deals.map((d) => d.dealType))), [version]);

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
  }, [category, brand, minDiscount, maxPrice, type, includeExpired, sort, version]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Deals" }]} />

      <header className="mb-10 border-b pb-6">
        <p className="editorial-eyebrow">Deal directory</p>
        <h1 className="mt-3 text-4xl md:text-5xl">All Deals</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Every live offer we track across fashion, beauty, footwear, accessories and lifestyle.
          Filter, sort and click straight through to the merchant.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <FilterPanel sticky>
          <p className="editorial-eyebrow">Filters</p>

          <FilterSelect
            label="Category"
            value={category === "all" ? "" : category}
            onChange={(v) => setCategory(v || "all")}
            placeholder="All categories"
            options={categories.map((c) => ({ value: c.slug, label: c.name }))}
          />

          <FilterSelect
            label="Brand"
            value={brand === "all" ? "" : brand}
            onChange={(v) => setBrand(v || "all")}
            placeholder="All brands"
            options={brands.map((b) => ({ value: b.slug, label: b.name }))}
          />

          <FilterSelect
            label="Deal type"
            value={type === "all" ? "" : type}
            onChange={(v) => setType(v || "all")}
            placeholder="All types"
            options={dealTypes.map((t) => ({ value: t, label: t }))}
          />

          <FilterRange
            label={`Minimum discount: ${minDiscount}%`}
            value={minDiscount}
            min={0}
            max={80}
            step={5}
            onChange={setMinDiscount}
          />

          <FilterRange
            label={`Max price: ${format(maxPrice)}`}
            value={maxPrice}
            min={1000}
            max={200000}
            step={1000}
            onChange={setMaxPrice}
          />

          <FilterCheckbox label="Include expired deals" checked={includeExpired} onChange={setIncludeExpired} />
        </FilterPanel>

        <div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">{results.length} deals</p>
            <SortControl
              value={sort}
              onChange={(v) => setSort(v as (typeof sorts)[number])}
              options={sorts.map((s) => ({ value: s, label: s }))}
            />
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
