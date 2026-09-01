import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, SlidersHorizontal, X } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProductCard } from "@/components/ProductCard";
import { ProductSearch } from "@/components/ProductSearch";
import { brands } from "@/data/catalog";
import { stores } from "@/data/stores";
import {
  allColors,
  allSizes,
  departments,
  filterProducts,
  categoriesByDepartment,
  categoryName,
  searchProducts,
  sortOptions,
  sortProducts,
  type ProductFilters,
  type SortKey,
} from "@/data/products";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/lib/currency";
import { seededShuffle } from "@/lib/seeded-shuffle";

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: String(search["q"] ?? ""),
    category: String(search["category"] ?? ""),
    department: String(search["department"] ?? ""),
    view: String(search["view"] ?? ""),
    store: String(search["store"] ?? ""),
  }),
  // staleTime: 0 forces this loader to re-run on every navigation to /shop
  // (including a hard refresh) rather than reusing a cached result, so the
  // default "Recommended" browse order gets a fresh shuffle each time
  // instead of always leading with the exact same page 1 — see how `seed`
  // is used below.
  staleTime: 0,
  loader: () => ({ seed: `${Date.now()}-${Math.random()}` }),
  head: () => ({
    meta: [
      { title: "Shop & Compare Fashion Products Across Stores | DealCanvas" },
      {
        name: "description",
        content:
          "Search thousands of fashion, beauty and lifestyle products, compare live prices across Nordstrom, Revolve, Nike, Adidas, Amazon and more, and shop at the lowest price.",
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

/**
 * `key`-ed on the URL's category/department/store/view below so that a nav
 * link changing any of them (e.g. clicking "Trending" after "Sale") remounts
 * this component instead of reusing the existing instance — TanStack Router
 * only re-runs `useSearch()` on a same-route navigation, it doesn't remount
 * the component, so a plain `useState(() => seedFromUrl())` would only ever
 * seed once. Remounting also means these seeded values are correct on the
 * very first server-rendered paint, not just after a client-only effect.
 */
function ShopPage() {
  const { category, department, view, store } = Route.useSearch();
  return <ShopView key={`${category}|${department}|${store}|${view}`} />;
}

function ShopView() {
  const { format } = useCurrency();
  const { q, category, department, view, store } = Route.useSearch();
  const { seed } = Route.useLoaderData();
  const [filters, setFilters] = useState<ProductFilters>(() => ({
    ...(category ? { category } : {}),
    ...(department ? { department } : {}),
    ...(store ? { store } : {}),
    ...(view === "new" ? { newIn: true } : {}),
    ...(view === "sale" ? { sale: true } : {}),
  }));
  const [sort, setSort] = useState<SortKey>(
    view === "trending" ? "popular" : view === "sale" ? "highest-discount" : "recommended",
  );
  const [page, setPage] = useState(1);
  const [sheet, setSheet] = useState(false);

  const active: ProductFilters = filters;

  const results = useMemo(() => {
    const matched = filterProducts(searchProducts(q), active);
    if (sort !== "recommended") return sortProducts(matched, sort);

    // The default "Recommended" order is score-based (discount + rating),
    // and real ties in that score are rare — shuffling before that sort
    // barely changes anything, since the same handful of highest-score
    // products still wins every time. So instead: rank everything, shuffle
    // *within* a generous top slice each time this page loads, and leave
    // the (less relevant) remainder in its normal order. That's what
    // actually makes page 1 show different products on repeat visits while
    // still only ever surfacing well-scoring items.
    const ranked = sortProducts(matched, "recommended");
    const poolSize = Math.min(ranked.length, 300);
    return [...seededShuffle(ranked.slice(0, poolSize), seed), ...ranked.slice(poolSize)];
  }, [q, JSON.stringify(active), sort, seed]);

  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visible = results.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [q, JSON.stringify(active), sort]);

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
          options={brands
            .map((b) => ({ value: b.slug, label: b.name }))
            .sort((a, b) => a.label.localeCompare(b.label))}
          value={active.brand ?? ""}
          onChange={(v) => set({ brand: v })}
        />
      </FilterGroup>

      <FilterGroup label="Store">
        <Chips
          options={stores
            .map((s) => ({ value: s.slug, label: s.name }))
            .sort((a, b) => a.label.localeCompare(b.label))}
          value={active.store ?? ""}
          onChange={(v) => set({ store: v })}
        />
      </FilterGroup>

      <FilterGroup label="Max price">
        <Chips
          options={[2000, 5000, 10000, 20000, 50000].map((p) => ({
            value: String(p),
            label: `Under ${format(p)}`,
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
              {totalPages > 1 ? (
                <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />
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

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  const go = (p: number) => {
    onChange(Math.min(Math.max(p, 1), totalPages));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const windowSize = 5;
  let start = Math.max(1, page - Math.floor(windowSize / 2));
  const end = Math.min(totalPages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  return (
    <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => go(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
        className="flex h-9 w-9 items-center justify-center rounded-sm border border-foreground transition-colors hover:bg-foreground hover:text-background disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {start > 1 ? (
        <>
          <PageButton n={1} active={page === 1} onClick={go} />
          {start > 2 ? <span className="px-1 text-sm text-muted-foreground">…</span> : null}
        </>
      ) : null}

      {pages.map((n) => (
        <PageButton key={n} n={n} active={n === page} onClick={go} />
      ))}

      {end < totalPages ? (
        <>
          {end < totalPages - 1 ? <span className="px-1 text-sm text-muted-foreground">…</span> : null}
          <PageButton n={totalPages} active={page === totalPages} onClick={go} />
        </>
      ) : null}

      <button
        type="button"
        onClick={() => go(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
        className="flex h-9 w-9 items-center justify-center rounded-sm border border-foreground transition-colors hover:bg-foreground hover:text-background disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-foreground"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}

function PageButton({ n, active, onClick }: { n: number; active: boolean; onClick: (n: number) => void }) {
  return (
    <button
      type="button"
      aria-current={active ? "page" : undefined}
      onClick={() => onClick(n)}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-sm border text-xs font-semibold transition-colors",
        active ? "border-foreground bg-foreground text-background" : "hover:border-clay hover:text-clay",
      )}
    >
      {n}
    </button>
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
