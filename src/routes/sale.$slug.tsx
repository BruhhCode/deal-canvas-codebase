import { createFileRoute, notFound } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { DealCard } from "@/components/DealCard";
import { Newsletter } from "@/components/Newsletter";
import { seasonalSales, topDiscounts } from "@/data/catalog";

export const Route = createFileRoute("/sale/$slug")({
  loader: ({ params }) => {
    const sale = seasonalSales.find((s) => s.slug === params.slug);
    if (!sale) throw notFound();
    return { sale };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Sale not found | DealCanvas" }, { name: "robots", content: "noindex" }] };
    }
    const { sale } = loaderData;
    const title = `${sale.name} — Best Offers Across Brands | DealCanvas`;
    return {
      meta: [
        { title },
        { name: "description", content: `${sale.blurb} Compare the best ${sale.name} deals and coupons from top fashion and lifestyle brands.` },
        { property: "og:title", content: title },
        { property: "og:description", content: sale.blurb },
        { property: "og:url", content: `/sale/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/sale/${params.slug}` }],
    };
  },
  component: SaleDetail,
});

function SaleDetail() {
  const { sale } = Route.useLoaderData();
  return (
    <>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Sale", to: "/sale" }, { label: sale.name }]} />
        <header className="mb-10 border-b pb-6">
          <p className="editorial-eyebrow">Seasonal event</p>
          <h1 className="mt-3 text-4xl md:text-5xl">{sale.name}</h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{sale.blurb}</p>
        </header>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {topDiscounts.slice(0, 12).map((d) => (
            <DealCard key={d.id} deal={d} />
          ))}
        </div>
      </div>
      <Newsletter />
    </>
  );
}
