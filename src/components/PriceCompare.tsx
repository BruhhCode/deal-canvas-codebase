import { inr } from "@/data/catalog";
import { storeName } from "@/data/stores";
import {
  bestOffer,
  offerAffiliateUrl,
  offersSorted,
  type Product,
} from "@/data/products";
import { cn } from "@/lib/utils";
import { StoreMark } from "./StoreMark";

export function PriceCompare({ product }: { product: Product }) {
  const best = bestOffer(product);
  const offers = offersSorted(product);

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b p-5">
        <div>
          <p className="editorial-eyebrow">Best price</p>
          <p className="mt-1 text-3xl font-semibold">{inr(best.price)}</p>
          <p className="text-sm text-muted-foreground">at {storeName(best.store)}</p>
        </div>
        <a
          href={offerAffiliateUrl(product, best)}
          target="_blank"
          rel="nofollow sponsored noopener"
          className="rounded-sm bg-primary px-7 py-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-clay hover:text-clay-foreground"
        >
          Shop Now
        </a>
      </div>

      <ul className="divide-y">
        {offers.map((o) => {
          const isBest = o.store === best.store;
          const out = o.availability === "OUT OF STOCK";
          const pct = Math.round(((o.originalPrice - o.price) / o.originalPrice) * 100);
          return (
            <li
              key={o.store}
              className={cn("flex flex-wrap items-center gap-3 p-4", out && "opacity-55")}
            >
              <StoreMark slug={o.store} size="md" />
              <div className="min-w-40 flex-1">
                <p className="text-sm font-semibold">{storeName(o.store)}</p>
                <p className="text-xs text-muted-foreground">
                  {o.availability === "IN STOCK" ? "In stock" : o.availability === "LOW STOCK" ? "Low stock" : "Out of stock"} ·{" "}
                  {o.shipping} · updated {o.updatedHoursAgo}h ago
                  {o.couponCode ? ` · code ${o.couponCode}` : ""}
                </p>
              </div>
              <div className="text-right">
                <p className="text-base font-semibold">{inr(o.price)}</p>
                <p className="text-xs text-muted-foreground">{pct}% off</p>
              </div>
              {isBest ? (
                <span className="rounded-sm bg-ink px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-background">
                  Best price
                </span>
              ) : null}
              <a
                href={offerAffiliateUrl(product, o)}
                target="_blank"
                rel="nofollow sponsored noopener"
                className={cn(
                  "rounded-sm border border-foreground px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition-colors hover:bg-foreground hover:text-background",
                  out && "pointer-events-none",
                )}
              >
                {out ? "Unavailable" : "Visit store"}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
