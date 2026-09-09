/**
 * Exports the current catalog (src/data/products.generated.ts) to a flat CSV —
 * one row per store offer, with every product- and offer-level field, in the
 * same shape as the original import CSVs so it can be re-imported later.
 *
 * Usage: npx tsx scripts/export-products.ts [output-path]
 */

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import type { Product } from "../src/data/products";

const ROOT = resolve(import.meta.dirname, "..");
const dataPath = resolve(ROOT, "src/data/products.generated.ts");

const BASE_TO_USD = 1 / 83;
const toUsd = (n: number) => Math.round(n * BASE_TO_USD * 100) / 100;

async function loadProducts(): Promise<Product[]> {
  const url = `${pathToFileURL(dataPath).href}?t=${Date.now()}`;
  const mod = (await import(url)) as { generatedProducts: Product[] };
  return mod.generatedProducts;
}

const HEADER = [
  "id",
  "slug",
  "product_name",
  "brand_slug",
  "category_slug",
  "subcategory",
  "gender",
  "description",
  "colors",
  "sizes",
  "tags",
  "rating",
  "reviews",
  "views",
  "new_in",
  "image_url",
  "store_slug",
  "price_usd",
  "original_price_usd",
  "availability",
  "product_url",
];

/** Quotes a CSV field if it contains a comma, quote, or newline; doubles internal quotes. */
function csvField(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function toCsv(products: Product[]): string {
  const lines = [HEADER.join(",")];

  for (const p of products) {
    for (const o of p.offers) {
      const row = [
        p.id,
        p.slug,
        p.name,
        p.brand,
        p.category,
        p.subcategory,
        p.gender,
        p.description,
        p.colors.join("; "),
        p.sizes.join("; "),
        p.tags.join("; "),
        String(p.rating),
        String(p.reviews),
        String(p.views),
        p.newIn ? "true" : "false",
        p.image,
        o.store,
        String(toUsd(o.price)),
        String(toUsd(o.originalPrice)),
        o.availability,
        o.productUrl,
      ];
      lines.push(row.map(csvField).join(","));
    }
  }

  return lines.join("\r\n") + "\r\n";
}

async function main() {
  const outPath = resolve(ROOT, process.argv[2] ?? "products-export.csv");
  const products = await loadProducts();
  writeFileSync(outPath, toCsv(products), "utf-8");

  const rowCount = products.reduce((n, p) => n + p.offers.length, 0);
  console.log(`Exported ${products.length} product(s) / ${rowCount} offer row(s) → ${outPath}`);
}

main();
