import { createFileRoute, Link } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { seasonalSales, topDiscounts } from "@/data/catalog";
import { DealCard } from "@/components/DealCard";

export const Route = createFileRoute("/sale")({
  head: () => ({
    meta: [
      { title: "Seasonal Sales — July 4th, Black Friday & End of Season | DealCanvas" },
      { name: "description", content: "Every major shopping event in one place: July 4th, Black Friday, Cyber Monday, End of Season and New Year sales." },
      { property: "og:title", content: "Seasonal Sales | DealCanvas" },
      { property: "og:description", content: "Plan your year around the biggest discount windows." },
      { property: "og:url", content: "/sale" },
    ],
    links: [{ rel: "canonical", href: "/sale" }],
  }),
  component: SalePage,
});

function SalePage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Sale" }]} />
      <header className="mb-10 border-b pb-6">
        <p className="editorial-eyebrow">Sale calendar</p>
        <h1 className="mt-3 text-4xl md:text-5xl">Seasonal Sales</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          The shopping events worth waiting for, and the deals live right now.
        </p>
      </header>

      <div className="mb-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {seasonalSales.map((s) => (
          <Link
            key={s.slug}
            to="/sale/$slug"
            params={{ slug: s.slug }}
            className="rounded-lg border bg-card p-6 transition-colors hover:border-clay"
          >
            <h2 className="text-2xl">{s.name}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{s.blurb}</p>
          </Link>
        ))}
      </div>

      <h2 className="mb-6 border-b pb-4 text-3xl">Deepest Discounts Live Now</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {topDiscounts.slice(0, 8).map((d) => (
          <DealCard key={d.id} deal={d} />
        ))}
      </div>
    </div>
  );
}
