import { createFileRoute, Link } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { absoluteUrl } from "@/lib/site";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions | DealsCanvas" },
      {
        name: "description",
        content: "The terms for using DealsCanvas — a price-comparison and deals site, not a retailer.",
      },
      { property: "og:title", content: "Terms & Conditions | DealsCanvas" },
      { property: "og:url", content: absoluteUrl("/terms") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/terms") }],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-10">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Terms & Conditions" }]} />

      <p className="editorial-eyebrow">Legal</p>
      <h1 className="mt-3 text-4xl leading-tight md:text-5xl">Terms & Conditions</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Last updated September 2026. The short version: use the site fairly, and understand that
        DealsCanvas is a price-comparison and referral service, not the seller of anything listed here.
      </p>

      <div className="mt-8 space-y-8 text-base leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-lg font-semibold text-foreground">1. What DealsCanvas is</h2>
          <p className="mt-2">
            DealsCanvas is an independent price-comparison and deals platform. We don't sell, ship, stock
            or process payment for anything listed on the site. When you click "Shop Now" or "Get Deal,"
            you leave DealsCanvas and complete your purchase directly on the retailer's own website, under
            that retailer's own terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">2. Prices, availability and accuracy</h2>
          <p className="mt-2">
            We pull pricing, stock and discount information from the stores we track and refresh it
            regularly, but retailers change prices and run out of stock faster than any comparison site can
            promise to keep up with. The price shown here is our best current record, not a guarantee of
            what you'll be charged — always confirm the final price and availability on the retailer's site
            before you complete a purchase. If something looks off, please{" "}
            <Link to="/contact" className="text-clay hover:underline">
              let us know
            </Link>{" "}
            so we can fix it.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">3. Affiliate links and how we're funded</h2>
          <p className="mt-2">
            Most outbound links on DealsCanvas are affiliate links. If you make a purchase after clicking
            one, we may earn a commission from the retailer, at no extra cost to you. This doesn't
            influence which price we show as the best one — that's always determined by the lowest tracked
            price, never by which store pays us the most.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">4. Using the site</h2>
          <p className="mt-2">
            You're welcome to browse, search and use DealsCanvas freely. Please don't scrape or republish
            our catalog data at scale, try to disrupt the site, or use it for anything unlawful. We may
            restrict access for anyone abusing the site — for example, automated scraping, or submitting
            fraudulent reviews or contact messages.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">5. Reviews and messages you submit</h2>
          <p className="mt-2">
            Product reviews are posted directly by shoppers, with an optional name, and we don't verify a
            purchase before a review goes live. Please don't post anything defamatory, abusive, or that
            infringes someone else's rights — we reserve the right to remove a review or message that does.
            Contact form submissions are used only to respond to you; they're never published on the site.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">6. No accounts, no stored payment details</h2>
          <p className="mt-2">
            DealsCanvas doesn't require an account. The wishlist feature is stored locally in your own
            browser, not on our servers — clearing your browser data or switching devices will clear it. We
            never collect or store payment card details; all payment happens on the retailer's own site.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">7. Intellectual property</h2>
          <p className="mt-2">
            The DealsCanvas name, logo and site design belong to us. Product names, images and brand logos
            belong to their respective retailers and brands, and are used here to identify and compare
            their offers — not to claim any partnership or endorsement.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">8. Limitation of liability</h2>
          <p className="mt-2">
            We do our best to keep listings accurate, but DealsCanvas is provided as is. We're not liable
            for pricing errors, stock changes, delivery issues, product quality, or anything else that
            happens on a retailer's own site once you've left DealsCanvas — those are between you and the
            retailer.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">9. Changes to these terms</h2>
          <p className="mt-2">
            We may update these terms as the site evolves. We'll update the date at the top when we do;
            continuing to use the site after a change means you accept the updated terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">10. Contact</h2>
          <p className="mt-2">
            Questions about these terms? Reach out through our{" "}
            <Link to="/contact" className="text-clay hover:underline">
              Contact page
            </Link>
            .
          </p>
        </section>
      </div>
    </article>
  );
}
