import { Fragment } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { AdSlot } from "@/components/AdSlot";
import { fetchPublishedBlogPosts } from "@/data/blog";
import { absoluteUrl } from "@/lib/site";

export const Route = createFileRoute("/blog")({
  loader: async () => ({ posts: await fetchPublishedBlogPosts() }),
  head: () => ({
    meta: [
      { title: "Blog — Shopping Advice, Style & Trends | DealsCanvas" },
      {
        name: "description",
        content:
          "DealsCanvas editorial: practical shopping advice, style guides, beauty routines and seasonal buying tips.",
      },
      { property: "og:title", content: "Blog | DealsCanvas" },
      { property: "og:description", content: "Shopping advice, style guides and seasonal buying tips." },
      { property: "og:url", content: absoluteUrl("/blog") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/blog") }],
  }),
  component: BlogPage,
});

function BlogPage() {
  const { posts } = Route.useLoaderData();
  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Blog" }]} />
      <header className="mb-8 border-b pb-6">
        <p className="editorial-eyebrow">Editorial</p>
        <h1 className="mt-3 text-4xl md:text-5xl">The DealsCanvas Blog</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Practical shopping advice, style guides and seasonal buying tips — written by our editors, not
          sponsored by any single brand.
        </p>
      </header>

      <AdSlot variant="leaderboard" className="mb-10" />

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, i) => (
          <Fragment key={post.slug}>
            <Link
              to="/blog/$slug"
              params={{ slug: post.slug }}
              className="group overflow-hidden rounded-lg border bg-card"
            >
              <img
                src={post.image}
                alt={post.title}
                loading="lazy"
                width={900}
                height={900}
                className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="p-5">
                <p className="editorial-eyebrow">
                  {post.category} · {post.readTime}
                </p>
                <h2 className="mt-2 text-xl leading-snug group-hover:text-clay">{post.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{post.excerpt}</p>
              </div>
            </Link>
            {/* In-feed ad every 6 posts, aligned to the grid like a card. */}
            {(i + 1) % 6 === 0 && i !== posts.length - 1 ? (
              <div className="flex items-center rounded-lg border border-dashed p-5">
                <AdSlot variant="rectangle" className="w-full" />
              </div>
            ) : null}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
