import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { BrandMark } from "@/components/BrandMark";
import { brands, dealsByBrand } from "@/data/catalog";

export const Route = createFileRoute("/brands")({
  head: () => ({
    meta: [
      { title: "All Brands — Browse Fashion & Lifestyle Stores A–Z | DealCanvas" },
      {
        name: "description",
        content:
          "Browse every brand we track alphabetically, from Adidas and AJIO to Zara. Each brand page lists live deals, coupons and current sales.",
      },
      { property: "og:title", content: "All Brands A–Z | DealCanvas" },
      { property: "og:description", content: "Every store we track, with live deals and coupons." },
      { property: "og:url", content: "/brands" },
    ],
    links: [{ rel: "canonical", href: "/brands" }],
  }),
  component: BrandsPage,
});

function BrandsPage() {
  const [q, setQ] = useState("");

  const grouped = useMemo(() => {
    const filtered = brands
      .filter((b) => b.name.toLowerCase().includes(q.trim().toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
    const map = new Map<string, typeof brands>();
    for (const b of filtered) {
      const letter = b.name[0]!.toUpperCase();
      map.set(letter, [...(map.get(letter) ?? []), b]);
    }
    return Array.from(map.entries());
  }, [q]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Brands" }]} />
      <header className="mb-8 border-b pb-6">
        <p className="editorial-eyebrow">{brands.length} brands</p>
        <h1 className="mt-3 text-4xl md:text-5xl">All Brands</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Browse alphabetically or search for the store you shop most.
        </p>
        <div className="mt-6 flex max-w-md items-center gap-2 rounded-sm border bg-card px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search brands..."
            aria-label="Search brands"
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
      </header>

      {grouped.length === 0 ? (
        <p className="text-sm text-muted-foreground">No brands match that search.</p>
      ) : (
        <div className="space-y-10">
          {grouped.map(([letter, list]) => (
            <section key={letter}>
              <h2 className="mb-4 border-b pb-2 font-serif text-2xl">{letter}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {list.map((b) => (
                  <Link
                    key={b.slug}
                    to="/brand/$slug"
                    params={{ slug: b.slug }}
                    className="flex items-center gap-3 rounded-lg border bg-card p-4 transition-colors hover:border-clay"
                  >
                    <BrandMark slug={b.slug} />
                    <span>
                      <span className="block text-sm font-semibold">{b.name}</span>
                      <span className="block text-xs text-muted-foreground">
                        {dealsByBrand(b.slug).length} deals · {b.category}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
