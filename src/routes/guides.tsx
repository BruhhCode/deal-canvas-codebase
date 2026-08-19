import { createFileRoute, Link } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { guides } from "@/data/catalog";

export const Route = createFileRoute("/guides")({
  head: () => ({
    meta: [
      { title: "Shopping Guides — What to Buy and When | DealCanvas" },
      {
        name: "description",
        content:
          "Editor-written shopping guides on the best sneakers, fashion sales, beauty bundles and luxury discounts — each linked to live, verified deals.",
      },
      { property: "og:title", content: "Shopping Guides | DealCanvas" },
      { property: "og:description", content: "What to buy, when to buy it, and where it's cheapest." },
      { property: "og:url", content: "/guides" },
    ],
    links: [{ rel: "canonical", href: "/guides" }],
  }),
  component: GuidesPage,
});

function GuidesPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Guides" }]} />
      <header className="mb-10 border-b pb-6">
        <p className="editorial-eyebrow">Editorial</p>
        <h1 className="mt-3 text-4xl md:text-5xl">Shopping Guides</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          What should you buy? Our editors track prices across the year and only recommend what is
          genuinely discounted.
        </p>
      </header>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {guides.map((g) => (
          <Link
            key={g.slug}
            to="/guides/$slug"
            params={{ slug: g.slug }}
            className="group overflow-hidden rounded-lg border bg-card"
          >
            <img
              src={g.image}
              alt={g.title}
              loading="lazy"
              width={900}
              height={900}
              className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="p-5">
              <p className="editorial-eyebrow">
                {g.category} · {g.readTime}
              </p>
              <h2 className="mt-2 text-xl leading-snug group-hover:text-clay">{g.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{g.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
