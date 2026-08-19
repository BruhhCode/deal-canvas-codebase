import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import {
  type Deal,
  affiliateUrl,
  brandName,
  discountPct,
  expiryLabel,
} from "@/data/catalog";
import { useCurrency } from "@/lib/currency";
import { BrandMark } from "./BrandMark";
import { DealBadge } from "./DealBadge";
import { CopyCode } from "./CopyCode";
import { WishlistButton } from "./WishlistButton";

export function DealCard({ deal, className }: { deal: Deal; className?: string }) {
  const expired = deal.status === "EXPIRED";
  const { format } = useCurrency();

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-lg border bg-card shadow-card transition-shadow hover:shadow-lg",
        expired && "opacity-70",
        className,
      )}
    >
      <Link
        to="/deal/$slug"
        params={{ slug: deal.slug }}
        className="relative block aspect-[4/3] overflow-hidden bg-cream"
      >
        <img
          src={deal.image}
          alt={`${brandName(deal.brand)} ${deal.product} deal`}
          loading="lazy"
          width={900}
          height={900}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <span className="absolute left-3 top-3 rounded-sm bg-ink px-2 py-1 text-[11px] font-semibold tracking-wider text-background">
          {discountPct(deal)}% OFF
        </span>
      </Link>

      <WishlistButton id={deal.id} className="absolute right-3 top-3" />

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center gap-2">
          <BrandMark slug={deal.brand} size="sm" />
          <Link
            to="/brand/$slug"
            params={{ slug: deal.brand }}
            className="text-xs font-semibold uppercase tracking-[0.14em] hover:text-clay"
          >
            {brandName(deal.brand)}
          </Link>
        </div>

        <h3 className="text-base leading-snug">
          <Link to="/deal/$slug" params={{ slug: deal.slug }} className="hover:text-clay">
            {deal.product}
          </Link>
        </h3>

        <div className="flex flex-wrap gap-1.5">
          {deal.badges.slice(0, 2).map((b) => (
            <DealBadge key={b} badge={b} />
          ))}
        </div>

        <div className="mt-auto space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-semibold">{format(deal.price)}</span>
            <span className="text-sm text-muted-foreground line-through">{format(deal.originalPrice)}</span>
          </div>

          {deal.code ? <CopyCode code={deal.code} /> : null}

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{deal.dealType}</span>
            <span className={cn(deal.expiresInHours < 24 && !expired && "text-clay font-medium")}>
              {expiryLabel(deal.expiresInHours)}
            </span>
          </div>

          {expired ? (
            <Link
              to="/deals"
              className="block rounded-sm border border-input py-2.5 text-center text-sm font-semibold"
            >
              See similar active deals
            </Link>
          ) : (
            <a
              href={affiliateUrl(deal)}
              target="_blank"
              rel="nofollow sponsored noopener"
              className="block rounded-sm bg-primary py-2.5 text-center text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-clay hover:text-clay-foreground"
            >
              Get Deal
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
