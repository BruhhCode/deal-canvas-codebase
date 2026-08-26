/**
 * Grounds the hand-written marketing `deals` (src/data/catalog.ts) in the
 * real product catalog. The seed deals were written with placeholder
 * category-stock images and fabricated merchant URLs — this module derives
 * a real image and a real, working outbound link from an actual product of
 * the same brand, and can also synthesize extra deal cards directly from
 * real products for sections (like Flash Deals) that need more inventory
 * than the hand-written seed list provides.
 */
import { brandName, type Badge, type Deal } from "./catalog";
import { stores } from "./stores";
import { bestOffer, productDiscount, products, type Product } from "./products";

/** Deterministically picks a real product of the same brand as the deal (stable across renders). */
function productForDeal(deal: Deal): Product | undefined {
  const candidates = products.filter((p) => p.brand === deal.brand);
  if (!candidates.length) return undefined;
  let h = 0;
  for (let i = 0; i < deal.id.length; i++) h = (h * 31 + deal.id.charCodeAt(i)) | 0;
  return candidates[Math.abs(h) % candidates.length];
}

export function dealImage(deal: Deal): string {
  return productForDeal(deal)?.image || deal.image;
}

function dealMerchantUrl(deal: Deal): string {
  const product = productForDeal(deal);
  return product ? bestOffer(product).productUrl : deal.merchantUrl;
}

/** Same tracking-param shape as `affiliateUrl` in catalog.ts, but wrapping a real merchant URL. */
export function dealAffiliateUrl(deal: Deal): string {
  const merchantUrl = dealMerchantUrl(deal);
  try {
    const target = new URL(merchantUrl);
    target.searchParams.set("utm_source", "dealcanvas");
    target.searchParams.set("utm_medium", "affiliate");
    target.searchParams.set("utm_campaign", deal.campaign);
    target.searchParams.set("dc_click", deal.id);
    return target.toString();
  } catch {
    return merchantUrl;
  }
}

/** Simple seeded PRNG so a given `seed` always produces the same shuffle (stable across renders/SSR). */
function seededShuffle<T>(list: T[], seed: string): T[] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  const rand = () => {
    h = (Math.imul(h, 1103515245) + 12345) | 0;
    return (h >>> 0) / 4294967296;
  };
  return list
    .map((item) => ({ item, k: rand() }))
    .sort((a, b) => a.k - b.k)
    .map(({ item }) => item);
}

/** Synthesizes Deal-shaped cards straight from real products, for sections that need more inventory than the seed list provides. */
export function productsAsDeals(count: number, seed: string): Deal[] {
  const discounted = products.filter((p) => productDiscount(p) >= 15);
  const pool = discounted.length >= count ? discounted : products;
  const picked = seededShuffle(pool, seed).slice(0, count);

  return picked.map((p, i) => {
    const offer = bestOffer(p);
    const store = stores.find((s) => s.slug === offer.store);
    const discount = productDiscount(p);
    return {
      id: `DL-FP-${p.id}`,
      slug: `${p.slug}-flash-${i}`,
      title: `${brandName(p.brand)} ${p.name} — Flash Deal`,
      product: p.name,
      brand: p.brand,
      category: p.category,
      subcategory: p.subcategory,
      originalPrice: offer.originalPrice,
      price: offer.price,
      dealType: "Flash Sale",
      badges: ["FLASH SALE", "LIMITED TIME"] as Badge[],
      description: `${brandName(p.brand)} ${p.name} is ${discount}% off for a limited time at ${store?.name ?? offer.store}. Grab it before the price resets.`,
      terms: [
        "Offer valid while stocks last on the merchant website.",
        "Price and availability are controlled by the merchant and may change without notice.",
      ],
      expiresInHours: 4 + (i % 20),
      status: "ACTIVE",
      image: p.image,
      tags: p.tags,
      merchantUrl: offer.productUrl,
      network: store?.network ?? "Admitad",
      campaign: store?.campaign ?? "dc-flash",
      subId: `flash_${p.brand}`,
      trackingId: `TRK-FLASH-${p.id}`,
      clicks: p.views,
      flash: true,
    } satisfies Deal;
  });
}
