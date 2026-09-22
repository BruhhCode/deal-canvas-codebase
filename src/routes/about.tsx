import { createFileRoute, Link } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us | DealsCanvas" },
      {
        name: "description",
        content: "Why DealsCanvas exists, how it makes money, and what we're honest about not being perfect at.",
      },
      { property: "og:title", content: "About DealsCanvas" },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-10">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "About Us" }]} />

      <p className="editorial-eyebrow">About</p>
      <h1 className="mt-3 text-4xl leading-tight md:text-5xl">About DealsCanvas</h1>

      <div className="mt-8 space-y-5 text-base leading-relaxed text-muted-foreground">
        <p>
          DealsCanvas started from an annoying, familiar problem: the same jacket, the same sneakers, the
          same skincare set, priced differently depending on which store you happened to open first. We
          got tired of keeping six tabs open just to find out we'd already paid too much, so we built the
          tool we wanted for ourselves.
        </p>
        <p>
          Today that means tracking live prices, stock and coupon codes across a large and growing list of
          retailers — Nordstrom, Nike, Zara, Revolve, Amazon Fashion and dozens more — and putting them
          side by side so you can see the full picture before you buy, instead of after.
        </p>
        <p>
          We keep the site free to use by earning a small commission when you buy through one of our
          links, through the store's own affiliate program. It costs you nothing extra, and it doesn't
          change what you're shown first: a store that pays us a higher commission doesn't get bumped up
          the list ahead of a genuinely cheaper one. If it isn't the best price we've found, it doesn't
          rank as one.
        </p>
        <p>
          We're a small, independent site — not a retailer ourselves. Every purchase happens on the
          store's own site, under their own shipping, returns and customer service. Prices and stock move
          quickly, and while we refresh listings regularly, we'd rather say that plainly than pretend our
          numbers are perfect down to the minute.
        </p>
        <p>
          Found a price that's wrong, a link that's broken, or a store you think we should be tracking?{" "}
          <Link to="/contact" className="text-clay hover:underline">
            Tell us
          </Link>{" "}
          — a fair amount of what's improved on this site started with someone flagging exactly that.
        </p>
      </div>
    </article>
  );
}
