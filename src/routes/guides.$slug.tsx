import { createFileRoute, notFound } from "@tanstack/react-router";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/Breadcrumbs";
import { DealCard } from "@/components/DealCard";
import { SectionHeading } from "@/components/SectionHeading";
import { Newsletter } from "@/components/Newsletter";
import { deals, guides } from "@/data/catalog";

export const Route = createFileRoute("/guides/$slug")({
  loader: ({ params }) => {
    const guide = guides.find((g) => g.slug === params.slug);
    if (!guide) throw notFound();
    return { guide };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Guide not found | DealCanvas" }, { name: "robots", content: "noindex" }] };
    }
    const { guide } = loaderData;
    return {
      meta: [
        { title: `${guide.title} | DealCanvas` },
        { name: "description", content: guide.excerpt },
        { property: "og:title", content: guide.title },
        { property: "og:description", content: guide.excerpt },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/guides/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/guides/${params.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: guide.title,
            description: guide.excerpt,
            datePublished: guide.published,
            author: { "@type": "Organization", name: "DealCanvas" },
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", item: "/" },
              { name: "Guides", item: "/guides" },
              { name: guide.title, item: `/guides/${params.slug}` },
            ]),
          ),
        },
      ],
    };
  },
  component: GuidePage,
});

function GuidePage() {
  const { guide } = Route.useLoaderData();
  const related = deals
    .filter((d) => d.status === "ACTIVE" && d.tags.some((t) => guide.dealTags.includes(t)))
    .slice(0, 8);

  return (
    <>
      <article className="mx-auto max-w-3xl px-6 py-10">
        <Breadcrumbs
          items={[{ label: "Home", to: "/" }, { label: "Guides", to: "/guides" }, { label: guide.category }]}
        />
        <p className="editorial-eyebrow">
          {guide.category} · {guide.readTime} read · {guide.published}
        </p>
        <h1 className="mt-4 text-4xl leading-tight md:text-5xl">{guide.title}</h1>
        <p className="mt-4 text-lg text-muted-foreground">{guide.excerpt}</p>
        <img
          src={guide.image}
          alt={guide.title}
          width={900}
          height={900}
          className="mt-8 aspect-[16/9] w-full rounded-lg object-cover"
        />
        <div className="mt-8 space-y-5 text-base leading-relaxed">
          {guide.body.map((p: string) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
      </article>

      {related.length > 0 ? (
        <section className="mx-auto max-w-7xl px-6 pb-16">
          <SectionHeading
            eyebrow="Shop the guide"
            title="Live Deals Mentioned Above"
            href="/deals"
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((d) => (
              <DealCard key={d.id} deal={d} />
            ))}
          </div>
        </section>
      ) : null}

      <Newsletter />
    </>
  );
}
