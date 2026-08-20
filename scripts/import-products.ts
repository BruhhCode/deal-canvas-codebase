/**
 * Import products from a CSV into src/data/products.generated.ts.
 *
 * Usage:
 *   npx tsx scripts/import-products.ts <path-to-csv> [--out src/data/products.generated.ts]
 *
 * Expected CSV columns (header row required):
 *   product_name, brand_slug, category_slug, subcategory, gender,
 *   store_slug, price, original_price, availability, product_url, image_url
 *
 * `price` / `original_price` are plain USD dollar amounts (e.g. 179.95) —
 * the script converts them into the catalog's stored legacy base unit
 * (see src/lib/currency.tsx) so they display correctly alongside the
 * existing seed products.
 *
 * Rows are grouped by product_name — every row that shares a product_name
 * becomes one Offer inside that Product's offers[] array. brand_slug,
 * category_slug, subcategory and gender are taken from the group's first
 * row (a warning is printed if later rows in the group disagree).
 *
 * Re-running against an updated CSV is idempotent: any existing product in
 * the output file whose slug matches a freshly-imported product is replaced
 * rather than duplicated. Existing products with no matching slug in the
 * CSV are left untouched.
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

// catalog.ts / stores.ts / products.ts import image assets (.jpg) at module
// scope, which only resolve under Vite's asset pipeline. Rather than import
// those modules at runtime here, we read them as text and pull out the
// brand/store slug + name pairs we need to validate against.
import type { Gender, Offer, Product } from "../src/data/products";
import { toUsd } from "../src/lib/currency";

const ROOT = resolve(import.meta.dirname, "..");

/** Extracts the `[...]` literal that follows `export const <name>` in a source file. */
function extractArrayLiteral(source: string, constName: string): string {
  const marker = `export const ${constName}`;
  const start = source.indexOf(marker);
  if (start === -1) throw new Error(`Could not find "${marker}" while parsing catalog data.`);
  const eq = source.indexOf("=", start + marker.length);
  const open = source.indexOf("[", eq);
  let depth = 0;
  for (let i = open; i < source.length; i++) {
    if (source[i] === "[") depth++;
    else if (source[i] === "]") {
      depth--;
      if (depth === 0) return source.slice(open, i + 1);
    }
  }
  throw new Error(`Unterminated array literal for "${constName}".`);
}

/** Pulls flat `{ slug: "...", name: "...", ... }` objects out of an array literal (no nested braces expected). */
function extractSlugNamePairs(arrayLiteral: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const objMatch of arrayLiteral.matchAll(/\{([^{}]*)\}/g)) {
    const obj = objMatch[1];
    const slug = obj.match(/slug:\s*"([^"]*)"/)?.[1];
    const name = obj.match(/name:\s*"([^"]*)"/)?.[1];
    if (slug) map.set(slug, name ?? slug);
  }
  return map;
}

const catalogSource = readFileSync(resolve(ROOT, "src/data/catalog.ts"), "utf-8");
const storesSource = readFileSync(resolve(ROOT, "src/data/stores.ts"), "utf-8");

const brandsBySlug = extractSlugNamePairs(extractArrayLiteral(catalogSource, "brands: Brand[]"));
const storeSlugSet = new Set(extractSlugNamePairs(extractArrayLiteral(storesSource, "stores: Store[]")).keys());

/* ---------------- CSV parsing ---------------- */

const REQUIRED_COLUMNS = [
  "product_name",
  "brand_slug",
  "category_slug",
  "subcategory",
  "gender",
  "store_slug",
  "price",
  "original_price",
  "availability",
  "product_url",
  "image_url",
] as const;

type Column = (typeof REQUIRED_COLUMNS)[number];
type Row = Record<Column, string>;

function parseCsv(text: string): Row[] {
  const lines = text.split(/\r\n|\n|\r/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];

  const header = parseCsvLine(lines[0]).map((h) => h.trim());
  const missing = REQUIRED_COLUMNS.filter((c) => !header.includes(c));
  if (missing.length > 0) {
    throw new Error(`CSV is missing required column(s): ${missing.join(", ")}`);
  }

  return lines.slice(1).map((line, i) => {
    const cells = parseCsvLine(line);
    const row = {} as Row;
    header.forEach((col, idx) => {
      if ((REQUIRED_COLUMNS as readonly string[]).includes(col)) {
        row[col as Column] = (cells[idx] ?? "").trim();
      }
    });
    for (const col of REQUIRED_COLUMNS) {
      if (row[col] === undefined) {
        throw new Error(`Row ${i + 2}: missing value for "${col}"`);
      }
    }
    return row;
  });
}

/** Splits a single CSV line into cells, honoring double-quoted fields with escaped ("") quotes. */
function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      cells.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  cells.push(cur);
  return cells;
}

/* ---------------- validation helpers ---------------- */

const validAvailability = new Set(["IN STOCK", "LOW STOCK", "OUT OF STOCK"]);
const validGenders = new Set(["women", "men", "unisex"]);

/** Converts a real USD amount into the catalog's stored legacy base unit (inverse of toUsd). */
const usdToBase = (usd: number) => Math.round(usd / toUsd(1));

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const hash = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
};

/* ---------------- grouping ---------------- */

interface Group {
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  gender: Gender;
  image: string;
  rows: Row[];
}

function groupRows(rows: Row[]): Group[] {
  const groups = new Map<string, Group>();

  rows.forEach((row, i) => {
    const lineNo = i + 2;

    if (!brandsBySlug.has(row.brand_slug)) {
      throw new Error(`Row ${lineNo}: unknown brand_slug "${row.brand_slug}" (not found in catalog.ts)`);
    }
    if (!storeSlugSet.has(row.store_slug)) {
      throw new Error(`Row ${lineNo}: unknown store_slug "${row.store_slug}" (not found in stores.ts)`);
    }
    if (!validAvailability.has(row.availability)) {
      throw new Error(
        `Row ${lineNo}: invalid availability "${row.availability}" (expected IN STOCK, LOW STOCK, or OUT OF STOCK)`,
      );
    }
    if (!validGenders.has(row.gender)) {
      throw new Error(`Row ${lineNo}: invalid gender "${row.gender}" (expected women, men, or unisex)`);
    }
    if (!row.product_name) {
      throw new Error(`Row ${lineNo}: product_name is required`);
    }
    if (Number.isNaN(Number(row.price)) || Number.isNaN(Number(row.original_price))) {
      throw new Error(`Row ${lineNo}: price and original_price must be numbers`);
    }

    let group = groups.get(row.product_name);
    if (!group) {
      group = {
        name: row.product_name,
        brand: row.brand_slug,
        category: row.category_slug,
        subcategory: row.subcategory,
        gender: row.gender as Gender,
        image: row.image_url,
        rows: [],
      };
      groups.set(row.product_name, group);
    } else {
      if (group.brand !== row.brand_slug) {
        console.warn(
          `Warning: "${row.product_name}" row ${lineNo} has brand_slug "${row.brand_slug}", ` +
            `but the group was started with "${group.brand}". Keeping "${group.brand}".`,
        );
      }
      if (group.category !== row.category_slug) {
        console.warn(
          `Warning: "${row.product_name}" row ${lineNo} has category_slug "${row.category_slug}", ` +
            `but the group was started with "${group.category}". Keeping "${group.category}".`,
        );
      }
    }
    group.rows.push(row);
  });

  return Array.from(groups.values());
}

/* ---------------- product/offer building ---------------- */

function buildOffer(row: Row): Offer {
  return {
    store: row.store_slug,
    price: usdToBase(Number(row.price)),
    originalPrice: usdToBase(Number(row.original_price)),
    currency: "USD",
    availability: row.availability as Offer["availability"],
    productUrl: row.product_url,
    shipping: "Standard shipping",
    updatedHoursAgo: 1,
  };
}

function buildProduct(group: Group, index: number): Product {
  const id = `PI-${String(index + 1).padStart(4, "0")}`;
  const slug = slugify(`${group.brand}-${group.name}`);
  const brandName = brandsBySlug.get(group.brand) ?? group.brand;

  return {
    id,
    slug,
    name: group.name,
    brand: group.brand,
    category: group.category,
    subcategory: group.subcategory,
    gender: group.gender,
    description: `${brandName} ${group.name} — ${group.subcategory.toLowerCase()} tracked across ${group.rows.length} store${group.rows.length === 1 ? "" : "s"}. We compare live prices, stock and coupons so you always land on the cheapest active listing.`,
    image: group.image,
    colors: [],
    sizes: [],
    tags: [group.category, slugify(group.subcategory)].filter(Boolean),
    rating: 4.0,
    reviews: 40 + (hash(id) % 200),
    views: 0,
    offers: group.rows.map(buildOffer),
  };
}

/* ---------------- codegen ---------------- */

function toSource(products: Product[]): string {
  const body = JSON.stringify(products, null, 2)
    // JSON.stringify drops `undefined` fields anyway; nothing further to strip.
    .replace(/"([a-zA-Z_][a-zA-Z0-9_]*)":/g, "$1:");

  return `// AUTO-GENERATED by scripts/import-products.ts — do not edit by hand.
// Re-run \`npx tsx scripts/import-products.ts <csv>\` to regenerate.

import type { Product } from "./products";

export const generatedProducts: Product[] = ${body};
`;
}

/** Loads the `generatedProducts` array already sitting at outPath, if any (for idempotent re-imports). */
async function loadExistingProducts(outPath: string): Promise<Product[]> {
  if (!existsSync(outPath)) return [];
  // Cache-bust so repeated runs in the same process (e.g. tests) see fresh content.
  const url = `${pathToFileURL(outPath).href}?t=${Date.now()}`;
  const mod = (await import(url)) as { generatedProducts?: Product[] };
  return mod.generatedProducts ?? [];
}

/* ---------------- main ---------------- */

async function main() {
  const args = process.argv.slice(2);
  const csvPath = args[0];
  if (!csvPath) {
    console.error("Usage: npx tsx scripts/import-products.ts <path-to-csv> [--out <file>]");
    process.exit(1);
  }

  const outFlagIndex = args.indexOf("--out");
  const outPath = resolve(
    outFlagIndex !== -1 && args[outFlagIndex + 1]
      ? args[outFlagIndex + 1]
      : "src/data/products.generated.ts",
  );

  const csvText = readFileSync(resolve(csvPath), "utf-8");
  const rows = parseCsv(csvText);
  const groups = groupRows(rows);
  const imported = groups.map(buildProduct);

  const existing = await loadExistingProducts(outPath);
  const importedSlugs = new Set(imported.map((p) => p.slug));
  const untouched = existing.filter((p) => !importedSlugs.has(p.slug));
  const merged = [...untouched, ...imported];

  writeFileSync(outPath, toSource(merged), "utf-8");

  const updatedCount = imported.filter((p) => existing.some((e) => e.slug === p.slug)).length;
  const addedCount = imported.length - updatedCount;
  console.log(
    `Imported ${imported.length} product(s) from ${rows.length} row(s) → ${outPath} ` +
      `(${addedCount} added, ${updatedCount} updated, ${untouched.length} unchanged)`,
  );
}

main();
