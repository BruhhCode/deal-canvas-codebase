import {
  type Deal,
  brandName,
  discountPct,
  expiryLabel,
} from "@/data/catalog";
import { dealAffiliateUrl, dealImage } from "@/data/deal-products";
import { useCurrency } from "@/lib/currency";
import { useCatalogVersion } from "@/lib/live-catalog";
import { DealBadge } from "./DealBadge";
import { CopyCode } from "./CopyCode";
import { Countdown } from "./Countdown";
import { Tile } from "./Tile";
import { cn } from "@/lib/utils";

export function DealCard({
  deal,
  className,
  liveCountdown,
}: {
  deal: Deal;
  className?: string;
  /** Flash Deals' cards tick live instead of showing a static "Ends in X" label. */
  liveCountdown?: boolean;
}) {
  useCatalogVersion();
  const expired = deal.status === "EXPIRED";
  const { format } = useCurrency();

  return (
    <Tile
      className={className}
      dimmed={expired}
      wishlistId={deal.id}
      imageSrc={dealImage(deal)}
      imageAlt={`${brandName(deal.brand)} ${deal.product} deal`}
      imageTo="/deal/$slug"
      imageParams={{ slug: deal.slug }}
      hideOnImageFail
      badge={{
        label: `${discountPct(deal)}% OFF`,
        tone: deal.flash || deal.expiresInHours < 24 ? "urgency" : "default",
      }}
      brandSlug={deal.brand}
      brandLabel={brandName(deal.brand)}
      title={deal.product}
      titleTo="/deal/$slug"
      titleParams={{ slug: deal.slug }}
      extraBadges={
        deal.badges.length ? (
          <>
            {deal.badges.slice(0, 2).map((b) => (
              <DealBadge key={b} badge={b} />
            ))}
          </>
        ) : null
      }
      priceCurrent={format(deal.price)}
      priceOriginal={format(deal.originalPrice)}
      metaRow={
        <span className="flex w-full items-center justify-between">
          <span>{deal.dealType}</span>
          {liveCountdown && !expired ? (
            <Countdown hours={deal.expiresInHours} className="text-[11px] font-semibold" />
          ) : (
            <span className={cn(deal.expiresInHours < 24 && !expired && "font-medium text-clay")}>
              {expiryLabel(deal.expiresInHours)}
            </span>
          )}
        </span>
      }
      footnote={deal.code ? <CopyCode code={deal.code} /> : null}
      cta={
        expired
          ? { kind: "internal", label: "See similar active deals", to: "/deals", params: {} }
          : { kind: "external", label: "Get Deal", href: dealAffiliateUrl(deal) }
      }
    />
  );
}
