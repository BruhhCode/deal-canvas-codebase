import { createFileRoute } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { supabase } from "@/lib/supabase";
import { absoluteUrl } from "@/lib/site";

type FaqRow = {
  id: string;
  section: string;
  question: string;
  answer: string;
  sort_order: number;
};

export const Route = createFileRoute("/faq")({
  loader: async () => {
    if (!supabase) return { faqs: [] as FaqRow[] };
    const { data } = await supabase.from("faqs").select("*").order("sort_order");
    return { faqs: (data ?? []) as FaqRow[] };
  },
  head: ({ loaderData }) => {
    const faqs = loaderData?.faqs ?? [];
    return {
      meta: [
        { title: "FAQ | DealsCanvas" },
        {
          name: "description",
          content: "Answers to common questions about shopping, deals, orders and accounts on DealsCanvas.",
        },
        { property: "og:title", content: "FAQ | DealsCanvas" },
        { property: "og:url", content: absoluteUrl("/faq") },
      ],
      links: [{ rel: "canonical", href: absoluteUrl("/faq") }],
      scripts:
        faqs.length > 0
          ? [
              {
                type: "application/ld+json",
                children: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "FAQPage",
                  mainEntity: faqs.map((f) => ({
                    "@type": "Question",
                    name: f.question,
                    acceptedAnswer: { "@type": "Answer", text: f.answer },
                  })),
                }),
              },
            ]
          : [],
    };
  },
  component: FaqPage,
});

function FaqPage() {
  const { faqs } = Route.useLoaderData();
  const sections = Array.from(new Set(faqs.map((f) => f.section)));

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-10">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "FAQ" }]} />

      <header className="mb-10 border-b pb-6">
        <p className="editorial-eyebrow">Help</p>
        <h1 className="mt-3 text-4xl md:text-5xl">Frequently Asked Questions</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Can't find what you're looking for? <a href="/contact" className="text-clay hover:underline">Contact us</a>{" "}
          and we'll get back to you.
        </p>
      </header>

      {sections.length === 0 ? (
        <p className="text-sm text-muted-foreground">No FAQs published yet.</p>
      ) : (
        <div className="space-y-10">
          {sections.map((section) => (
            <section key={section}>
              <h2 className="mb-4 text-xl">{section}</h2>
              <div className="divide-y rounded-lg border bg-card">
                {faqs
                  .filter((f) => f.section === section)
                  .map((f) => (
                    <details key={f.id} className="group p-4">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium marker:content-none">
                        {f.question}
                        <span className="shrink-0 text-lg text-muted-foreground transition-transform group-open:rotate-45">
                          +
                        </span>
                      </summary>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.answer}</p>
                    </details>
                  ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
