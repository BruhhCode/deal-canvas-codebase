import { brandName } from "./catalog";
import { stores, storeName } from "./stores";
import { generatedProducts } from "./products.generated";

/* ---------------- taxonomy ---------------- */

export type Gender = "women" | "men" | "unisex";

export interface ShopCategory {
  slug: string;
  name: string;
  department: "women" | "men" | "kids" | "lifestyle";
}

export const shopCategories: ShopCategory[] = [
  { slug: "clothing", name: "Clothing", department: "women" },
  { slug: "shoes", name: "Shoes", department: "women" },
  { slug: "bags", name: "Bags", department: "women" },
  { slug: "accessories", name: "Accessories", department: "women" },
  { slug: "jewelry", name: "Jewelry", department: "women" },
  { slug: "watches", name: "Watches", department: "women" },
  { slug: "beauty", name: "Beauty", department: "women" },
  { slug: "sportswear", name: "Sportswear", department: "women" },

  { slug: "mens-clothing", name: "Clothing", department: "men" },
  { slug: "mens-shoes", name: "Shoes", department: "men" },
  { slug: "sneakers", name: "Sneakers", department: "men" },
  { slug: "mens-watches", name: "Watches", department: "men" },
  { slug: "mens-accessories", name: "Accessories", department: "men" },
  { slug: "mens-bags", name: "Bags", department: "men" },
  { slug: "grooming", name: "Grooming", department: "men" },
  { slug: "mens-sportswear", name: "Sportswear", department: "men" },

  { slug: "kids-clothing", name: "Clothing", department: "kids" },
  { slug: "kids-shoes", name: "Shoes", department: "kids" },
  { slug: "baby-clothing", name: "Baby Clothing", department: "kids" },

  { slug: "home", name: "Home", department: "lifestyle" },
  { slug: "electronics", name: "Electronics", department: "lifestyle" },
  { slug: "fitness", name: "Fitness", department: "lifestyle" },
  { slug: "travel", name: "Travel", department: "lifestyle" },
  { slug: "beauty-lifestyle", name: "Beauty", department: "lifestyle" },
  { slug: "lifestyle-accessories", name: "Lifestyle Accessories", department: "lifestyle" },
];

export const departments = [
  { slug: "women", name: "Women" },
  { slug: "men", name: "Men" },
  { slug: "kids", name: "Kids" },
  { slug: "lifestyle", name: "Lifestyle" },
] as const;

export const categoryName = (slug: string) =>
  shopCategories.find((c) => c.slug === slug)?.name ?? slug;

export const categoriesByDepartment = (dept: string) =>
  shopCategories.filter((c) => c.department === dept);

/* ---------------- model ---------------- */

export interface Offer {
  store: string; // store slug
  price: number;
  originalPrice: number;
  currency: "USD";
  availability: "IN STOCK" | "LOW STOCK" | "OUT OF STOCK";
  productUrl: string;
  couponCode?: string | undefined;
  shipping: string;
  /** hours since the feed for this offer was refreshed */
  updatedHoursAgo: number;
  sponsored?: boolean | undefined;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string; // brand slug from catalog
  category: string; // shop category slug
  subcategory: string;
  gender: Gender;
  description: string;
  image: string;
  colors: string[];
  sizes: string[];
  tags: string[];
  rating: number;
  reviews: number;
  views: number;
  newIn?: boolean | undefined;
  offers: Offer[];
}

// Products are entirely generated from products-import.csv — see scripts/import-products.ts.
export const products: Product[] = generatedProducts;

/* ---------------- derived helpers ---------------- */

export const inStockOffers = (p: Product) => p.offers.filter((o) => o.availability !== "OUT OF STOCK");

export const bestOffer = (p: Product): Offer => {
  const pool = inStockOffers(p).length ? inStockOffers(p) : p.offers;
  return pool.reduce((a, b) => (b.price < a.price ? b : a));
};

export const offersSorted = (p: Product) => p.offers.slice().sort((a, b) => a.price - b.price);

export const productDiscount = (p: Product) => {
  const o = bestOffer(p);
  return Math.round(((o.originalPrice - o.price) / o.originalPrice) * 100);
};

export const savingsVsHighest = (p: Product) => {
  const sorted = offersSorted(p);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  if (!first || !last) return 0;
  return last.price - first.price;
};

export const lastUpdatedLabel = (p: Product) => {
  const h = Math.min(...p.offers.map((o) => o.updatedHoursAgo));
  return h <= 1 ? "Updated 1 hour ago" : `Updated ${h} hours ago`;
};

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);
export const productsByBrand = (brand: string) => products.filter((p) => p.brand === brand);
export const productsByStore = (store: string) =>
  products.filter((p) => p.offers.some((o) => o.store === store));
export const productsByCategory = (cat: string) => products.filter((p) => p.category === cat);
export const productsByDepartment = (dept: string) => {
  const set = new Set(categoriesByDepartment(dept).map((c) => c.slug));
  return products.filter((p) => set.has(p.category));
};

export const trendingProducts = products.slice().sort((a, b) => b.views - a.views);
export const newArrivals = products.filter((p) => p.newIn);
export const biggestDiscounts = products
  .slice()
  .sort((a, b) => productDiscount(b) - productDiscount(a));

export const relatedProducts = (p: Product, n = 4) =>
  products.filter((x) => x.id !== p.id && (x.category === p.category || x.brand === p.brand)).slice(0, n);

/** Same silhouette across stores is already modelled as offers; this finds close alternatives. */
export const similarInCategory = (p: Product, n = 4) =>
  products.filter((x) => x.id !== p.id && x.subcategory === p.subcategory).slice(0, n);

export const popularSearches = [
  { name: "Nike", slug: "nike" },
  { name: "H&M", slug: "hm" },
  { name: "Adidas", slug: "adidas" },
  { name: "Zara", slug: "zara" },
  { name: "Mango", slug: "mango" },
  { name: "Uniqlo", slug: "uniqlo" },
  { name: "Columbia", slug: "columbia" },
  { name: "Gucci", slug: "gucci" },
  { name: "Asos", slug: "asos" },
];

export const searchPlaceholders = [
  "Search sneakers...",
  "Search Nike...",
  "Search handbags...",
  "Search skincare...",
];

/* ---------------- search, filter, sort ---------------- */

export interface ProductFilters {
  q?: string | undefined;
  gender?: string | undefined;
  department?: string | undefined;
  category?: string | undefined;
  brand?: string | undefined;
  store?: string | undefined;
  maxPrice?: number | undefined;
  minDiscount?: number | undefined;
  color?: string | undefined;
  size?: string | undefined;
  inStock?: boolean | undefined;
  sale?: boolean | undefined;
  newIn?: boolean | undefined;
  coupon?: boolean | undefined;
}

export type SortKey =
  | "recommended"
  | "lowest-price"
  | "highest-discount"
  | "newest"
  | "popular"
  | "price-asc"
  | "price-desc";

export const sortOptions: { key: SortKey; label: string }[] = [
  { key: "recommended", label: "Recommended" },
  { key: "lowest-price", label: "Lowest Price" },
  { key: "highest-discount", label: "Highest Discount" },
  { key: "newest", label: "Newest" },
  { key: "popular", label: "Popular" },
  { key: "price-asc", label: "Price: Low → High" },
  { key: "price-desc", label: "Price: High → Low" },
];

export function searchProducts(q: string) {
  const term = q.trim().toLowerCase();
  if (!term) return products;
  const words = term.split(/\s+/);
  return products.filter((p) => {
    const hay = [
      p.name,
      brandName(p.brand),
      p.subcategory,
      categoryName(p.category),
      p.gender,
      ...p.tags,
      ...p.colors,
      ...p.offers.map((o) => storeName(o.store)),
    ]
      .join(" ")
      .toLowerCase();
    return words.every((w) => hay.includes(w));
  });
}

export function filterProducts(list: Product[], f: ProductFilters) {
  const deptCats = f.department ? new Set(categoriesByDepartment(f.department).map((c) => c.slug)) : null;
  return list.filter((p) => {
    const o = bestOffer(p);
    if (f.gender && p.gender !== f.gender && p.gender !== "unisex") return false;
    if (deptCats && !deptCats.has(p.category)) return false;
    if (f.category && p.category !== f.category) return false;
    if (f.brand && p.brand !== f.brand) return false;
    if (f.store && !p.offers.some((x) => x.store === f.store)) return false;
    if (f.maxPrice && o.price > f.maxPrice) return false;
    if (f.minDiscount && productDiscount(p) < f.minDiscount) return false;
    if (f.color && !p.colors.some((c) => c.toLowerCase() === f.color!.toLowerCase())) return false;
    if (f.size && !p.sizes.includes(f.size)) return false;
    if (f.inStock && !inStockOffers(p).length) return false;
    if (f.sale && productDiscount(p) < 20) return false;
    if (f.newIn && !p.newIn) return false;
    if (f.coupon && !p.offers.some((x) => x.couponCode)) return false;
    return true;
  });
}

export function sortProducts(list: Product[], key: SortKey) {
  const arr = list.slice();
  switch (key) {
    case "lowest-price":
    case "price-asc":
      return arr.sort((a, b) => bestOffer(a).price - bestOffer(b).price);
    case "price-desc":
      return arr.sort((a, b) => bestOffer(b).price - bestOffer(a).price);
    case "highest-discount":
      return arr.sort((a, b) => productDiscount(b) - productDiscount(a));
    case "newest":
      return arr.sort((a, b) => Number(!!b.newIn) - Number(!!a.newIn));
    case "popular":
      return arr.sort((a, b) => b.views - a.views);
    default:
      return arr.sort(
        (a, b) => productDiscount(b) * 100 + b.rating * 10 - (productDiscount(a) * 100 + a.rating * 10),
      );
  }
}

export const allColors = Array.from(new Set(products.flatMap((p) => p.colors))).filter((c) => c !== "-").sort();
export const allSizes = Array.from(new Set(products.flatMap((p) => p.sizes))).sort();

/* ---------------- affiliate outbound ---------------- */

export function offerAffiliateUrl(product: Product, offer: Offer) {
  const store = stores.find((s) => s.slug === offer.store);
  try {
    const target = new URL(offer.productUrl);
    target.searchParams.set("utm_source", "dealcanvas");
    target.searchParams.set("utm_medium", "affiliate");
    target.searchParams.set("utm_campaign", store?.campaign ?? "dc-direct");
    target.searchParams.set("dc_click", `${product.id}-${offer.store}`);
    return target.toString();
  } catch {
    return offer.productUrl;
  }
}

/* ---------------- sales calendar ---------------- */

export interface SaleEvent {
  id: string;
  store: string;
  title: string;
  discount: string;
  window: "today" | "tomorrow" | "this-week" | "next-week" | "this-month";
  detail: string;
  code?: string;
}

export const saleEvents: SaleEvent[] = [
  { id: "SE-1", store: "nike-store", title: "Nike Mid-Season Sale", discount: "Up to 30% off", window: "today", detail: "Ends tonight — running and lifestyle silhouettes included.", code: "NIKE30" },
  { id: "SE-2", store: "nordstrom", title: "Nordstrom Fashion Hours", discount: "Flat 50-70% off", window: "today", detail: "Marketplace-wide event with extra member offers." },
  { id: "SE-3", store: "adidas-store", title: "Adidas Originals Drop", discount: "Up to 40% off", window: "tomorrow", detail: "Samba, Gazelle and Campus restock with sale pricing." },
  { id: "SE-4", store: "ulta", title: "Ulta Beauty Bonanza", discount: "Up to 50% off", window: "tomorrow", detail: "Skincare bundles and prestige makeup." , code: "PINK50" },
  { id: "SE-5", store: "zara-store", title: "Zara End of Season Sale", discount: "Up to 60% off", window: "this-week", detail: "Second markdown wave lands midweek." },
  { id: "SE-6", store: "revolve", title: "Revolve Big Bold Sale", discount: "Extra 25% off", window: "this-week", detail: "Stacks on already reduced styles.", code: "REVOLVE25" },
  { id: "SE-7", store: "footlocker", title: "Foot Locker Sneaker Week", discount: "Up to 35% off", window: "next-week", detail: "Nike, Adidas and Puma running styles." },
  { id: "SE-8", store: "neiman-marcus", title: "Neiman Marcus Luxury Edit", discount: "Up to 45% off", window: "next-week", detail: "Watches, bags and premium beauty." },
  { id: "SE-9", store: "amazon", title: "Amazon Fashion Days", discount: "Up to 70% off", window: "this-month", detail: "Category-wide event across apparel and footwear." },
  { id: "SE-10", store: "decathlon", title: "Decathlon Fitness Fest", discount: "Up to 30% off", window: "this-month", detail: "Home gym, running and travel gear." },
  { id: "SE-11", store: "hm-store", title: "H&M Member Days", discount: "Extra 20% off", window: "this-month", detail: "Members-only pricing across basics and home." },
];

export const saleWindows = [
  { key: "today", label: "Today" },
  { key: "tomorrow", label: "Tomorrow" },
  { key: "this-week", label: "This Week" },
  { key: "next-week", label: "Next Week" },
  { key: "this-month", label: "This Month" },
] as const;
