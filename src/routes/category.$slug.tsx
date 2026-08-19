import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/Breadcrumbs";
import { DealCard } from "@/components/DealCard";
import { CouponCard } from "@/components/CouponCard";
import { SectionHeading } from "@/components/SectionHeading";
import { Newsletter } from "@/components/Newsletter";
import { categories, coupons, dealsByCategory, guides } from "@/data/catalog";

export const Route = createFileRoute("/category/$slug")({
  loader: ({ params }) => {
    const category = categories.find((c) => c.slug === params.slug);
    if (!category) throw notFound();
    return { category };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Category not found | DealCanvas" }, { name: "robots", content: "noindex" }] };
    }
    const { category } = loaderData;
    const title = `${category.name} Deals & Discounts — Today's Best Offers | DealCanvas`;
    const description = `${category.tagline} Compare live ${category.name.toLowerCase()} deals, coupons and sales from top brands, updated daily.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: `/category/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/category/${params.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", item: "/" },
              { name: category.name, item: `/category/${params.slug}` },
            ]),
          ),
        },
      ],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { category } = Route.useLoaderData();
  const list = dealsByCategory(category.slug).filter((d) => d.status !== "EXPIRED");
  const brandSlugs = Array.from(new Set(list.map((d) => d.brand)));
  const catCoupons = coupons.filter((c) => brandSlugs.includes(c.brand));
  const catGuides = guides.filter((g) => g.category.toLowerCase() === category.name.toLowerCase());

  return (
    <>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: category.name }]} />

        <header className="mb-12 grid gap-8 border-b pb-10 md:grid-cols-2 md:items-center">
          <div>
            <p className="editorial-eyebrow">{list.length} live offers</p>
            <h1 className="mt-3 text-4xl md:text-5xl">{category.name} Deals</h1>
            <p className="mt-3 max-w-lg text-sm text-muted-foreground">{category.tagline}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {category.children.map((c: string) => (
                <Link
                  key={c}
                  to="/search"
                  search={{ q: c }}
                  className="rounded-full border px-4 py-1.5 text-xs transition-colors hover:border-clay hover:text-clay"
                >
                  {c}
                </Link>
              ))}
            </div>
          </div>
          <img
            src={category.image}
            alt={`${category.name} deals`}
            width={900}
            height={900}
            className="aspect-[16/10] w-full rounded-lg object-cover"
          />
        </header>

        <section className="mb-16">
          <SectionHeading eyebrow="Live now" title={`Best ${category.name} Offers`} />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {list.map((d) => (
              <DealCard key={d.id} deal={d} />
            ))}
          </div>
        </section>

        {catCoupons.length > 0 ? (
          <section className="mb-16">
            <SectionHeading eyebrow="Codes" title={`${category.name} Coupons`} href="/coupons" />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {catCoupons.slice(0, 3).map((c) => (
                <CouponCard key={c.id} coupon={c} />
              ))}
            </div>
          </section>
        ) : null}

        {catGuides.length > 0 ? (
          <section>
            <SectionHeading eyebrow="Reading" title={`${category.name} Shopping Guides`} href="/guides" />
            <div className="grid gap-6 md:grid-cols-3">
              {catGuides.map((g) => (
                <Link
                  key={g.slug}
                  to="/guides/$slug"
                  params={{ slug: g.slug }}
                  className="rounded-lg border bg-card p-5 transition-colors hover:border-clay"
                >
                  <p className="editorial-eyebrow">{g.readTime} read</p>
                  <h3 className="mt-2 text-lg leading-snug">{g.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{g.excerpt}</p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>
      <Newsletter />
    </>
  );
}
