import { createFileRoute, Link } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { absoluteUrl } from "@/lib/site";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | DealsCanvas" },
      {
        name: "description",
        content: "What DealsCanvas collects, why, and how affiliate links work — in plain language.",
      },
      { property: "og:title", content: "Privacy Policy | DealsCanvas" },
      { property: "og:url", content: absoluteUrl("/privacy") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/privacy") }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-10">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Privacy Policy" }]} />

      <p className="editorial-eyebrow">Legal</p>
      <h1 className="mt-3 text-4xl leading-tight md:text-5xl">Privacy Policy</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Last updated September 2026. We collect less than you'd probably guess — here's exactly what, and
        why.
      </p>

      <div className="mt-8 space-y-8 text-base leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-lg font-semibold text-foreground">1. What we collect</h2>
          <p className="mt-2">
            Two things, both given to us directly by you: a product review (an optional name, a star
            rating and your comment), and a contact form submission (your name, email address and
            message). DealsCanvas doesn't require an account to use, so we don't hold a database of
            registered users, passwords or purchase history.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">2. Your wishlist stays on your device</h2>
          <p className="mt-2">
            Saving a product to your wishlist stores it in your browser's local storage, on your device —
            it never reaches our servers. We have no way to see what's in your wishlist, and it's gone if
            you clear your browser data or open the site on a different device.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">3. How we use what you send us</h2>
          <p className="mt-2">
            A review you submit is shown publicly on the relevant product page, exactly as written. A
            contact form message is used only to read and reply to your enquiry — it isn't published,
            shared with anyone else, or added to a marketing list.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">4. Affiliate and outbound links</h2>
          <p className="mt-2">
            When you click "Shop Now" or "Get Deal," you're taken to a retailer's own website through an
            affiliate tracking link, via networks such as Rakuten Advertising, Awin, Impact, CJ Affiliate,
            Admitad or Amazon Associates. That click tells the network — and, in turn, the retailer — that
            it came from DealsCanvas, which is how a commission is tracked if you go on to buy something.
            Once you land on a retailer's site, what happens there is governed by their own privacy policy,
            not ours.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">5. Cookies and analytics</h2>
          <p className="mt-2">
            We don't run third-party advertising or tracking cookies of our own on DealsCanvas. Basic
            hosting and traffic logs may be kept briefly for security and reliability, the same way any
            website's infrastructure ordinarily does.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">6. How long we keep things</h2>
          <p className="mt-2">
            A review stays live for as long as the product listing does. Contact messages are kept only as
            long as needed to resolve your enquiry, then deleted periodically.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">7. Your choices</h2>
          <p className="mt-2">
            Want a review or a contact message removed? Get in touch through our{" "}
            <Link to="/contact" className="text-clay hover:underline">
              Contact page
            </Link>{" "}
            and we'll take care of it.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">8. Children</h2>
          <p className="mt-2">
            DealsCanvas isn't directed at children, and we don't knowingly collect information from anyone
            under 13.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">9. Changes to this policy</h2>
          <p className="mt-2">
            If this policy changes in a meaningful way, we'll update the date at the top of this page.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">10. Contact</h2>
          <p className="mt-2">
            Questions about your data? Reach out through our{" "}
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
