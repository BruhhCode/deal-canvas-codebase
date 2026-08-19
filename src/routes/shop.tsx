import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SlidersHorizontal, X } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProductCard } from "@/components/ProductCard";
import { ProductSearch } from "@/components/ProductSearch";
import { brandName, brands } from "@/data/catalog";
import { stores } from "@/data/stores";
import {
  allColors,
  allSizes,
  departments,
  filterProducts,
  categoriesByDepartment,
  categoryName,
  popularSearches,
  searchProducts,
  sortOptions,
  sortProducts,
  type ProductFilters,
  type SortKey,
} from "@/data/products";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: String(search["q"] ?? ""),
    category: String(search["category"] ?? ""),
    department: String(search["department"] ?? ""),
    view: String(search["view"] ?? ""),
  }),
  head: () => ({
    meta: [
      { title: "Shop & Compare Fashion Products Across Stores | DealCanvas" },
      {
        name: "description",
        content:
          "Search thousands of fashion, beauty and lifestyle products, compare live prices across Myntra, AJIO, Nike, Adidas, Amazon and more, and shop at the lowest price.",
      },
      { property: "og:title", content: "Shop & Compare | DealCanvas" },
      { property: "og:description", content: "One search. Every store. The best current price." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ShopPage,
});

const PAGE_SIZE = 24;

function ShopPage() {
  const { q, category, department, view } = Route.useSearch();
  const [filters, setFilters] = useState<ProductFilters>({});
  const [sort, setSort] = useState<SortKey>(
    view === "trending" ? "popular" : view === "sale" ? "highest-discount" : "recommended",
  );
  const [page, setPage] = useState(1);
  const [sheet, setSheet] = useState(false);

  const active: ProductFilters = {
    ...filters,
    ...(category ? { category } : {}),
    ...(department ? { department } : {}),
    ...(view === "new" ? { newIn: true } : {}),
    ...(view === "sale" ? { sale: true } : {}),
  };

  const results = useMemo(
    () => sortProducts(filterProducts(searchProducts(q), active), sort),
    [q, JSON.stringify(active), sort],
  );

  const visible = results.slice(0, page * PAGE_SIZE);

  const set = (patch: ProductFilters) => {
    setFilters((f) => ({ ...f, ...patch }));
    setPage(1);
  };

  const heading = q
    ? `"${q}"`
    : view === "new"
      ? "New In"
      : view === "trending"
        ? "Trending Now"
        : view === "sale"
          ? "On Sale"
          : category
            ? categoryName(category)
            : "All Products";

  const filterUI = (
    <div className="space-y-7 text-sm">
      <FilterGroup label="Department">
        <Chips
          options={departments.map((d) => ({ value: d.slug, label: d.name }))}
          value={active.department ?? ""}
          onChange={(v) => set({ department: v, category: undefined })}
        />
      </FilterGroup>

      <FilterGroup label="Category">
        <Chips
          options={(active.department ? categoriesByDepartment(active.department) : [])
            .map((c) => ({ value: c.slug, label: c.name }))}
          value={active.category ?? ""}
          onChange={(v) => set({ category: v })}
          empty="Pick a department first"
        />
      </FilterGroup>

      <FilterGroup label="Gender">
        <Chips
          options={[
            { value: "women", label: "Women" },
            { value: "men", label: "Men" },
            { value: "unisex", label: "Unisex" },
          ]}
          value={active.gender ?? ""}
          onChange={(v) => set({ gender: v })}
        />
      </FilterGroup>

      <FilterGroup label="Brand">
        <Chips
          options={brands.map((b) => ({ value: b.slug, label: b.name }))}
          value={active.brand ?? ""}
          onChange={(v) => set({ brand: v })}
        />
      </FilterGroup>

      <FilterGroup label="Store">
        <Chips
          options={stores.map((s) => ({ value: s.slug, label: s.name }))}
          value={active.store ?? ""}
          onChange={(v) => set({ store: v })}
        />
      </FilterGroup>

      <FilterGroup label="Max price">
        <Chips
          options={[2000, 5000, 10000, 20000, 50000].map((p) => ({
            value: String(p),
            label: `Under ₹${p.toLocaleString("en-IN")}`,
          }))}
          value={active.maxPrice ? String(active.maxPrice) : ""}
          onChange={(v) => set({ maxPrice: v ? Number(v) : undefined })}
        />
      </FilterGroup>

      <FilterGroup label="Discount">
        <Chips
          options={[20, 30, 40, 50].map((d) => ({ value: String(d), label: `${d}%+ off` }))}
          value={active.minDiscount ? String(active.minDiscount) : ""}
          onChange={(v) => set({ minDiscount: v ? Number(v) : undefined })}
        />
      </FilterGroup>

      <FilterGroup label="Colour">
        <Chips
          options={allColors.map((c) => ({ value: c, label: c }))}
          value={active.color ?? ""}
          onChange={(v) => set({ color: v })}
        />
      </FilterGroup>

      <FilterGroup label="Size">
        <Chips
          options={allSizes.map((s) => ({ value: s, label: s }))}
          value={active.size ?? ""}
          onChange={(v) => set({ size: v })}
        />
      </FilterGroup>

      <FilterGroup label="More">
        <div className="flex flex-wrap gap-2">
          <Toggle on={!!active.inStock} onClick={() => set({ inStock: !active.inStock })}>
            In stock
          </Toggle>
          <Toggle on={!!active.sale} onClick={() => set({ sale: !active.sale })}>
            On sale
          </Toggle>
          <Toggle on={!!active.newIn} onClick={() => set({ newIn: !active.newIn })}>
            New in
          </Toggle>
          <Toggle on={!!active.coupon} onClick={() => set({ coupon: !active.coupon })}>
            Coupon available
          </Toggle>
        </div>
      </FilterGroup>

      <button
        type="button"
        onClick={() => {
          setFilters({});
          setPage(1);
        }}
        className="text-xs font-semibold uppercase tracking-[0.14em] underline underline-offset-4"
      >
        Clear all filters
      </button>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Shop" }]} />

      <div className="mb-8 max-w-3xl">
        <h1 className="text-4xl md:text-5xl">{heading}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {results.length} products from {stores.length} stores
        </p>
        <ProductSearch className="mt-5" size="sm" initial={q} />
        <div className="mt-3 flex flex-wrap gap-2">
          {popularSearches.slice(0, 6).map((t) => (
            <Link
              key={t}
              to="/shop"
              search={{ q: t, category: "", department: "", view: "" }}
              className="rounded-full border px-3 py-1 text-xs hover:border-clay hover:text-clay"
            >
              {t}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">{filterUI}</aside>

        <div>
          <div className="mb-6 flex items-center justify-between gap-3 border-b pb-4">
            <button
              type="button"
              onClick={() => setSheet(true)}
              className="flex items-center gap-2 rounded-sm border px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </button>
            <label className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
              Sort
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="rounded-sm border bg-card px-3 py-2 text-xs text-foreground outline-none"
              >
                {sortOptions.map((o) => (
                  <option key={o.key} value={o.key}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {visible.length ? (
            <>
              <div className="grid grid-cols-2 gap-x-5 gap-y-9 lg:grid-cols-4">
                {visible.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              {visible.length < results.length ? (
                <div className="mt-12 text-center">
                  <button
                    type="button"
                    onClick={() => setPage((p) => p + 1)}
                    className="rounded-sm border border-foreground px-8 py-3 text-xs font-semibold uppercase tracking-[0.14em] transition-colors hover:bg-foreground hover:text-background"
                  >
                    Load more ({results.length - visible.length} left)
                  </button>
                </div>
              ) : null}
            </>
          ) : (
            <p className="rounded-lg border bg-cream p-10 text-center text-sm text-muted-foreground">
              No products matched. Try a broader search such as "sneakers" or clear a filter.
            </p>
          )}
        </div>
      </div>

      {sheet ? (
        <div className="fixed inset-0 z-50 flex items-end bg-ink/40 lg:hidden" onClick={() => setSheet(false)}>
          <div
            className="max-h-[85vh] w-full overflow-y-auto rounded-t-lg bg-background p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg">Filters</h2>
              <button type="button" aria-label="Close filters" onClick={() => setSheet(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            {filterUI}
            <button
              type="button"
              onClick={() => setSheet(false)}
              className="mt-8 w-full rounded-sm bg-primary py-3 text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground"
            >
              Show {results.length} products
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="editorial-eyebrow mb-3">{label}</p>
      {children}
    </div>
  );
}

function Chips({
  options,
  value,
  onChange,
  empty,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string | undefined) => void;
  empty?: string;
}) {
  if (!options.length) return <p className="text-xs text-muted-foreground">{empty ?? "—"}</p>;
  return (
    <div className="flex max-h-52 flex-wrap gap-2 overflow-y-auto">
      {options.map((o) => (
        <Toggle key={o.value} on={value === o.value} onClick={() => onChange(value === o.value ? undefined : o.value)}>
          {o.label}
        </Toggle>
      ))}
    </div>
  );
}

function Toggle({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs transition-colors",
        on ? "border-foreground bg-foreground text-background" : "hover:border-clay hover:text-clay",
      )}
    >
      {children}
    </button>
  );
}
