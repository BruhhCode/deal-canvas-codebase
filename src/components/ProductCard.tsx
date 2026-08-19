import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { brandName } from "@/data/catalog";
import { storeName } from "@/data/stores";
import { useCurrency } from "@/lib/currency";
import {
  bestOffer,
  productDiscount,
  savingsVsHighest,
  type Product,
} from "@/data/products";
import { WishlistButton } from "./WishlistButton";
import { StoreMark } from "./StoreMark";

export function ProductCard({ product, className }: { product: Product; className?: string }) {
  const offer = bestOffer(product);
  const discount = productDiscount(product);
  const stores = product.offers.length;
  const saving = savingsVsHighest(product);
  const { format } = useCurrency();

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-lg bg-card transition-shadow hover:shadow-card",
        className,
      )}
    >
      <Link
        to="/product/$slug"
        params={{ slug: product.slug }}
        className="relative block aspect-square overflow-hidden rounded-lg bg-cream"
      >
        <img
          src={product.image}
          alt={`${brandName(product.brand)} ${product.name}`}
          loading="lazy"
          width={900}
          height={900}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        {discount >= 20 ? (
          <span className="absolute left-3 top-3 rounded-sm bg-background/95 px-2 py-1 text-[10px] font-semibold tracking-wider">
            {discount}% OFF
          </span>
        ) : null}
        {offer.sponsored ? (
          <span className="absolute bottom-3 left-3 rounded-sm bg-background/90 px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            Sponsored
          </span>
        ) : null}
      </Link>

      <WishlistButton id={product.id} className="absolute right-3 top-3" />

      <div className="flex flex-1 flex-col gap-1.5 pt-3">
        <div className="flex items-center justify-between gap-2">
          <Link
            to="/brand/$slug"
            params={{ slug: product.brand }}
            className="text-[11px] font-semibold uppercase tracking-[0.14em] hover:text-clay"
          >
            {brandName(product.brand)}
          </Link>
          {product.rating ? (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Star className="h-3 w-3 fill-current" /> {product.rating.toFixed(1)}
            </span>
          ) : null}
        </div>

        <h3 className="text-sm leading-snug">
          <Link to="/product/$slug" params={{ slug: product.slug }} className="hover:text-clay">
            {product.name}
          </Link>
        </h3>

        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-base font-semibold">{format(offer.price)}</span>
          {discount > 0 ? (
            <span className="text-xs text-muted-foreground line-through">{format(offer.originalPrice)}</span>
          ) : null}
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <StoreMark slug={offer.store} />
          <span>
            Lowest at {storeName(offer.store)}
            {stores > 1 ? ` · ${stores} stores` : ""}
          </span>
        </div>

        {saving > 0 && stores > 1 ? (
          <p className="text-[11px] text-clay">Save {format(saving)} vs highest store price</p>
        ) : null}

        <Link
          to="/product/$slug"
          params={{ slug: product.slug }}
          className="mt-3 block rounded-sm border border-foreground py-2 text-center text-xs font-semibold uppercase tracking-[0.14em] transition-colors hover:bg-foreground hover:text-background"
        >
          Shop Now
        </Link>
      </div>
    </article>
  );
}
