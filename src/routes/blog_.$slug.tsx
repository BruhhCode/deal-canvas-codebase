import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/Breadcrumbs";
import { SectionHeading } from "@/components/SectionHeading";
import { Newsletter } from "@/components/Newsletter";
import { AdSlot } from "@/components/AdSlot";
import { fetchPublishedBlogPosts } from "@/data/blog";
import { absoluteUrl } from "@/lib/site";

export const Route = createFileRoute("/blog_/$slug")({
  loader: async ({ params }) => {
    const allPosts = await fetchPublishedBlogPosts();
    const post = allPosts.find((p) => p.slug === params.slug);
    if (!post) throw notFound();
    return { post, allPosts };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Post not found | DealsCanvas" }, { name: "robots", content: "noindex" }] };
    }
    const { post } = loaderData;
    return {
      meta: [
        { title: `${post.title} | DealsCanvas Blog` },
        { name: "description", content: post.excerpt },
        { property: "og:title", content: post.title },
        { property: "og:description", content: post.excerpt },
        { property: "og:type", content: "article" },
        { property: "og:url", content: absoluteUrl(`/blog/${params.slug}`) },
      ],
      links: [{ rel: "canonical", href: absoluteUrl(`/blog/${params.slug}`) }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.excerpt,
            datePublished: post.published,
            author: { "@type": "Organization", name: post.author },
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", item: "/" },
              { name: "Blog", item: "/blog" },
              { name: post.title, item: `/blog/${params.slug}` },
            ]),
          ),
        },
      ],
    };
  },
  component: BlogPostPage,
});

function BlogPostPage() {
  const { post, allPosts } = Route.useLoaderData();
  const related = allPosts.filter((p) => p.slug !== post.slug && p.category === post.category).slice(0, 3);
  const midpoint = Math.ceil(post.body.length / 2);

  return (
    <>
      <div className="mx-auto max-w-7xl gap-10 px-6 py-10 lg:grid lg:grid-cols-[1fr_300px]">
        <article className="max-w-3xl">
          <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Blog", to: "/blog" }, { label: post.category }]} />
          <p className="editorial-eyebrow">
            {post.category} · {post.readTime} read · {post.published}
          </p>
          <h1 className="mt-4 text-4xl leading-tight md:text-5xl">{post.title}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{post.excerpt}</p>
          <p className="mt-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">By {post.author}</p>
          <img
            src={post.image}
            alt={post.title}
            width={900}
            height={900}
            className="mt-8 aspect-[16/9] w-full rounded-lg object-cover"
          />
          <div className="mt-8 space-y-5 text-base leading-relaxed">
            {post.body.slice(0, midpoint).map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>

          {/* In-article ad, between the first and second half of the body. */}
          <AdSlot variant="banner" className="my-8" />

          <div className="space-y-5 text-base leading-relaxed">
            {post.body.slice(midpoint).map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
        </article>

        <aside className="mt-10 hidden lg:mt-0 lg:block">
          <div className="sticky top-24 space-y-6">
            <AdSlot variant="rectangle" />
            <AdSlot variant="rectangle" />
          </div>
        </aside>
      </div>

      {related.length > 0 ? (
        <section className="mx-auto max-w-7xl px-6 pb-16">
          <SectionHeading eyebrow="Keep reading" title="More in This Category" href="/blog" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <Link
                key={p.slug}
                to="/blog/$slug"
                params={{ slug: p.slug }}
                className="group overflow-hidden rounded-lg border bg-card"
              >
                <img
                  src={p.image}
                  alt={p.title}
                  loading="lazy"
                  width={900}
                  height={900}
                  className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="p-5">
                  <p className="editorial-eyebrow">
                    {p.category} · {p.readTime}
                  </p>
                  <h3 className="mt-2 text-lg leading-snug group-hover:text-clay">{p.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <Newsletter />
    </>
  );
}
