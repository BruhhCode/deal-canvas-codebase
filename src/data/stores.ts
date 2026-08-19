import type { AffiliateNetwork } from "./catalog";

export interface Store {
  slug: string;
  name: string;
  description: string;
  network: AffiliateNetwork;
  /** merchant domain used to build product URLs */
  domain: string;
  campaign: string;
  storeId: string;
  subId: string;
  shipsTo: string;
  storeWideOffer?: string;
  featured?: boolean;
  sponsored?: boolean;
}

export const stores: Store[] = [
  {
    slug: "myntra",
    name: "Myntra",
    domain: "myntra.com",
    network: "Admitad",
    campaign: "dc-myntra",
    storeId: "ST-101",
    subId: "home",
    shipsTo: "India",
    storeWideOffer: "Extra 10% off with STYLE10",
    featured: true,
    description:
      "India's largest multi-brand fashion marketplace, with 4,000+ labels across clothing, footwear, beauty and accessories.",
  },
  {
    slug: "ajio",
    name: "AJIO",
    domain: "ajio.com",
    network: "Admitad",
    campaign: "dc-ajio",
    storeId: "ST-102",
    subId: "home",
    shipsTo: "India",
    storeWideOffer: "Up to 25% extra off sale styles",
    featured: true,
    description:
      "Reliance-owned fashion destination known for curated Indian labels, AJIO Luxe and aggressive bank-offer stacking.",
  },
  {
    slug: "nike-store",
    name: "Nike.com",
    domain: "nike.com",
    network: "CJ Affiliate",
    campaign: "dc-nike",
    storeId: "ST-103",
    subId: "home",
    shipsTo: "India, Global",
    storeWideOffer: "Free shipping for members",
    featured: true,
    description: "The official Nike store — first access to new silhouettes and member-only pricing.",
  },
  {
    slug: "adidas-store",
    name: "Adidas.com",
    domain: "adidas.co.in",
    network: "Awin",
    campaign: "dc-adidas",
    storeId: "ST-104",
    subId: "home",
    shipsTo: "India, Global",
    featured: true,
    description: "Official Adidas store with Originals, Performance and end-of-season clearance.",
  },
  {
    slug: "amazon",
    name: "Amazon Fashion",
    domain: "amazon.in",
    network: "Amazon Associates",
    campaign: "dc-amazon",
    storeId: "ST-105",
    subId: "home",
    shipsTo: "India",
    storeWideOffer: "Lightning deals refreshed hourly",
    featured: true,
    description: "Deep fashion and lifestyle catalogue with fast delivery and continuous lightning deals.",
  },
  {
    slug: "tatacliq",
    name: "Tata CLiQ Luxury",
    domain: "luxury.tatacliq.com",
    network: "Impact",
    campaign: "dc-tatacliq",
    storeId: "ST-106",
    subId: "home",
    shipsTo: "India",
    featured: true,
    sponsored: true,
    description: "Authenticated luxury and premium fashion, watches and beauty from Indian and global houses.",
  },
  {
    slug: "footlocker",
    name: "Foot Locker",
    domain: "footlocker.com",
    network: "Rakuten Advertising",
    campaign: "dc-footlocker",
    storeId: "ST-107",
    subId: "home",
    shipsTo: "Global",
    description: "Sneaker specialist stocking Nike, Adidas, Puma and New Balance releases.",
  },
  {
    slug: "nykaa",
    name: "Nykaa",
    domain: "nykaa.com",
    network: "Admitad",
    campaign: "dc-nykaa",
    storeId: "ST-108",
    subId: "home",
    shipsTo: "India",
    storeWideOffer: "Beauty bundles from ₹499",
    description: "Beauty and wellness retailer carrying prestige, K-beauty and mass brands.",
  },
  {
    slug: "zara-store",
    name: "Zara",
    domain: "zara.com",
    network: "Impact",
    campaign: "dc-zara",
    storeId: "ST-109",
    subId: "home",
    shipsTo: "India, Global",
    description: "Runway-led collections refreshed twice weekly, with two big sale windows a year.",
  },
  {
    slug: "hm-store",
    name: "H&M",
    domain: "hm.com",
    network: "Awin",
    campaign: "dc-hm",
    storeId: "ST-110",
    subId: "home",
    shipsTo: "India, Global",
    description: "Everyday fashion for women, men and kids plus a growing home line.",
  },
  {
    slug: "decathlon",
    name: "Decathlon",
    domain: "decathlon.in",
    network: "Admitad",
    campaign: "dc-decathlon",
    storeId: "ST-111",
    subId: "home",
    shipsTo: "India",
    description: "Sports, fitness and outdoor gear at accessible pricing across 60+ in-house brands.",
  },
  {
    slug: "sephora",
    name: "Sephora",
    domain: "sephora.nnnow.com",
    network: "Rakuten Advertising",
    campaign: "dc-sephora",
    storeId: "ST-112",
    subId: "home",
    shipsTo: "India",
    description: "Prestige beauty destination for makeup, skincare and fragrance.",
  },
];

const bySlug = new Map(stores.map((s) => [s.slug, s]));
export const getStore = (slug: string) => bySlug.get(slug);
export const storeName = (slug: string) => bySlug.get(slug)?.name ?? slug;
