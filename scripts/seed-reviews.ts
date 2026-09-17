/**
 * One-time (re-runnable) backfill: ~5 shopper reviews per product, rating
 * 4-5 stars, text templated per product category and filled in with the
 * actual product/brand name so it reads as product-specific rather than
 * generic filler. Skips any product that already has >=5 rows in `reviews`,
 * so it's safe to re-run after adding new products.
 *
 * Inserts through the anon key (same as the live site's review form) since
 * `reviews` already has a public-insert RLS policy — no service role needed.
 *
 * Requires supabase/schema.sql's `reviews` table to already exist.
 *
 * Usage: npx tsx scripts/seed-reviews.ts
 */
process.loadEnvFile?.();

import path from "node:path";
import { createServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import type { Product } from "../src/data/products";

const ROOT = path.resolve(import.meta.dirname, "..");

const url = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env");
  process.exit(1);
}

const supabase = createClient(url, anonKey, { auth: { persistSession: false } });

async function loadCatalog() {
  const server = await createServer({
    configFile: false,
    root: ROOT,
    resolve: { alias: { "@": path.resolve(ROOT, "src") } },
  });
  const mod = await server.ssrLoadModule("/src/data/products.ts");
  const catalogMod = await server.ssrLoadModule("/src/data/catalog.ts");
  await server.close();
  return { products: mod.products as Product[], brandName: catalogMod.brandName as (slug: string) => string };
}

/* ---------------- category buckets ---------------- */

type Bucket = "shoes" | "bags" | "watches" | "jewelry" | "beauty" | "clothing" | "generic";

function bucketFor(p: Product): Bucket {
  const hay = `${p.category} ${p.subcategory} ${p.tags.join(" ")}`.toLowerCase();
  if (/shoe|sneaker|boot|sandal|loafer|footwear/.test(hay)) return "shoes";
  if (/bag|backpack|tote|luggage|wallet|crossbody|travel/.test(hay)) return "bags";
  if (/watch/.test(hay)) return "watches";
  if (/jewelry|earring|necklace|bracelet|\bring\b/.test(hay)) return "jewelry";
  if (/beauty|skincare|makeup|haircare|fragrance|grooming/.test(hay)) return "beauty";
  if (
    /cloth|dress|shirt|jean|hoodie|jacket|sweater|\btop\b|legging|short|pant|tee|outerwear|sportswear|activewear|jumpsuit|skirt|\bcoat\b|vest|sleepwear|underwear|apparel|joggers|hoodie|knitwear|cardigan/.test(
      hay,
    )
  )
    return "clothing";
  return "generic";
}

const templates: Record<Bucket, ((name: string, brand: string) => string)[]> = {
  shoes: [
    (n) => `These ${n} are incredibly comfortable for everyday wear, and the fit runs true to size.`,
    (n) => `Been wearing my ${n} for a few weeks now — great cushioning and they still look brand new.`,
    (n, b) => `The ${b} ${n} exceeded my expectations. Lightweight and stylish, perfect for casual outfits.`,
    (n) => `Ordered these ${n} after seeing them everywhere and the quality is solid, no complaints so far.`,
    (n) => `Great addition to my sneaker rotation — the ${n} run slightly narrow, so consider sizing up.`,
    (n) => `Super comfortable out of the box, no break-in period needed for the ${n}.`,
    (n, b) => `Love how versatile the ${n} are, they go with almost everything in my ${b} wardrobe.`,
  ],
  bags: [
    (n) => `This ${n} is spacious enough for daily essentials without feeling bulky.`,
    (n, b) => `The craftsmanship on this ${b} ${n} is impressive — clean stitching and premium-feeling material.`,
    (n) => `Exactly what I was looking for, the ${n} has held up well after a couple months of daily use.`,
    (n) => `Compliments every time I carry the ${n}. Great size and the zippers feel sturdy.`,
    (n) => `The ${n} looks more expensive than it is — really happy with this purchase.`,
    (n) => `Practical and stylish, the ${n} fits my laptop and everyday items with room to spare.`,
  ],
  watches: [
    (n) => `The ${n} looks even better in person than in photos — feels well made and the finish is flawless.`,
    (n, b) => `Really pleased with this ${b} ${n}, keeps accurate time and the strap is comfortable all day.`,
    (n) => `The ${n} has a nice weight to it without feeling heavy on the wrist.`,
    (n) => `Great gift choice — the ${n} arrived in excellent packaging and looks premium.`,
    (n) => `Clean, classic design. The ${n} pairs well with both casual and formal outfits.`,
  ],
  jewelry: [
    (n) => `The ${n} is even more beautiful in person, and it hasn't tarnished after weeks of wear.`,
    (n, b) => `Elegant and well made — this ${b} ${n} has become my everyday piece.`,
    (n) => `The ${n} was well packaged and makes a great gift, the detailing is lovely.`,
    (n) => `Lightweight and comfortable for all-day wear, the ${n} is exactly as pictured.`,
    (n) => `Good quality for the price — the ${n} has a nice subtle shine without being flashy.`,
  ],
  beauty: [
    (n) => `This ${n} works really well for my routine, noticed a difference within a couple weeks.`,
    (n, b) => `Been using ${b} products for a while and the ${n} is one of my favorites — gentle and effective.`,
    (n) => `The ${n} has a lovely texture and doesn't feel heavy on the skin.`,
    (n) => `Smells great and a little goes a long way — the ${n} will definitely be a repurchase.`,
    (n) => `The ${n} absorbs quickly and left my skin feeling noticeably smoother.`,
  ],
  clothing: [
    (n) => `Love the fit of this ${n} — the fabric feels premium and doesn't wrinkle easily.`,
    (n) => `This ${n} has quickly become a staple in my wardrobe. True to size and great quality for the price.`,
    (n, b) => `The ${b} ${n} washes well and hasn't lost its shape after several wears.`,
    (n) => `Really comfortable material on the ${n}, and the stitching feels durable.`,
    (n) => `The ${n} fits exactly as expected based on the size chart — happy with this purchase.`,
    (n) => `Great layering piece, the ${n} is versatile enough for both work and weekends.`,
  ],
  generic: [
    (n) => `Really happy with this ${n}. Good quality and arrived exactly as pictured.`,
    (n, b) => `The ${b} ${n} is well made and better than I expected for the price.`,
    (n) => `Solid purchase — the ${n} looks and feels premium.`,
    (n) => `Exactly as described, the ${n} has held up well since I got it.`,
    (n) => `Would recommend the ${n} to anyone considering it — good value overall.`,
  ],
};

const firstNames = [
  "Emma", "Liam", "Olivia", "Noah", "Ava", "Ethan", "Sophia", "Mason", "Isabella", "Lucas",
  "Mia", "James", "Amelia", "Benjamin", "Harper", "Elijah", "Evelyn", "Alexander", "Abigail", "Daniel",
  "Zara", "Omar", "Priya", "Wei", "Fatima", "Carlos", "Yuki", "Sofia", "Ivan", "Layla",
];
const lastInitials = "ABCDEFGHJKLMNPQRSTUVWY".split("");

function randomAuthor(rand: () => number): string {
  const first = firstNames[Math.floor(rand() * firstNames.length)]!;
  const last = lastInitials[Math.floor(rand() * lastInitials.length)]!;
  return `${first} ${last}.`;
}

/** Deterministic PRNG so re-runs (or the count check) are stable per product. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) | 0;
  return h;
}

function reviewsFor(p: Product, brandName: (slug: string) => string) {
  const rand = mulberry32(hashSeed(p.slug));
  const bucket = bucketFor(p);
  const pool = templates[bucket];
  const brand = brandName(p.brand);
  const now = Date.now();

  const used = new Set<number>();
  const rows = [];
  const count = 5;
  for (let i = 0; i < count; i++) {
    let idx = Math.floor(rand() * pool.length);
    while (used.has(idx) && used.size < pool.length) idx = Math.floor(rand() * pool.length);
    used.add(idx);
    const comment = pool[idx % pool.length]!(p.name, brand);
    const rating = rand() < 0.6 ? 5 : 4;
    const daysAgo = Math.floor(rand() * 120);
    const created_at = new Date(now - daysAgo * 86_400_000).toISOString();
    rows.push({
      product_slug: p.slug,
      author: randomAuthor(rand),
      rating,
      comment,
      created_at,
    });
  }
  return rows;
}

async function main() {
  const { products, brandName } = await loadCatalog();
  console.log(`Loaded ${products.length} products.`);

  // Which products already have reviews, and how many, so re-runs top up
  // rather than duplicate.
  const existingCounts = new Map<string, number>();
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase.from("reviews").select("product_slug").range(from, from + PAGE - 1);
    if (error) throw error;
    for (const r of data as { product_slug: string }[]) {
      existingCounts.set(r.product_slug, (existingCounts.get(r.product_slug) ?? 0) + 1);
    }
    if (data.length < PAGE) break;
  }
  console.log(`${existingCounts.size} products already have at least one review.`);

  const toInsert: ReturnType<typeof reviewsFor> = [];
  let skipped = 0;
  for (const p of products) {
    if ((existingCounts.get(p.slug) ?? 0) >= 5) {
      skipped++;
      continue;
    }
    toInsert.push(...reviewsFor(p, brandName));
  }

  console.log(`Skipping ${skipped} products that already have 5+ reviews.`);
  console.log(`Inserting ${toInsert.length} reviews across ${toInsert.length / 5} products...`);

  const BATCH = 500;
  for (let i = 0; i < toInsert.length; i += BATCH) {
    const batch = toInsert.slice(i, i + BATCH);
    const { error } = await supabase.from("reviews").insert(batch);
    if (error) throw error;
    console.log(`  inserted ${Math.min(i + BATCH, toInsert.length)}/${toInsert.length}`);
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
