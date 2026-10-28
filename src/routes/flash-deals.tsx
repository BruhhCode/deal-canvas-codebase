import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { DealCard } from "@/components/DealCard";
import { endingSoon, flashDeals as seedFlashDeals } from "@/data/catalog";
import { productsAsDeals } from "@/data/deal-products";
import { absoluteUrl } from "@/lib/site";

export const Route = createFileRoute("/flash-deals")({
  head: () => ({
    meta: [
      { title: "Flash Deals — Limited Time Fashion Offers | DealsCanvas" },
      { name: "description", content: "Short-window flash sales, midnight deals and 24-hour offers with live countdown timers." },
      { property: "og:title", content: "Flash Deals | DealsCanvas" },
      { property: "og:description", content: "Limited-time offers ending within hours." },
      { property: "og:url", content: absoluteUrl("/flash-deals") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/flash-deals") }],
  }),
  component: FlashPage,
});

function FlashPage() {
  const flashDeals = useMemo(
    () => [...seedFlashDeals, ...productsAsDeals(12, "flash-deals")],
    [],
  );

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Flash Deals" }]} />
      <header className="mb-10 border-b pb-6">
        <p className="editorial-eyebrow">Hours, not days</p>
        <h1 className="mt-3 text-4xl md:text-5xl">Flash Deals</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          24-hour sales, weekend drops and midnight offers. When the timer ends, the price goes back up.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {flashDeals.map((d) => (
          <DealCard key={d.id} deal={d} liveCountdown />
        ))}
      </div>

      <h2 className="mb-6 mt-16 border-b pb-4 text-3xl">Also Ending Soon</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {endingSoon.map((d) => (
          <DealCard key={d.id} deal={d} liveCountdown />
        ))}
      </div>
    </div>
  );
}
