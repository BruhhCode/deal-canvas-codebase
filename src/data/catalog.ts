import catFashion from "@/assets/cat-fashion.jpg";
import catBeauty from "@/assets/cat-beauty.jpg";
import catShoes from "@/assets/cat-shoes.jpg";
import catAccessories from "@/assets/cat-accessories.jpg";
import catLifestyle from "@/assets/cat-lifestyle.jpg";
import catTravel from "@/assets/cat-travel.jpg";

export type DealStatus = "ACTIVE" | "UPCOMING" | "EXPIRED" | "SOLD OUT" | "PAUSED";

export type Badge =
  | "HOT DEAL"
  | "EXCLUSIVE"
  | "BEST PRICE"
  | "LIMITED TIME"
  | "COUPON"
  | "FLASH SALE"
  | "EDITOR'S PICK"
  | "SPONSORED";

export interface Brand {
  slug: string;
  name: string;
  description: string;
  category: string;
  network: AffiliateNetwork;
  featured?: boolean;
}

export type AffiliateNetwork =
  | "Admitad"
  | "CJ Affiliate"
  | "Impact"
  | "Awin"
  | "Rakuten Advertising"
  | "Amazon Associates";

export interface Category {
  slug: string;
  name: string;
  tagline: string;
  image: string;
  children: string[];
}

export interface Deal {
  id: string;
  slug: string;
  title: string;
  product: string;
  brand: string; // brand slug
  category: string; // category slug
  subcategory?: string;
  originalPrice: number;
  price: number;
  code?: string;
  dealType: string;
  badges: Badge[];
  description: string;
  terms: string[];
  /** hours from "now" until the deal expires; negative = already expired */
  expiresInHours: number;
  status: DealStatus;
  image: string;
  tags: string[];
  merchantUrl: string;
  network: AffiliateNetwork;
  campaign: string;
  subId: string;
  trackingId: string;
  clicks: number;
  featured?: boolean;
  flash?: boolean;
  sponsored?: boolean;
}

export interface Coupon {
  id: string;
  brand: string;
  title: string;
  description: string;
  code: string;
  discount: string;
  expiresInHours: number;
  usedToday: number;
  successRate: number;
}

export interface Guide {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  published: string;
  image: string;
  body: string[];
  dealTags: string[];
}

export const categories: Category[] = [
  {
    slug: "fashion",
    name: "Fashion",
    tagline: "Womenswear, menswear, luxury and streetwear discounts.",
    image: catFashion,
    children: ["Men's Fashion", "Women's Fashion", "Kids", "Luxury Fashion", "Streetwear", "Ethnic Wear"],
  },
  {
    slug: "beauty",
    name: "Beauty",
    tagline: "Makeup, skincare, haircare, fragrance and grooming offers.",
    image: catBeauty,
    children: ["Makeup", "Skincare", "Haircare", "Fragrances", "Grooming"],
  },
  {
    slug: "shoes",
    name: "Shoes",
    tagline: "Sneakers, formals, heels and running shoes on sale.",
    image: catShoes,
    children: ["Sneakers", "Running", "Formal", "Heels", "Sandals"],
  },
  {
    slug: "accessories",
    name: "Accessories",
    tagline: "Bags, watches, eyewear and jewellery deals.",
    image: catAccessories,
    children: ["Bags", "Watches", "Eyewear", "Jewellery", "Belts"],
  },
  {
    slug: "lifestyle",
    name: "Lifestyle",
    tagline: "Home, fitness, gadgets, food and experiences.",
    image: catLifestyle,
    children: ["Home", "Fitness", "Gadgets", "Experiences", "Food"],
  },
  {
    slug: "travel",
    name: "Travel",
    tagline: "Flights, stays, luggage and holiday offers.",
    image: catTravel,
    children: ["Flights", "Hotels", "Luggage", "Holidays"],
  },
];

export const brands: Brand[] = [
  { slug: "nike", name: "Nike", category: "Shoes", network: "CJ Affiliate", featured: true, description: "Performance sportswear and iconic sneakers. Nike runs frequent seasonal markdowns on Air Max, Pegasus and Dri-FIT essentials." },
  { slug: "adidas", name: "Adidas", category: "Shoes", network: "Awin", featured: true, description: "Three-stripe sportswear, Originals sneakers and training gear with regular end-of-season sales." },
  { slug: "zara", name: "Zara", category: "Fashion", network: "Impact", featured: true, description: "Fast-moving runway-inspired collections. Best discounts land during the mid-season and end-of-season sale windows." },
  { slug: "hm", name: "H&M", category: "Fashion", network: "Awin", featured: true, description: "Accessible everyday fashion for women, men and kids with weekly member-only price drops." },
  { slug: "myntra", name: "Myntra", category: "Fashion", network: "Admitad", featured: true, description: "India's largest fashion marketplace with 4,000+ brands and near-constant coupon activity." },
  { slug: "ajio", name: "AJIO", category: "Fashion", network: "Admitad", featured: true, description: "Curated Indian and international labels, known for aggressive bank-offer stacking." },
  { slug: "amazon", name: "Amazon Fashion", category: "Shopping", network: "Amazon Associates", featured: true, description: "Everything store with a deep fashion and lifestyle catalogue and lightning deals throughout the day." },
  { slug: "puma", name: "Puma", category: "Shoes", network: "Rakuten Advertising", featured: true, description: "Sport-lifestyle footwear and apparel with strong outlet pricing." },
  { slug: "levis", name: "Levi's", category: "Fashion", network: "CJ Affiliate", featured: true, description: "The original denim house. 501s, trucker jackets and western shirts, frequently bundled." },
  { slug: "calvin-klein", name: "Calvin Klein", category: "Fashion", network: "Impact", featured: true, description: "Minimal American design across denim, innerwear and fragrance." },
  { slug: "nykaa", name: "Nykaa", category: "Beauty", network: "Admitad", description: "Beauty and wellness retailer with luxury and mass brands, plus recurring pink-sale events." },
  { slug: "sephora", name: "Sephora", category: "Beauty", network: "Rakuten Advertising", description: "Prestige beauty destination for makeup, skincare and fragrance." },
  { slug: "bata", name: "Bata", category: "Shoes", network: "Admitad", description: "Everyday footwear for the whole family at value pricing." },
  { slug: "charles-keith", name: "Charles & Keith", category: "Accessories", network: "Impact", description: "Contemporary bags, footwear and accessories with a strong seasonal sale calendar." },
  { slug: "burberry", name: "Burberry", category: "Luxury", network: "Awin", description: "British luxury house known for trench coats, check scarves and outerwear." },
  { slug: "armani", name: "Armani", category: "Luxury", network: "Awin", description: "Italian luxury tailoring, watches and fragrance." },
  { slug: "decathlon", name: "Decathlon", category: "Lifestyle", network: "Admitad", description: "Sports and fitness gear at accessible prices across 60+ in-house brands." },
  { slug: "makemytrip", name: "MakeMyTrip", category: "Travel", network: "Admitad", description: "Flights, hotels and holiday packages with bank-offer led discounting." },
  { slug: "mango", name: "Mango", category: "Fashion", network: "Impact", featured: true, description: "Mediterranean-inspired womenswear and tailoring with frequent capsule-collection markdowns." },
  { slug: "uniqlo", name: "Uniqlo", category: "Fashion", network: "Awin", featured: true, description: "Japanese basics and technical essentials like Heattech and Airism, often bundled in seasonal sales." },
  { slug: "columbia", name: "Columbia", category: "Lifestyle", network: "CJ Affiliate", description: "Outdoor and performance wear built for hiking, cold weather and trail use." },
  { slug: "gucci", name: "Gucci", category: "Luxury", network: "Awin", description: "Italian luxury house spanning ready-to-wear, leather goods and accessories." },
  { slug: "asos", name: "ASOS", category: "Fashion", network: "Impact", featured: true, description: "UK-based fashion marketplace with thousands of third-party and in-house labels." },
];

const brandNameBySlug = new Map(brands.map((b) => [b.slug, b.name]));
export const brandName = (slug: string) => brandNameBySlug.get(slug) ?? slug;
export const getBrand = (slug: string) => brands.find((b) => b.slug === slug);

const imageFor = (cat: string) =>
  categories.find((c) => c.slug === cat)?.image ?? catFashion;

interface Seed {
  t: string;
  p: string;
  b: string;
  c: string;
  sub?: string;
  op: number;
  np: number;
  code?: string;
  type: string;
  badges: Badge[];
  h: number;
  status?: DealStatus;
  tags: string[];
  featured?: boolean;
  flash?: boolean;
  sponsored?: boolean;
  clicks: number;
}

const seeds: Seed[] = [
  { t: "Nike Air Max Sneakers at 35% Off", p: "Air Max 270 Sneakers", b: "nike", c: "shoes", sub: "Sneakers", op: 12999, np: 8499, code: "NIKE35", type: "Coupon Deal", badges: ["HOT DEAL", "COUPON"], h: 46, tags: ["sneakers", "nike", "under-10000"], featured: true, clicks: 4821 },
  { t: "Zara Summer Collection Flat 40% Off", p: "Summer Linen Collection", b: "zara", c: "fashion", sub: "Women's Fashion", op: 4999, np: 2999, code: "SUMMER40", type: "Seasonal Sale", badges: ["EDITOR'S PICK", "COUPON"], h: 48, tags: ["summer", "linen", "women"], featured: true, clicks: 3910 },
  { t: "Adidas Ultraboost Light Running Shoes", p: "Ultraboost Light", b: "adidas", c: "shoes", sub: "Running", op: 18999, np: 11399, type: "Store Sale", badges: ["BEST PRICE"], h: 120, tags: ["running", "sneakers"], featured: true, clicks: 2984 },
  { t: "Myntra End of Reason Sale — Up to 80% Off", p: "End of Reason Sale", b: "myntra", c: "fashion", op: 3999, np: 999, code: "STYLE20", type: "Mega Sale", badges: ["HOT DEAL", "LIMITED TIME"], h: 71, tags: ["sale", "marketplace"], featured: true, clicks: 7211 },
  { t: "AJIO Big Bold Sale — Extra 25% Off", p: "Big Bold Sale", b: "ajio", c: "fashion", op: 2499, np: 1499, code: "AJIO25", type: "Coupon Deal", badges: ["COUPON"], h: 30, tags: ["sale", "extra-off"], clicks: 5120 },
  { t: "H&M Basics Bundle — Buy 2 Get 1", p: "Cotton Basics Bundle", b: "hm", c: "fashion", sub: "Men's Fashion", op: 2097, np: 1398, type: "Bundle Offer", badges: ["BEST PRICE"], h: 96, tags: ["basics", "bundle", "men"], clicks: 1877 },
  { t: "Levi's 501 Original Jeans at 45% Off", p: "501 Original Fit Jeans", b: "levis", c: "fashion", sub: "Men's Fashion", op: 4999, np: 2749, code: "DENIM45", type: "Coupon Deal", badges: ["HOT DEAL", "COUPON"], h: 18, tags: ["denim", "jeans", "men"], flash: true, clicks: 3320 },
  { t: "Puma Flash Sale — Extra 30% Off Sale Styles", p: "Sale Styles", b: "puma", c: "shoes", sub: "Sneakers", op: 5999, np: 3499, code: "PUMA30", type: "Flash Sale", badges: ["FLASH SALE", "LIMITED TIME"], h: 8, tags: ["flash", "sneakers"], flash: true, clicks: 2610 },
  { t: "Calvin Klein Fragrance Gift Set 30% Off", p: "CK One Gift Set", b: "calvin-klein", c: "beauty", sub: "Fragrances", op: 6499, np: 4549, type: "Store Sale", badges: ["EXCLUSIVE"], h: 60, tags: ["fragrance", "gifting"], clicks: 1420 },
  { t: "Nykaa Pink Friday Sale — Up to 50% Off Beauty", p: "Pink Friday Sale", b: "nykaa", c: "beauty", sub: "Makeup", op: 1999, np: 999, code: "PINK50", type: "Seasonal Sale", badges: ["HOT DEAL", "COUPON"], h: 40, tags: ["beauty", "makeup"], featured: true, clicks: 4102 },
  { t: "Sephora Skincare Sets at 25% Off", p: "Luxury Skincare Set", b: "sephora", c: "beauty", sub: "Skincare", op: 8999, np: 6749, code: "GLOW25", type: "Coupon Deal", badges: ["COUPON"], h: 90, tags: ["skincare", "luxury"], clicks: 1290 },
  { t: "Charles & Keith Handbags — Flat 40% Off", p: "Structured Tote Bag", b: "charles-keith", c: "accessories", sub: "Bags", op: 7999, np: 4799, type: "Seasonal Sale", badges: ["EDITOR'S PICK"], h: 52, tags: ["bags", "women"], featured: true, clicks: 2211 },
  { t: "Armani Exchange Watches Up to 45% Off", p: "AX Chronograph Watch", b: "armani", c: "accessories", sub: "Watches", op: 21999, np: 12099, type: "Clearance", badges: ["BEST PRICE"], h: 200, tags: ["watches", "luxury"], clicks: 980 },
  { t: "Burberry Check Scarf — Members Only Price", p: "Classic Check Cashmere Scarf", b: "burberry", c: "accessories", op: 42000, np: 33600, type: "Exclusive Offer", badges: ["EXCLUSIVE", "LIMITED TIME"], h: 26, tags: ["luxury", "scarf"], clicks: 640 },
  { t: "Bata Formal Shoes Starting ₹1,299", p: "Leather Derby Shoes", b: "bata", c: "shoes", sub: "Formal", op: 2599, np: 1299, code: "BATA50", type: "Coupon Deal", badges: ["COUPON", "BEST PRICE"], h: 110, tags: ["formal", "men", "under-3000"], clicks: 1560 },
  { t: "Decathlon Fitness Gear — Flat 30% Off", p: "Home Gym Essentials", b: "decathlon", c: "lifestyle", sub: "Fitness", op: 4499, np: 3149, type: "Store Sale", badges: ["BEST PRICE"], h: 140, tags: ["fitness", "home"], clicks: 1105 },
  { t: "MakeMyTrip Hotel Bookings — Extra 20% Off", p: "Domestic Hotel Bookings", b: "makemytrip", c: "travel", sub: "Hotels", op: 10000, np: 8000, code: "STAY20", type: "Coupon Deal", badges: ["COUPON"], h: 300, tags: ["travel", "hotels"], clicks: 2044 },
  { t: "Amazon Lightning Deal — Fashion Under ₹999", p: "Fashion Under ₹999 Store", b: "amazon", c: "fashion", op: 1999, np: 899, type: "Flash Sale", badges: ["FLASH SALE"], h: 5, tags: ["flash", "budget"], flash: true, clicks: 6033 },
  { t: "Nike Dri-FIT Training Tees — 2 for ₹2,999", p: "Dri-FIT Training Tee", b: "nike", c: "fashion", sub: "Men's Fashion", op: 4598, np: 2999, type: "Bundle Offer", badges: ["BEST PRICE"], h: 72, tags: ["activewear", "men"], clicks: 1732 },
  { t: "Adidas Originals Track Jacket 50% Off", p: "Firebird Track Jacket", b: "adidas", c: "fashion", sub: "Streetwear", op: 5999, np: 2999, code: "TRACK50", type: "Coupon Deal", badges: ["COUPON", "HOT DEAL"], h: 22, tags: ["streetwear", "jacket"], flash: true, clicks: 2870 },
  { t: "Zara Kids Autumn Edit — Up to 60% Off", p: "Kids Autumn Edit", b: "zara", c: "fashion", sub: "Kids", op: 2999, np: 1199, type: "Seasonal Sale", badges: ["LIMITED TIME"], h: 84, tags: ["kids", "autumn"], clicks: 890 },
  { t: "H&M Home Textiles — Flat 35% Off", p: "Linen Bedding Set", b: "hm", c: "lifestyle", sub: "Home", op: 4999, np: 3249, type: "Store Sale", badges: ["EDITOR'S PICK"], h: 130, tags: ["home", "bedding"], clicks: 710 },
  { t: "Myntra Beauty Fest — Buy 2 Get 2 Free", p: "Beauty Fest", b: "myntra", c: "beauty", sub: "Makeup", op: 2400, np: 1200, code: "BEAUTY4", type: "Bundle Offer", badges: ["COUPON"], h: 44, tags: ["beauty", "bogo"], clicks: 1980 },
  { t: "AJIO Luxe — Designer Labels Up to 65% Off", p: "AJIO Luxe Edit", b: "ajio", c: "fashion", sub: "Luxury Fashion", op: 15999, np: 5599, type: "Clearance", badges: ["EDITOR'S PICK"], h: 160, tags: ["luxury", "designer"], clicks: 1340 },
  { t: "Puma Running Shoes Under ₹3,000", p: "Softride Running Shoes", b: "puma", c: "shoes", sub: "Running", op: 4999, np: 2799, type: "Store Sale", badges: ["BEST PRICE"], h: 210, tags: ["running", "under-3000"], clicks: 2450 },
  { t: "Levi's Trucker Jacket — Extra 25% Off", p: "Sherpa Trucker Jacket", b: "levis", c: "fashion", sub: "Streetwear", op: 7999, np: 5999, code: "TRUCK25", type: "Coupon Deal", badges: ["COUPON"], h: 66, tags: ["denim", "jacket"], clicks: 1120 },
  { t: "Sephora Fragrance Week — 20% Off Sitewide", p: "Fragrance Week", b: "sephora", c: "beauty", sub: "Fragrances", op: 5999, np: 4799, code: "SCENT20", type: "Seasonal Sale", badges: ["COUPON", "LIMITED TIME"], h: 12, tags: ["fragrance"], flash: true, clicks: 1610 },
  { t: "Nykaa Haircare Bundles — Flat 40% Off", p: "Haircare Repair Bundle", b: "nykaa", c: "beauty", sub: "Haircare", op: 2499, np: 1499, type: "Bundle Offer", badges: ["BEST PRICE"], h: 100, tags: ["haircare"], clicks: 930 },
  { t: "Charles & Keith Sale Footwear Extra 20% Off", p: "Sale Heels & Loafers", b: "charles-keith", c: "shoes", sub: "Heels", op: 5499, np: 3299, code: "CK20", type: "Coupon Deal", badges: ["COUPON"], h: 34, tags: ["heels", "women"], clicks: 1044 },
  { t: "Decathlon Travel Backpacks From ₹1,499", p: "40L Travel Backpack", b: "decathlon", c: "travel", sub: "Luggage", op: 2999, np: 1499, type: "Store Sale", badges: ["BEST PRICE"], h: 190, tags: ["travel", "luggage"], clicks: 860 },
  { t: "Amazon Fashion Festival — Partner Offer", p: "Fashion Festival Store", b: "amazon", c: "fashion", op: 4999, np: 2499, type: "Sponsored", badges: ["SPONSORED", "HOT DEAL"], h: 58, tags: ["festival", "sale"], sponsored: true, featured: true, clicks: 5309 },
  { t: "MakeMyTrip Flight Sale — Flat ₹1,500 Off", p: "Domestic Flights", b: "makemytrip", c: "travel", sub: "Flights", op: 6500, np: 5000, code: "FLY1500", type: "Coupon Deal", badges: ["COUPON"], h: 250, tags: ["flights", "travel"], clicks: 1780 },
  { t: "Nike Pegasus 40 — Diwali Sale Price", p: "Pegasus 40", b: "nike", c: "shoes", sub: "Running", op: 11999, np: 7799, type: "Festival Offer", badges: ["LIMITED TIME"], h: -20, status: "EXPIRED", tags: ["running", "festival"], clicks: 3311 },
  { t: "Zara Winter Coats — Early Access", p: "Wool Blend Coat", b: "zara", c: "fashion", sub: "Women's Fashion", op: 9999, np: 6999, type: "Upcoming Sale", badges: ["EXCLUSIVE"], h: 400, status: "UPCOMING", tags: ["winter", "coats"], clicks: 210 },
  { t: "Burberry Trench Coat Archive Sale", p: "Kensington Trench Coat", b: "burberry", c: "fashion", sub: "Luxury Fashion", op: 185000, np: 129500, type: "Clearance", badges: ["EXCLUSIVE"], h: -60, status: "EXPIRED", tags: ["luxury", "outerwear"], clicks: 540 },
];

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[₹%,]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const deals: Deal[] = seeds.map((s, i) => ({
  id: `DL-${1000 + i}`,
  slug: slugify(s.t),
  title: s.t,
  product: s.p,
  brand: s.b,
  category: s.c,
  ...(s.sub ? { subcategory: s.sub } : {}),
  originalPrice: s.op,
  price: s.np,
  ...(s.code ? { code: s.code } : {}),
  dealType: s.type,
  badges: s.badges,
  description: `${brandName(s.b)} is offering ${s.p} at ${Math.round(((s.op - s.np) / s.op) * 100)}% off. ${
    s.code ? `Apply code ${s.code} at checkout to unlock the discounted price.` : "The discount is applied automatically at checkout."
  } Verified by our editors and updated daily.`,
  terms: [
    "Offer valid while stocks last on the merchant website.",
    "Discount applies to selected styles only; final price is shown at checkout.",
    s.code ? `Coupon code ${s.code} must be applied before payment.` : "No coupon code required.",
    "Prices and availability are controlled by the merchant and may change without notice.",
  ],
  expiresInHours: s.h,
  status: s.status ?? "ACTIVE",
  image: imageFor(s.c),
  tags: s.tags,
  merchantUrl: `https://www.${s.b.replace(/-/g, "")}.com/${slugify(s.p)}`,
  network: getBrand(s.b)?.network ?? "Admitad",
  campaign: `${s.c}-${new Date().getFullYear()}-q3`,
  subId: `web_${s.b}_${1000 + i}`,
  trackingId: `TRK-${s.b.toUpperCase().slice(0, 4)}-${1000 + i}`,
  clicks: s.clicks,
  ...(s.featured ? { featured: true } : {}),
  ...(s.flash ? { flash: true } : {}),
  ...(s.sponsored ? { sponsored: true } : {}),
}));

export const coupons: Coupon[] = [
  { id: "C1", brand: "myntra", title: "Myntra Coupon", description: "Get 20% OFF on selected fashion products sitewide.", code: "STYLE20", discount: "20% OFF", expiresInHours: 71, usedToday: 412, successRate: 92 },
  { id: "C2", brand: "nike", title: "Nike Coupon", description: "Extra 35% off on Air Max and Pegasus sneakers.", code: "NIKE35", discount: "35% OFF", expiresInHours: 46, usedToday: 268, successRate: 88 },
  { id: "C3", brand: "ajio", title: "AJIO Coupon", description: "Extra 25% off on already discounted styles.", code: "AJIO25", discount: "25% OFF", expiresInHours: 30, usedToday: 530, successRate: 95 },
  { id: "C4", brand: "zara", title: "Zara Summer Code", description: "Flat 40% off the summer linen edit.", code: "SUMMER40", discount: "40% OFF", expiresInHours: 48, usedToday: 190, successRate: 84 },
  { id: "C5", brand: "nykaa", title: "Nykaa Beauty Coupon", description: "Up to 50% off beauty plus free shipping over ₹999.", code: "PINK50", discount: "50% OFF", expiresInHours: 40, usedToday: 377, successRate: 90 },
  { id: "C6", brand: "sephora", title: "Sephora Skincare Coupon", description: "25% off luxury skincare sets.", code: "GLOW25", discount: "25% OFF", expiresInHours: 90, usedToday: 96, successRate: 81 },
  { id: "C7", brand: "levis", title: "Levi's Denim Coupon", description: "45% off 501 Original Fit jeans.", code: "DENIM45", discount: "45% OFF", expiresInHours: 18, usedToday: 224, successRate: 87 },
  { id: "C8", brand: "puma", title: "Puma Flash Coupon", description: "Extra 30% off sale styles for 24 hours.", code: "PUMA30", discount: "30% OFF", expiresInHours: 8, usedToday: 305, successRate: 93 },
  { id: "C9", brand: "bata", title: "Bata Footwear Coupon", description: "Flat 50% off formal leather shoes.", code: "BATA50", discount: "50% OFF", expiresInHours: 110, usedToday: 141, successRate: 79 },
  { id: "C10", brand: "makemytrip", title: "MakeMyTrip Stay Coupon", description: "Extra 20% off domestic hotel bookings.", code: "STAY20", discount: "20% OFF", expiresInHours: 300, usedToday: 88, successRate: 76 },
  { id: "C11", brand: "charles-keith", title: "Charles & Keith Coupon", description: "Extra 20% off sale footwear and bags.", code: "CK20", discount: "20% OFF", expiresInHours: 34, usedToday: 112, successRate: 83 },
  { id: "C12", brand: "adidas", title: "Adidas Track Coupon", description: "50% off Originals track jackets.", code: "TRACK50", discount: "50% OFF", expiresInHours: 22, usedToday: 259, successRate: 89 },
];

export const guides: Guide[] = [
  {
    slug: "best-sneakers-under-5000",
    title: "Best Sneakers Under ₹5,000 Right Now",
    excerpt: "Ten sneakers worth buying this week, ranked by discount depth and everyday wearability.",
    category: "Shoes",
    readTime: "6 min",
    published: "2026-08-04",
    image: catShoes,
    dealTags: ["sneakers", "under-3000", "running"],
    body: [
      "The sub-₹5,000 sneaker bracket is the most competitive part of the market right now. Puma and Bata are discounting hardest, while Nike and Adidas reserve their best pricing for older silhouettes that have just been refreshed.",
      "Our rule of thumb: anything discounted below 30% in this bracket will be discounted again within six weeks. Wait. Anything above 45% on a current-season silhouette is worth buying immediately, because stock in popular sizes disappears first.",
      "Sizing note — Indian sizing on Puma and Bata runs true, while Adidas Originals tends to run half a size small. Check the merchant's return window before you order, as sale items sometimes carry a shorter window.",
    ],
  },
  {
    slug: "best-fashion-deals-this-week",
    title: "Best Fashion Deals This Week",
    excerpt: "The offers our editors would actually spend their own money on, updated every Monday.",
    category: "Fashion",
    readTime: "5 min",
    published: "2026-08-07",
    image: catFashion,
    dealTags: ["sale", "denim", "women", "men"],
    body: [
      "This week's standout is the Zara summer linen edit at a flat 40% off. Linen rarely drops this early in the season, and the discount applies to full-price shirting rather than leftover stock.",
      "For denim, the Levi's 501 markdown is the strongest price we have tracked in four months. Historically it returns to full price within a week of the coupon expiring.",
      "Marketplace sales — Myntra and AJIO — are best used for basics rather than statement pieces, where the effective discount after bank offers is highest.",
    ],
  },
  {
    slug: "top-mens-fashion-deals",
    title: "Top Men's Fashion Deals Right Now",
    excerpt: "Denim, tailoring, activewear and footwear discounts worth your attention this month.",
    category: "Fashion",
    readTime: "7 min",
    published: "2026-08-02",
    image: catFashion,
    dealTags: ["men", "denim", "formal", "activewear"],
    body: [
      "Menswear discounting follows a predictable rhythm: basics go on sale continuously, outerwear discounts arrive at the end of the season, and tailoring is discounted least of all.",
      "The best value on this page is the H&M basics bundle. Buy-two-get-one on cotton tees is effectively a 33% discount on items you will replace anyway.",
      "If you only click one link this month, make it the Levi's trucker jacket offer — outerwear at 25% extra off is unusual outside December.",
    ],
  },
  {
    slug: "best-beauty-deals-this-month",
    title: "Best Beauty Deals This Month",
    excerpt: "Skincare sets, fragrance weeks and haircare bundles that beat their usual price.",
    category: "Beauty",
    readTime: "5 min",
    published: "2026-07-30",
    image: catBeauty,
    dealTags: ["beauty", "skincare", "fragrance", "haircare"],
    body: [
      "Beauty is the category where bundles beat single-item discounts almost every time. A 40% haircare bundle usually outperforms a 50% single-product offer once you account for size.",
      "Fragrance is the exception. Gift sets are priced to move around festival periods, so the Calvin Klein and Sephora offers on this page are near their annual low.",
      "Always check batch dates on discounted skincare — heavily marked-down actives are often close to their best-before window.",
    ],
  },
  {
    slug: "best-luxury-fashion-discounts",
    title: "Best Luxury Fashion Discounts",
    excerpt: "Where genuine luxury markdowns exist, and how to tell them apart from outlet-only product.",
    category: "Luxury",
    readTime: "8 min",
    published: "2026-07-24",
    image: catAccessories,
    dealTags: ["luxury", "designer", "watches", "scarf"],
    body: [
      "Luxury houses discount main-line product rarely and quietly. When Burberry or Armani mark something down on their own site, it is real inventory — not made-for-outlet product.",
      "Multi-brand luxury edits such as AJIO Luxe are a different proposition: excellent for accessories and footwear, less reliable for current-season ready-to-wear.",
      "Watches are the most reliably discounted luxury accessory, with fashion-house chronographs regularly reaching 45% off.",
    ],
  },
  {
    slug: "best-online-fashion-sales",
    title: "Best Online Fashion Sales Calendar",
    excerpt: "Every major sale window worth planning around, from End of Season to Black Friday.",
    category: "Shopping",
    readTime: "6 min",
    published: "2026-07-18",
    image: catLifestyle,
    dealTags: ["sale", "festival", "summer", "winter"],
    body: [
      "Plan your year around four windows: End of Season (Jan and Jul), the festival cluster (Sep–Nov), Black Friday and Cyber Monday, and the New Year clearance.",
      "Marketplace mega-sales such as Myntra's End of Reason offer the widest catalogue but the shallowest true discounts on premium brands.",
      "Brand-direct sales are usually better for sizing availability, while marketplaces win on bank-offer stacking.",
    ],
  },
];

export const trendingSearches = [
  "Nike Sale",
  "Adidas Deals",
  "Sneakers Under ₹3,000",
  "Men's Clothing Sale",
  "Luxury Discounts",
  "Beauty Offers",
  "Travel Deals",
  "Zara End of Season",
  "Myntra Coupons",
  "Watches Under ₹10,000",
];

export const seasonalSales = [
  { slug: "diwali-sale", name: "Diwali Sale", blurb: "India's biggest fashion discounting window." },
  { slug: "black-friday", name: "Black Friday", blurb: "Global brands at their lowest prices of the year." },
  { slug: "cyber-monday", name: "Cyber Monday", blurb: "Online-only extensions of Black Friday pricing." },
  { slug: "end-of-season-sale", name: "End of Season Sale", blurb: "Clearance across summer and winter collections." },
  { slug: "republic-day-sale", name: "Republic Day Sale", blurb: "January's biggest marketplace event." },
  { slug: "new-year-sale", name: "New Year Sale", blurb: "Clearance stock at the deepest markdowns." },
];

/* ---------- helpers ---------- */

export const discountPct = (d: Pick<Deal, "originalPrice" | "price">) =>
  Math.round(((d.originalPrice - d.price) / d.originalPrice) * 100);

export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export const expiryLabel = (hours: number) => {
  if (hours < 0) return "Expired";
  if (hours < 24) return `Ends in ${hours} hours`;
  const days = Math.round(hours / 24);
  return `Ends in ${days} day${days === 1 ? "" : "s"}`;
};

export const getDeal = (slug: string) => deals.find((d) => d.slug === slug);
export const activeDeals = deals.filter((d) => d.status === "ACTIVE");
export const flashDeals = deals.filter((d) => d.flash && d.status === "ACTIVE");
export const featuredDeals = deals.filter((d) => d.featured && d.status === "ACTIVE");
export const endingSoon = activeDeals
  .slice()
  .sort((a, b) => a.expiresInHours - b.expiresInHours)
  .slice(0, 8);
export const latestDeals = deals.slice().reverse().filter((d) => d.status === "ACTIVE").slice(0, 8);
export const topDiscounts = activeDeals
  .slice()
  .sort((a, b) => discountPct(b) - discountPct(a));

export const dealsByBrand = (slug: string) => deals.filter((d) => d.brand === slug);
export const dealsByCategory = (slug: string) => deals.filter((d) => d.category === slug);
export const couponsByBrand = (slug: string) => coupons.filter((c) => c.brand === slug);

/** Builds the outbound affiliate URL from the stored merchant URL + tracking data. */
export const affiliateUrl = (d: Deal) => {
  const params = new URLSearchParams({
    url: d.merchantUrl,
    network: d.network,
    campaign: d.campaign,
    subid: d.subId,
    tracking: d.trackingId,
    deal: d.id,
  });
  return `https://track.dealcanvas.example/click?${params.toString()}`;
};

export const searchAll = (q: string) => {
  const term = q.trim().toLowerCase();
  if (!term) return { deals: [] as Deal[], coupons: [] as Coupon[], brands: [] as Brand[], guides: [] as Guide[] };
  const match = (s: string) => s.toLowerCase().includes(term);
  return {
    deals: deals.filter(
      (d) => match(d.title) || match(d.product) || match(brandName(d.brand)) || d.tags.some(match) || match(d.category),
    ),
    coupons: coupons.filter((c) => match(c.title) || match(c.description) || match(brandName(c.brand)) || match(c.code)),
    brands: brands.filter((b) => match(b.name) || match(b.category)),
    guides: guides.filter((g) => match(g.title) || match(g.excerpt) || match(g.category)),
  };
};
