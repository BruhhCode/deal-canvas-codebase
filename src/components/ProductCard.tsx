import { brandName } from "@/data/catalog";
import { storeName } from "@/data/stores";
import { useCurrency } from "@/lib/currency";
import { useCatalogVersion } from "@/lib/live-catalog";
import {
  bestOffer,
  productDiscount,
  savingsVsHighest,
  type Product,
} from "@/data/products";
import { StoreMark } from "./StoreMark";
import { Tile } from "./Tile";

export function ProductCard({ product, className }: { product: Product; className?: string }) {
  useCatalogVersion();
  const offer = bestOffer(product);
  const discount = productDiscount(product);
  const stores = product.offers.length;
  const saving = savingsVsHighest(product);
  const { format } = useCurrency();

  return (
    <Tile
      className={className}
      wishlistId={product.id}
      imageSrc={product.image}
      imageAlt={`${brandName(product.brand)} ${product.name}`}
      imageTo="/product/$slug"
      imageParams={{ slug: product.slug }}
      badge={discount >= 20 ? { label: `${discount}% OFF` } : undefined}
      sponsored={offer.sponsored}
      brandSlug={product.brand}
      brandLabel={brandName(product.brand)}
      rating={product.rating || undefined}
      title={product.name}
      titleTo="/product/$slug"
      titleParams={{ slug: product.slug }}
      priceCurrent={format(offer.price)}
      priceOriginal={discount > 0 ? format(offer.originalPrice) : undefined}
      metaRow={
        <>
          <StoreMark slug={offer.store} />
          <span>
            Lowest at {storeName(offer.store)}
            {stores > 1 ? ` · ${stores} stores` : ""}
          </span>
        </>
      }
      footnote={
        saving > 0 && stores > 1 ? (
          <span className="text-clay">Save {format(saving)} vs highest store price</span>
        ) : null
      }
      cta={{ kind: "internal", label: "Shop Now", to: "/product/$slug", params: { slug: product.slug } }}
    />
  );
}
