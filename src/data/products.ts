import pSneaker from "@/assets/p-sneaker.jpg";
import pBag from "@/assets/p-bag.jpg";
import pWatch from "@/assets/p-watch.jpg";
import pDenim from "@/assets/p-denim.jpg";
import pBeauty from "@/assets/p-beauty.jpg";
import pApparel from "@/assets/p-apparel.jpg";
import { brandName } from "./catalog";
import { stores, storeName, type Store } from "./stores";

/* ---------------- taxonomy ---------------- */

export type Gender = "women" | "men" | "unisex";

export interface ShopCategory {
  slug: string;
  name: string;
  department: "women" | "men" | "lifestyle";
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
  currency: "INR";
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

/* ---------------- seeds ---------------- */

type Img = "sneaker" | "bag" | "watch" | "denim" | "beauty" | "apparel";
const images: Record<Img, string> = {
  sneaker: pSneaker,
  bag: pBag,
  watch: pWatch,
  denim: pDenim,
  beauty: pBeauty,
  apparel: pApparel,
};

interface Seed {
  n: string;
  b: string;
  c: string;
  sub: string;
  g: Gender;
  mrp: number;
  img: Img;
  colors: string[];
  sizes: string[];
  tags: string[];
  stores: string[];
  views: number;
  rating: number;
  newIn?: boolean;
}

const APPAREL = ["XS", "S", "M", "L", "XL"];
const SHOE = ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"];
const ONE = ["One size"];

const seeds: Seed[] = [
  { n: "Air Max 90 Sneakers", b: "nike", c: "sneakers", sub: "Lifestyle Sneakers", g: "unisex", mrp: 12995, img: "sneaker", colors: ["White", "Black", "Grey"], sizes: SHOE, tags: ["sneakers", "nike", "running"], stores: ["nike-store", "myntra", "ajio", "footlocker"], views: 12400, rating: 4.6 },
  { n: "Air Force 1 '07", b: "nike", c: "sneakers", sub: "Lifestyle Sneakers", g: "unisex", mrp: 9695, img: "sneaker", colors: ["White", "Cream"], sizes: SHOE, tags: ["sneakers", "nike", "classic"], stores: ["nike-store", "myntra", "footlocker"], views: 10800, rating: 4.7 },
  { n: "Pegasus 41 Running Shoes", b: "nike", c: "mens-sportswear", sub: "Running Shoes", g: "men", mrp: 11895, img: "sneaker", colors: ["Black", "Blue"], sizes: SHOE, tags: ["running", "nike"], stores: ["nike-store", "ajio", "amazon"], views: 6100, rating: 4.5, newIn: true },
  { n: "Dri-FIT Training Tee", b: "nike", c: "mens-sportswear", sub: "Activewear", g: "men", mrp: 2299, img: "apparel", colors: ["Black", "Olive"], sizes: APPAREL, tags: ["activewear", "gym"], stores: ["nike-store", "myntra", "amazon"], views: 3200, rating: 4.3 },
  { n: "Samba OG Sneakers", b: "adidas", c: "sneakers", sub: "Lifestyle Sneakers", g: "unisex", mrp: 10999, img: "sneaker", colors: ["White", "Black"], sizes: SHOE, tags: ["sneakers", "adidas", "terrace"], stores: ["adidas-store", "myntra", "ajio", "footlocker"], views: 15200, rating: 4.8 },
  { n: "Ultraboost Light", b: "adidas", c: "mens-sportswear", sub: "Running Shoes", g: "unisex", mrp: 18999, img: "sneaker", colors: ["Core Black", "Cloud White"], sizes: SHOE, tags: ["running", "adidas"], stores: ["adidas-store", "amazon", "footlocker"], views: 7400, rating: 4.6 },
  { n: "Firebird Track Jacket", b: "adidas", c: "clothing", sub: "Outerwear", g: "unisex", mrp: 5999, img: "apparel", colors: ["Black", "Navy"], sizes: APPAREL, tags: ["streetwear", "jacket"], stores: ["adidas-store", "myntra", "ajio"], views: 4300, rating: 4.4 },
  { n: "Gazelle Indoor Trainers", b: "adidas", c: "shoes", sub: "Lifestyle Sneakers", g: "women", mrp: 11999, img: "sneaker", colors: ["Blue", "Pink"], sizes: SHOE, tags: ["sneakers", "adidas"], stores: ["adidas-store", "ajio", "myntra"], views: 5600, rating: 4.5, newIn: true },
  { n: "RS-X Reinvention Sneakers", b: "puma", c: "sneakers", sub: "Chunky Sneakers", g: "unisex", mrp: 8999, img: "sneaker", colors: ["White", "Multi"], sizes: SHOE, tags: ["sneakers", "puma"], stores: ["myntra", "ajio", "amazon"], views: 3900, rating: 4.2 },
  { n: "Suede Classic XXI", b: "puma", c: "sneakers", sub: "Lifestyle Sneakers", g: "unisex", mrp: 6499, img: "sneaker", colors: ["Red", "Navy"], sizes: SHOE, tags: ["sneakers", "puma", "under-5000"], stores: ["myntra", "amazon", "footlocker"], views: 4700, rating: 4.4 },
  { n: "501 Original Fit Jeans", b: "levis", c: "mens-clothing", sub: "Denim", g: "men", mrp: 4999, img: "denim", colors: ["Indigo", "Stonewash"], sizes: ["28", "30", "32", "34", "36"], tags: ["denim", "jeans"], stores: ["myntra", "ajio", "amazon"], views: 9100, rating: 4.6 },
  { n: "Ribcage Straight Ankle Jeans", b: "levis", c: "clothing", sub: "Denim", g: "women", mrp: 5999, img: "denim", colors: ["Mid Blue", "Black"], sizes: ["24", "26", "28", "30", "32"], tags: ["denim", "jeans", "women"], stores: ["myntra", "ajio"], views: 5200, rating: 4.5 },
  { n: "Trucker Denim Jacket", b: "levis", c: "mens-clothing", sub: "Outerwear", g: "men", mrp: 6499, img: "denim", colors: ["Light Wash", "Black"], sizes: APPAREL, tags: ["denim", "jacket"], stores: ["myntra", "amazon", "ajio"], views: 3800, rating: 4.4 },
  { n: "Oversized Linen Blend Shirt", b: "zara", c: "clothing", sub: "Shirts", g: "women", mrp: 3990, img: "apparel", colors: ["Ecru", "Sand"], sizes: APPAREL, tags: ["linen", "summer"], stores: ["zara-store", "myntra"], views: 6800, rating: 4.3, newIn: true },
  { n: "Satin Slip Midi Dress", b: "zara", c: "clothing", sub: "Dresses", g: "women", mrp: 4590, img: "apparel", colors: ["Champagne", "Black"], sizes: APPAREL, tags: ["dresses", "party"], stores: ["zara-store", "ajio"], views: 8300, rating: 4.4 },
  { n: "Tailored Wool Blend Blazer", b: "zara", c: "clothing", sub: "Blazers", g: "women", mrp: 7990, img: "apparel", colors: ["Charcoal", "Camel"], sizes: APPAREL, tags: ["workwear", "blazer"], stores: ["zara-store", "tatacliq"], views: 3100, rating: 4.2 },
  { n: "Cotton Everyday Tee 3-Pack", b: "hm", c: "mens-clothing", sub: "T-Shirts", g: "men", mrp: 1999, img: "apparel", colors: ["White", "Black", "Grey"], sizes: APPAREL, tags: ["basics", "bundle"], stores: ["hm-store", "myntra", "amazon"], views: 5400, rating: 4.1 },
  { n: "Relaxed Linen Trousers", b: "hm", c: "clothing", sub: "Trousers", g: "women", mrp: 2499, img: "apparel", colors: ["Beige", "White"], sizes: APPAREL, tags: ["linen", "summer"], stores: ["hm-store", "myntra"], views: 2600, rating: 4.0 },
  { n: "Washed Linen Bedding Set", b: "hm", c: "home", sub: "Bedding", g: "unisex", mrp: 4999, img: "apparel", colors: ["Sand", "Sage"], sizes: ["Double", "King"], tags: ["home", "bedding"], stores: ["hm-store", "amazon"], views: 1900, rating: 4.3 },
  { n: "Structured Leather Tote", b: "charles-keith", c: "bags", sub: "Totes", g: "women", mrp: 7999, img: "bag", colors: ["Tan", "Black"], sizes: ONE, tags: ["bags", "work"], stores: ["myntra", "ajio", "tatacliq"], views: 7200, rating: 4.5 },
  { n: "Quilted Chain Shoulder Bag", b: "charles-keith", c: "bags", sub: "Shoulder Bags", g: "women", mrp: 6499, img: "bag", colors: ["Black", "Cream"], sizes: ONE, tags: ["bags", "evening"], stores: ["myntra", "tatacliq"], views: 5900, rating: 4.4, newIn: true },
  { n: "Mini Crossbody Bag", b: "charles-keith", c: "bags", sub: "Crossbody", g: "women", mrp: 4499, img: "bag", colors: ["Chocolate", "Ivory"], sizes: ONE, tags: ["bags", "everyday"], stores: ["ajio", "myntra", "amazon"], views: 4100, rating: 4.3 },
  { n: "AX Chronograph Steel Watch", b: "armani", c: "mens-watches", sub: "Chronograph", g: "men", mrp: 21999, img: "watch", colors: ["Steel", "Rose Gold"], sizes: ONE, tags: ["watches", "luxury"], stores: ["tatacliq", "amazon", "myntra"], views: 6300, rating: 4.6 },
  { n: "Slim Mesh Dress Watch", b: "armani", c: "watches", sub: "Dress Watch", g: "women", mrp: 17999, img: "watch", colors: ["Rose Gold", "Silver"], sizes: ONE, tags: ["watches", "gifting"], stores: ["tatacliq", "myntra"], views: 3300, rating: 4.4 },
  { n: "Classic Check Cashmere Scarf", b: "burberry", c: "accessories", sub: "Scarves", g: "unisex", mrp: 42000, img: "apparel", colors: ["Camel", "Charcoal"], sizes: ONE, tags: ["luxury", "scarf"], stores: ["tatacliq"], views: 2100, rating: 4.9 },
  { n: "Cotton Gabardine Trench Coat", b: "burberry", c: "clothing", sub: "Outerwear", g: "women", mrp: 189000, img: "apparel", colors: ["Honey"], sizes: APPAREL, tags: ["luxury", "outerwear"], stores: ["tatacliq"], views: 1500, rating: 4.9 },
  { n: "CK One Eau de Toilette 200ml", b: "calvin-klein", c: "beauty", sub: "Fragrance", g: "unisex", mrp: 6499, img: "beauty", colors: ["-"], sizes: ["100ml", "200ml"], tags: ["fragrance", "gifting"], stores: ["nykaa", "sephora", "amazon"], views: 4600, rating: 4.5 },
  { n: "Modern Cotton Boxer Brief 3-Pack", b: "calvin-klein", c: "mens-clothing", sub: "Innerwear", g: "men", mrp: 3499, img: "apparel", colors: ["Black", "Grey"], sizes: APPAREL, tags: ["basics", "innerwear"], stores: ["myntra", "amazon", "ajio"], views: 5100, rating: 4.4 },
  { n: "Vitamin C Brightening Serum", b: "nykaa", c: "beauty", sub: "Skincare", g: "unisex", mrp: 1499, img: "beauty", colors: ["-"], sizes: ["30ml"], tags: ["skincare", "serum"], stores: ["nykaa", "amazon"], views: 8800, rating: 4.3 },
  { n: "Hydrating Niacinamide Moisturiser", b: "nykaa", c: "beauty-lifestyle", sub: "Skincare", g: "unisex", mrp: 1199, img: "beauty", colors: ["-"], sizes: ["50ml"], tags: ["skincare", "moisturiser"], stores: ["nykaa", "amazon", "myntra"], views: 6200, rating: 4.2, newIn: true },
  { n: "Luxury Skincare Discovery Set", b: "sephora", c: "beauty", sub: "Skincare Sets", g: "women", mrp: 8999, img: "beauty", colors: ["-"], sizes: ONE, tags: ["skincare", "luxury", "gifting"], stores: ["sephora", "nykaa"], views: 3400, rating: 4.6 },
  { n: "Matte Lipstick Trio", b: "sephora", c: "beauty", sub: "Makeup", g: "women", mrp: 2999, img: "beauty", colors: ["Nude", "Berry", "Red"], sizes: ONE, tags: ["makeup", "lips"], stores: ["sephora", "nykaa", "myntra"], views: 4900, rating: 4.4 },
  { n: "Beard Grooming Kit", b: "nykaa", c: "grooming", sub: "Grooming", g: "men", mrp: 1799, img: "beauty", colors: ["-"], sizes: ONE, tags: ["grooming", "men"], stores: ["nykaa", "amazon"], views: 2200, rating: 4.1 },
  { n: "Adjustable Dumbbell Set 20kg", b: "decathlon", c: "fitness", sub: "Strength", g: "unisex", mrp: 6499, img: "apparel", colors: ["Black"], sizes: ONE, tags: ["fitness", "home-gym"], stores: ["decathlon", "amazon"], views: 3700, rating: 4.5 },
  { n: "Cabin Trolley 55cm", b: "decathlon", c: "travel", sub: "Luggage", g: "unisex", mrp: 5499, img: "bag", colors: ["Black", "Sand"], sizes: ONE, tags: ["travel", "luggage"], stores: ["decathlon", "amazon", "myntra"], views: 4400, rating: 4.4 },
  { n: "Everyday Backpack 25L", b: "decathlon", c: "mens-bags", sub: "Backpacks", g: "unisex", mrp: 2999, img: "bag", colors: ["Grey", "Olive"], sizes: ONE, tags: ["bags", "travel", "under-3000"], stores: ["decathlon", "amazon"], views: 5300, rating: 4.3 },
  { n: "Wireless Over-Ear Headphones", b: "amazon", c: "electronics", sub: "Audio", g: "unisex", mrp: 12999, img: "watch", colors: ["Black", "Beige"], sizes: ONE, tags: ["electronics", "audio"], stores: ["amazon", "tatacliq"], views: 9700, rating: 4.4 },
  { n: "Minimal Gold Layered Necklace", b: "myntra", c: "jewelry", sub: "Necklaces", g: "women", mrp: 2499, img: "watch", colors: ["Gold"], sizes: ONE, tags: ["jewelry", "gifting"], stores: ["myntra", "ajio", "amazon"], views: 4800, rating: 4.2 },
  { n: "Leather Derby Formal Shoes", b: "bata", c: "mens-shoes", sub: "Formal Shoes", g: "men", mrp: 2599, img: "sneaker", colors: ["Black", "Brown"], sizes: SHOE, tags: ["formal", "under-3000"], stores: ["myntra", "amazon", "ajio"], views: 3100, rating: 4.0 },
  { n: "Block Heel Leather Sandals", b: "bata", c: "shoes", sub: "Sandals", g: "women", mrp: 2299, img: "sneaker", colors: ["Tan", "Black"], sizes: SHOE, tags: ["sandals", "under-3000"], stores: ["myntra", "ajio"], views: 2400, rating: 4.0 },
];

/* ---------------- offer generation ---------------- */

const hash = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const codes = ["STYLE10", "EXTRA15", "SHOP20", "FIRST25", "SAVE12"];

function buildOffers(seed: Seed, id: string): Offer[] {
  return seed.stores.map((store, i) => {
    const h = hash(id + store);
    const discount = 8 + (h % 48); // 8–55%
    const price = Math.round((seed.mrp * (100 - discount)) / 100 / 10) * 10;
    const stock = h % 11;
    const s: Store | undefined = stores.find((x) => x.slug === store);
    return {
      store,
      price,
      originalPrice: seed.mrp,
      currency: "INR" as const,
      availability: stock === 0 ? "OUT OF STOCK" : stock < 3 ? "LOW STOCK" : "IN STOCK",
      productUrl: `https://www.${s?.domain ?? "example.com"}/p/${slugify(seed.b + " " + seed.n)}`,
      couponCode: h % 3 === 0 ? codes[h % codes.length] : undefined,
      shipping: h % 4 === 0 ? "Free shipping" : "Standard shipping",
      updatedHoursAgo: 1 + (h % 22),
      sponsored: i === 0 && h % 7 === 0,
    };
  });
}

export const products: Product[] = seeds.map((s, i) => {
  const id = `P-${String(i + 1).padStart(4, "0")}`;
  const slug = slugify(`${s.b}-${s.n}`);
  return {
    id,
    slug,
    name: s.n,
    brand: s.b,
    category: s.c,
    subcategory: s.sub,
    gender: s.g,
    description: `${brandName(s.b)} ${s.n} — ${s.sub.toLowerCase()} tracked across ${s.stores.length} store${s.stores.length === 1 ? "" : "s"}. We compare live prices, stock and coupons so you always land on the cheapest active listing.`,
    image: images[s.img],
    colors: s.colors,
    sizes: s.sizes,
    tags: s.tags,
    rating: s.rating,
    reviews: 40 + (hash(id) % 900),
    views: s.views,
    newIn: s.newIn,
    offers: buildOffers(s, id),
  };
});

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
  const params = new URLSearchParams({
    url: offer.productUrl,
    network: store?.network ?? "Direct",
    campaign: store?.campaign ?? "dc-direct",
    storeid: store?.storeId ?? offer.store,
    subid: `${store?.subId ?? "web"}-${product.category}`,
    productid: product.id,
    clickid: `${product.id}-${offer.store}`,
  });
  return `https://track.dealcanvas.example/click?${params.toString()}`;
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
  { id: "SE-2", store: "myntra", title: "Myntra Fashion Hours", discount: "Flat 50-70% off", window: "today", detail: "Marketplace-wide event with extra bank offers." },
  { id: "SE-3", store: "adidas-store", title: "Adidas Originals Drop", discount: "Up to 40% off", window: "tomorrow", detail: "Samba, Gazelle and Campus restock with sale pricing." },
  { id: "SE-4", store: "nykaa", title: "Nykaa Beauty Bonanza", discount: "Up to 50% off", window: "tomorrow", detail: "Skincare bundles and prestige makeup." , code: "PINK50" },
  { id: "SE-5", store: "zara-store", title: "Zara End of Season Sale", discount: "Up to 60% off", window: "this-week", detail: "Second markdown wave lands midweek." },
  { id: "SE-6", store: "ajio", title: "AJIO Big Bold Sale", discount: "Extra 25% off", window: "this-week", detail: "Stacks on already reduced styles.", code: "AJIO25" },
  { id: "SE-7", store: "footlocker", title: "Foot Locker Sneaker Week", discount: "Up to 35% off", window: "next-week", detail: "Nike, Adidas and Puma running styles." },
  { id: "SE-8", store: "tatacliq", title: "Tata CLiQ Luxury Edit", discount: "Up to 45% off", window: "next-week", detail: "Watches, bags and premium beauty." },
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
