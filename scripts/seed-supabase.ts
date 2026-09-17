/**
 * One-time (re-runnable) push of the static catalog (src/data/*) into Supabase.
 * Uses the service-role key, so it must only ever run locally/server-side — never in the browser.
 *
 * Requires supabase/schema.sql to have already been run in the Supabase SQL Editor.
 *
 * The catalog modules import image assets (`@/assets/*.jpg`) and use the `@` path
 * alias, which plain Node/tsx can't resolve — so this script loads them through a
 * throwaway Vite SSR server (same trick Vite's own SSR does), instead of importing
 * them directly.
 *
 * Usage: npx tsx scripts/seed-supabase.ts
 */

process.loadEnvFile?.();

import path from "node:path";
import { createServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import type { Brand, Coupon, Deal } from "../src/data/catalog";
import type { Store } from "../src/data/stores";
import type { Product, SaleEvent } from "../src/data/products";

const ROOT = path.resolve(import.meta.dirname, "..");

const url = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

async function loadCatalog() {
  const server = await createServer({
    configFile: false,
    root: ROOT,
    resolve: { alias: { "@": path.resolve(ROOT, "src") } },
    server: { middlewareMode: true, hmr: false },
    appType: "custom",
    optimizeDeps: { noDiscovery: true },
    logLevel: "warn",
  });
  try {
    const catalog = await server.ssrLoadModule("/src/data/catalog.ts");
    const storesMod = await server.ssrLoadModule("/src/data/stores.ts");
    const productsMod = await server.ssrLoadModule("/src/data/products.ts");
    return {
      brands: catalog.brands as Brand[],
      deals: catalog.deals as Deal[],
      coupons: catalog.coupons as Coupon[],
      stores: storesMod.stores as Store[],
      products: productsMod.products as Product[],
      saleEvents: productsMod.saleEvents as SaleEvent[],
    };
  } finally {
    await server.close();
  }
}

async function upsertInBatches<T extends Record<string, unknown>>(
  table: string,
  rows: T[],
  batchSize = 500,
) {
  let done = 0;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { error } = await supabase.from(table).upsert(batch);
    if (error) throw new Error(`${table}: ${error.message}`);
    done += batch.length;
  }
  console.log(`  ${table}: upserted ${done} row(s)`);
}

type OfferRow = {
  product_slug: string;
  store: string;
  product_url: string;
  [key: string]: unknown;
};

/**
 * `offers` has no single-column natural key, and (product_slug, store) alone
 * isn't unique either — a product can have multiple offers from the same
 * store (different colorway/SKU rows grouped under one product name, e.g.
 * two Nike Air Force 1 colorways both from "nike-store"). product_url is
 * what actually distinguishes those, so this upserts on the
 * (product_slug, store, product_url) triple — backed by the
 * `offers_product_slug_store_url_key` unique index in supabase/schema.sql —
 * instead of the old delete-everything-then-reinsert. That means a
 * Realtime-subscribed client (src/lib/live-catalog.ts) never sees a
 * still-current offer flash to "gone" mid-seed; only offers actually removed
 * from the source data get an explicit DELETE, scoped to just those rows.
 */
async function upsertOffers(offerRows: OfferRow[]) {
  const existingKeys = new Set<string>();
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from("offers")
      .select("product_slug, store, product_url")
      .range(from, from + PAGE - 1);
    if (error) throw new Error(`offers (read existing): ${error.message}`);
    for (const r of data as { product_slug: string; store: string; product_url: string }[]) {
      existingKeys.add(`${r.product_slug}::${r.store}::${r.product_url}`);
    }
    if (data.length < PAGE) break;
  }

  const newKeys = new Set(offerRows.map((o) => `${o.product_slug}::${o.store}::${o.product_url}`));

  let done = 0;
  for (let i = 0; i < offerRows.length; i += 500) {
    const batch = offerRows.slice(i, i + 500);
    const { error } = await supabase.from("offers").upsert(batch, { onConflict: "product_slug,store,product_url" });
    if (error) throw new Error(`offers (upsert): ${error.message}`);
    done += batch.length;
  }
  console.log(`  offers: upserted ${done} row(s)`);

  const stale = [...existingKeys]
    .filter((k) => !newKeys.has(k))
    .map((k) => {
      const [product_slug, store, product_url] = k.split("::") as [string, string, string];
      return { product_slug, store, product_url };
    });
  if (stale.length) {
    // product_slug/store are machine-generated slugs (lowercase alnum + dashes)
    // and always safe to inline into a PostgREST `.or()` filter unquoted;
    // product_url is real scraped text, so it's quoted to survive commas,
    // parens or other filter-syntax characters that show up in real URLs.
    const quote = (v: string) => `"${v.replace(/"/g, '\\"')}"`;
    for (let i = 0; i < stale.length; i += 100) {
      const chunk = stale.slice(i, i + 100);
      const filter = chunk
        .map((s) => `and(product_slug.eq.${s.product_slug},store.eq.${s.store},product_url.eq.${quote(s.product_url)})`)
        .join(",");
      const { error } = await supabase.from("offers").delete().or(filter);
      if (error) throw new Error(`offers (delete stale): ${error.message}`);
    }
    console.log(`  offers: removed ${stale.length} stale row(s)`);
  }
}

async function main() {
  console.log("Loading static catalog via Vite SSR...");
  const { brands, deals, coupons, stores, products, saleEvents } = await loadCatalog();

  console.log("Seeding Supabase...");

  await upsertInBatches(
    "brands",
    brands.map((b) => ({
      slug: b.slug,
      name: b.name,
      description: b.description,
      category: b.category,
      network: b.network,
      featured: !!b.featured,
    })),
  );

  await upsertInBatches(
    "stores",
    stores.map((s) => ({
      slug: s.slug,
      name: s.name,
      description: s.description,
      network: s.network,
      domain: s.domain,
      campaign: s.campaign,
      store_id: s.storeId,
      sub_id: s.subId,
      ships_to: s.shipsTo,
      store_wide_offer: s.storeWideOffer ?? null,
      featured: !!s.featured,
      sponsored: !!s.sponsored,
    })),
  );

  await upsertInBatches(
    "products",
    products.map((p) => ({
      slug: p.slug,
      source_id: p.id,
      name: p.name,
      brand: p.brand,
      category: p.category,
      subcategory: p.subcategory,
      gender: p.gender,
      description: p.description,
      image: p.image,
      images: p.images ?? [],
      colors: p.colors,
      sizes: p.sizes,
      tags: p.tags,
      rating: p.rating,
      reviews: p.reviews,
      views: p.views,
      new_in: !!p.newIn,
    })),
  );

  const offerRows = products.flatMap((p) =>
    p.offers.map((o) => ({
      product_slug: p.slug,
      store: o.store,
      price: o.price,
      original_price: o.originalPrice,
      currency: o.currency,
      availability: o.availability,
      product_url: o.productUrl,
      coupon_code: o.couponCode ?? null,
      shipping: o.shipping,
      updated_hours_ago: o.updatedHoursAgo,
      sponsored: !!o.sponsored,
    })),
  );
  await upsertOffers(offerRows);

  await upsertInBatches(
    "deals",
    deals.map((d) => ({
      id: d.id,
      slug: d.slug,
      title: d.title,
      product: d.product,
      brand: d.brand,
      category: d.category,
      subcategory: d.subcategory ?? null,
      original_price: d.originalPrice,
      price: d.price,
      code: d.code ?? null,
      deal_type: d.dealType,
      badges: d.badges,
      description: d.description,
      terms: d.terms,
      expires_in_hours: d.expiresInHours,
      status: d.status,
      image: d.image,
      tags: d.tags,
      merchant_url: d.merchantUrl,
      network: d.network,
      campaign: d.campaign,
      sub_id: d.subId,
      tracking_id: d.trackingId,
      clicks: d.clicks,
      featured: !!d.featured,
      flash: !!d.flash,
      sponsored: !!d.sponsored,
    })),
  );

  await upsertInBatches(
    "sale_events",
    saleEvents.map((e) => ({
      id: e.id,
      store: e.store,
      title: e.title,
      discount: e.discount,
      window: e.window,
      detail: e.detail,
      code: e.code ?? null,
    })),
  );

  await upsertInBatches(
    "coupons",
    coupons.map((c) => ({
      id: c.id,
      brand: c.brand,
      title: c.title,
      description: c.description,
      code: c.code,
      discount: c.discount,
      expires_in_hours: c.expiresInHours,
      used_today: c.usedToday,
      success_rate: c.successRate,
    })),
  );

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
