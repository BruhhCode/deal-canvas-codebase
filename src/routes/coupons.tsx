import { createFileRoute } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CouponCard } from "@/components/CouponCard";
import { Newsletter } from "@/components/Newsletter";
import { coupons } from "@/data/catalog";

export const Route = createFileRoute("/coupons")({
  head: () => ({
    meta: [
      { title: "Coupons & Promo Codes — Verified Fashion Discount Codes | DealCanvas" },
      {
        name: "description",
        content:
          "Working coupons and promo codes for Nordstrom, Nike, Revolve, Zara, Ulta Beauty, Levi's and more. Reveal the code, copy it and shop the discount.",
      },
      { property: "og:title", content: "Coupons & Promo Codes | DealCanvas" },
      { property: "og:description", content: "Verified discount codes from top fashion brands." },
      { property: "og:url", content: "/coupons" },
    ],
    links: [{ rel: "canonical", href: "/coupons" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "How do I use a coupon code?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Click Show Code, copy the code, then paste it into the promo code field at the merchant's checkout.",
              },
            },
            {
              "@type": "Question",
              name: "Are these coupon codes verified?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Each code is tested against a live cart and shows a success rate based on recent shopper feedback.",
              },
            },
          ],
        }),
      },
    ],
  }),
  component: CouponsPage,
});

function CouponsPage() {
  return (
    <>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Coupons" }]} />
        <header className="mb-10 border-b pb-6">
          <p className="editorial-eyebrow">{coupons.length} verified codes</p>
          <h1 className="mt-3 text-4xl md:text-5xl">Coupons & Promo Codes</h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            Every code below is tested against a live cart before it is published. Reveal, copy and
            apply at checkout.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {coupons.map((c) => (
            <CouponCard key={c.id} coupon={c} />
          ))}
        </div>
      </div>
      <Newsletter />
    </>
  );
}
