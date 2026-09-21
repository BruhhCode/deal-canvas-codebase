import { createFileRoute, notFound } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { supabase } from "@/lib/supabase";

type PageRow = {
  slug: string;
  title: string;
  content: string;
  meta_description: string | null;
  status: string;
};

export const Route = createFileRoute("/pages/$slug")({
  // Fetched server-side per request (not baked into the static bundle like
  // the product catalog) — a CMS page is expected to change without a
  // redeploy, and traffic here is low enough that a fresh query per load is
  // fine.
  loader: async ({ params }) => {
    if (!supabase) throw notFound();
    const { data } = await supabase
      .from("pages")
      .select("*")
      .eq("slug", params.slug)
      .eq("status", "PUBLISHED")
      .maybeSingle();
    if (!data) throw notFound();
    return { page: data as PageRow };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Page not found | DealsCanvas" }, { name: "robots", content: "noindex" }] };
    }
    const { page } = loaderData;
    return {
      meta: [
        { title: `${page.title} | DealsCanvas` },
        ...(page.meta_description ? [{ name: "description", content: page.meta_description }] : []),
        { property: "og:title", content: page.title },
        { property: "og:url", content: `/pages/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/pages/${params.slug}` }],
    };
  },
  component: CmsPage,
});

function CmsPage() {
  const { page } = Route.useLoaderData();
  // Paragraphs are separated by a blank line, same convention as the
  // static guides — content is plain text, not HTML, so there's nothing to
  // sanitize and no dangerouslySetInnerHTML needed.
  const paragraphs = page.content.split(/\n\s*\n/).filter((p) => p.trim().length > 0);

  return (
    <article className="mx-auto max-w-3xl px-6 py-10">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: page.title }]} />
      <h1 className="mt-4 text-4xl leading-tight md:text-5xl">{page.title}</h1>
      <div className="mt-8 space-y-5 text-base leading-relaxed">
        {paragraphs.map((p) => (
          <p key={p.slice(0, 32)}>{p}</p>
        ))}
      </div>
    </article>
  );
}
