import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { DealCard } from "@/components/DealCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import {
  FilterCheckbox,
  FilterCheckboxList,
  FilterChips,
  FilterPanel,
  FilterRange,
  SortControl,
  renderSelectLike,
} from "@/components/FilterControls";
import { brandName, brands, categories, deals, discountPct, type Deal } from "@/data/catalog";
import { useCurrency } from "@/lib/currency";
import { useCatalogVersion } from "@/lib/live-catalog";
import { useFilterOverrides } from "@/lib/site-filters";
import { absoluteUrl } from "@/lib/site";

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
      { property: "og:url", content: absoluteUrl("/deals") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/deals") }],
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
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [brand, setBrand] = useState("all");
  const [minDiscount, setMinDiscount] = useState(0);
  const [maxPrice, setMaxPrice] = useState(200000);
  const [type, setType] = useState("all");
  const [includeExpired, setIncludeExpired] = useState(false);
  const [sort, setSort] = useState<(typeof sorts)[number]>("Trending");
  const overrides = useFilterOverrides("deals");

  const dealTypes = useMemo(() => Array.from(new Set(deals.map((d) => d.dealType))), [version]);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    const filtered = deals.filter((d) => {
      if (!includeExpired && d.status === "EXPIRED") return false;
      if (category !== "all" && d.category !== category) return false;
      if (brand !== "all" && d.brand !== brand) return false;
      if (discountPct(d) < minDiscount) return false;
      if (d.price > maxPrice) return false;
      if (type !== "all" && d.dealType !== type) return false;
      if (term) {
        const hay = [d.title, d.product, brandName(d.brand), ...d.tags].join(" ").toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });
    return sortDeals(filtered, sort);
  }, [q, category, brand, minDiscount, maxPrice, type, includeExpired, sort, version]);

  // Same "default + admin override" pattern as shop.tsx — see that file's
  // comment for why. overrides come from useFilterOverrides("deals").
  const categoryOverride = overrides["category"];
  const brandOverride = overrides["brand"];
  const dealTypeOverride = overrides["dealType"];
  const discountOverride = overrides["discount"];
  const priceOverride = overrides["price"];
  const includeExpiredOverride = overrides["includeExpired"];
  const sortOverride = overrides["sort"];

  const categoryOptions = categories.map((c) => ({ value: c.slug, label: c.name }));
  const brandOptions = brands.map((b) => ({ value: b.slug, label: b.name }));
  const dealTypeOptions = dealTypes.map((t) => ({ value: t, label: t }));

  const dealsFilterEntries = [
    {
      key: "category",
      order: categoryOverride?.sortOrder ?? 0,
      enabled: categoryOverride?.enabled ?? true,
      node: renderSelectLike(categoryOverride?.displayStyle ?? "dropdown", {
        label: categoryOverride?.label ?? "Category",
        value: category === "all" ? "" : category,
        onChange: (v: string) => setCategory(v || "all"),
        placeholder: "All categories",
        options: categoryOverride?.options ?? categoryOptions,
      }),
    },
    {
      key: "brand",
      order: brandOverride?.sortOrder ?? 1,
      enabled: brandOverride?.enabled ?? true,
      node: renderSelectLike(brandOverride?.displayStyle ?? "dropdown", {
        label: brandOverride?.label ?? "Brand",
        value: brand === "all" ? "" : brand,
        onChange: (v: string) => setBrand(v || "all"),
        placeholder: "All brands",
        options: brandOverride?.options ?? brandOptions,
      }),
    },
    {
      key: "dealType",
      order: dealTypeOverride?.sortOrder ?? 2,
      enabled: dealTypeOverride?.enabled ?? true,
      node: renderSelectLike(dealTypeOverride?.displayStyle ?? "dropdown", {
        label: dealTypeOverride?.label ?? "Deal type",
        value: type === "all" ? "" : type,
        onChange: (v: string) => setType(v || "all"),
        placeholder: "All types",
        options: dealTypeOverride?.options ?? dealTypeOptions,
      }),
    },
    {
      key: "discount",
      order: discountOverride?.sortOrder ?? 3,
      enabled: discountOverride?.enabled ?? true,
      node: (
        <FilterRange
          label={`${discountOverride?.label ?? "Minimum discount"}: ${minDiscount}%`}
          value={minDiscount}
          min={discountOverride?.minValue ?? 0}
          max={discountOverride?.maxValue ?? 80}
          step={discountOverride?.stepValue ?? 5}
          onChange={setMinDiscount}
        />
      ),
    },
    {
      key: "price",
      order: priceOverride?.sortOrder ?? 4,
      enabled: priceOverride?.enabled ?? true,
      node: (
        <FilterRange
          label={`${priceOverride?.label ?? "Max price"}: ${format(maxPrice)}`}
          value={maxPrice}
          min={priceOverride?.minValue ?? 1000}
          max={priceOverride?.maxValue ?? 200000}
          step={priceOverride?.stepValue ?? 1000}
          onChange={setMaxPrice}
        />
      ),
    },
    {
      key: "includeExpired",
      order: includeExpiredOverride?.sortOrder ?? 5,
      enabled: includeExpiredOverride?.enabled ?? true,
      node: (
        <FilterCheckbox
          label={includeExpiredOverride?.label ?? "Include expired deals"}
          checked={includeExpired}
          onChange={setIncludeExpired}
        />
      ),
    },
  ]
    .filter((e) => e.enabled)
    .sort((a, b) => a.order - b.order);

  const dealsSortOptions = sortOverride?.options ?? sorts.map((s) => ({ value: s, label: s }));
  const dealsSortDisplayStyle = sortOverride?.displayStyle ?? "dropdown";
  const dealsSortLabel = sortOverride?.label ?? "Sort";
  const sortControl =
    dealsSortDisplayStyle === "chips" ? (
      <FilterChips
        label={dealsSortLabel}
        value={sort}
        onChange={(v) => setSort(v as (typeof sorts)[number])}
        options={dealsSortOptions}
        clearable={false}
      />
    ) : dealsSortDisplayStyle === "checkbox-list" ? (
      <FilterCheckboxList
        label={dealsSortLabel}
        value={sort}
        onChange={(v) => setSort(v as (typeof sorts)[number])}
        options={dealsSortOptions}
        clearable={false}
      />
    ) : (
      <SortControl
        value={sort}
        onChange={(v) => setSort(v as (typeof sorts)[number])}
        options={dealsSortOptions}
        label={dealsSortLabel}
      />
    );

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Deals" }]} />

      <header className="mb-10 border-b pb-6">
        <p className="editorial-eyebrow">Deal directory</p>
        <h1 className="mt-3 text-4xl md:text-5xl">All Deals</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Every live offer we track across fashion, beauty, footwear, accessories and lifestyle. Filter, sort and click
          straight through to the merchant.
        </p>

        <div className="mt-5 flex w-full max-w-xl items-center gap-3 rounded-full border bg-card px-4 py-2.5 transition-colors focus-within:border-clay">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search deals"
            placeholder="Search deals by title, product or brand..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <FilterPanel sticky>
          <p className="editorial-eyebrow">Filters</p>

          {dealsFilterEntries.map((e) => (
            <div key={e.key}>{e.node}</div>
          ))}
        </FilterPanel>

        <div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">{results.length} deals</p>
            {sortControl}
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
