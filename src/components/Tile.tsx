import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandMark } from "./BrandMark";
import { ProductImage } from "./ProductImage";
import { WishlistButton } from "./WishlistButton";

/**
 * Shared base for every product/deal tile in the app (ProductCard, DealCard).
 * One image slot, one badge treatment, one CTA shape — see docs/shared-context.md
 * or the styles.css design-tokens comment for the rules this encodes.
 */

export type TileBadge = { label: string; tone?: "default" | "urgency" };

export type TileCta =
  | { kind: "internal"; label: string; to: string; params: Record<string, string> }
  | { kind: "external"; label: string; href: string };

export function Tile({
  wishlistId,
  imageSrc,
  imageAlt,
  imageTo,
  imageParams,
  badge,
  sponsored,
  brandSlug,
  brandLabel,
  rating,
  title,
  titleTo,
  titleParams,
  extraBadges,
  priceCurrent,
  priceOriginal,
  metaRow,
  footnote,
  cta,
  dimmed,
  className,
}: {
  wishlistId: string;
  imageSrc: string;
  imageAlt: string;
  imageTo: string;
  imageParams: Record<string, string>;
  badge?: TileBadge | undefined;
  sponsored?: boolean | undefined;
  brandSlug: string;
  brandLabel: string;
  rating?: number | undefined;
  title: string;
  titleTo: string;
  titleParams: Record<string, string>;
  extraBadges?: ReactNode;
  priceCurrent: string;
  priceOriginal?: string | undefined;
  metaRow?: ReactNode;
  footnote?: ReactNode;
  cta: TileCta;
  dimmed?: boolean | undefined;
  className?: string | undefined;
}) {
  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-card",
        dimmed && "opacity-70",
        className,
      )}
    >
      <Link
        to={imageTo}
        params={imageParams}
        aria-hidden="true"
        tabIndex={-1}
        className="relative block aspect-square overflow-hidden bg-cream"
      >
        <ProductImage
          src={imageSrc}
          alt={imageAlt}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        {badge ? (
          <span
            className={cn(
              "absolute left-3 top-3 rounded-sm px-2 py-1 text-[10px] font-semibold tracking-wider",
              badge.tone === "urgency"
                ? "bg-clay text-clay-foreground"
                : "bg-background/95 text-foreground",
            )}
          >
            {badge.label}
          </span>
        ) : null}
        {sponsored ? (
          <span className="absolute bottom-3 left-3 rounded-sm bg-background/90 px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            Sponsored
          </span>
        ) : null}
      </Link>

      <WishlistButton id={wishlistId} className="absolute right-3 top-3" />

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <div className="flex items-center justify-between gap-2">
          <Link
            to="/brand/$slug"
            params={{ slug: brandSlug }}
            className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] hover:text-clay"
          >
            <BrandMark slug={brandSlug} size="sm" />
            {brandLabel}
          </Link>
          {rating ? (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Star className="h-3 w-3 fill-current" /> {rating.toFixed(1)}
            </span>
          ) : null}
        </div>

        <h3 className="text-sm leading-snug">
          <Link to={titleTo} params={titleParams} className="hover:text-clay">
            {title}
          </Link>
        </h3>

        {extraBadges ? <div className="flex flex-wrap gap-1.5">{extraBadges}</div> : null}

        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-base font-semibold">{priceCurrent}</span>
          {priceOriginal ? (
            <span className="text-xs text-muted-foreground line-through">{priceOriginal}</span>
          ) : null}
        </div>

        {metaRow ? <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">{metaRow}</div> : null}

        {/* Reserved height so cards in the same row stay equal whether or not
            this optional field ("Save $X", a coupon code, ...) is present. */}
        <div className="min-h-[1.125rem] text-[11px]">{footnote}</div>

        {cta.kind === "internal" ? (
          <Link
            to={cta.to}
            params={cta.params}
            className="mt-auto block rounded-sm bg-primary py-2 text-center text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-clay hover:text-clay-foreground"
          >
            {cta.label}
          </Link>
        ) : (
          <a
            href={cta.href}
            target="_blank"
            rel="nofollow sponsored noopener"
            className="mt-auto block rounded-sm bg-primary py-2 text-center text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-clay hover:text-clay-foreground"
          >
            {cta.label}
          </a>
        )}
      </div>
    </article>
  );
}
