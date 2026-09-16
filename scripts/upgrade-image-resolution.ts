/**
 * Rewrites low-resolution image URLs baked into the scraped catalog to their
 * higher-resolution equivalents on the same CDN, in place. These are all
 * "image transformation" URLs — the resolution is a literal size param in
 * the URL path/query, not a separately-hosted file — so bumping the number
 * is enough, no re-scraping needed. Every rewrite below was verified by hand
 * (curl) to actually 200 and return a larger file before being added here.
 *
 * Run: npx tsx scripts/upgrade-image-resolution.ts
 * Then re-run `npx tsx scripts/seed-supabase.ts` so the live Supabase
 * `products` table (which the site actually reads from) picks up the change.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const FILE = fileURLToPath(new URL("../src/data/products.generated.ts", import.meta.url));

const rewrites: { name: string; pattern: RegExp; replace: (match: string) => string }[] = [
  // adidas: w_280,h_280,... -> w_1200,h_1200,...
  {
    name: "adidas",
    pattern: /(assets\.adidas\.com\/images\/)w_\d+,h_\d+/g,
    replace: (m) => m.replace(/w_\d+,h_\d+/, "w_1200,h_1200"),
  },
  // amazon: ._AC_UL320_ / ._AC_SL320_ / ._AC_SX320_ etc -> same prefix, 1200
  {
    name: "amazon",
    pattern: /\._AC_([A-Z]{2})\d+_/g,
    replace: (m) => m.replace(/\._AC_([A-Z]{2})\d+_/, "._AC_$11200_"),
  },
  // farfetch: filename suffix _480.jpg -> _1000.jpg
  {
    name: "farfetch",
    pattern: /_480\.jpg(?=")/g,
    replace: () => "_1000.jpg",
  },
  // shein (ltwebstatic): thumbnail_405x552 -> thumbnail_810x1104 (same 0.734 aspect ratio, 2x)
  {
    name: "shein/ltwebstatic",
    pattern: /thumbnail_405x552/g,
    replace: () => "thumbnail_810x1104",
  },
  // new balance (scene7): $pdpflexf2$ preset -> explicit 1200x1200 request
  {
    name: "new balance/scene7",
    pattern: /\?\$pdpflexf2\$/g,
    replace: () => "?wid=1200&hei=1200",
  },
  // nike: t_default preset -> t_web_pdp_535_v2/f_auto, Nike's actual PDP-quality
  // preset (400x400 16-bit PNG -> 1070x1070 JPEG, ~2.7x the pixels). Scoped to
  // static.nike.com/a/images/t_default/u_ so it can't match any other CDN's
  // "t_default" token by coincidence.
  {
    name: "nike",
    pattern: /(static\.nike\.com\/a\/images\/)t_default\/u_/g,
    replace: (m) => m.replace("t_default/u_", "t_web_pdp_535_v2/f_auto,u_"),
  },
];

let src = readFileSync(FILE, "utf8");
const counts: Record<string, number> = {};

for (const { name, pattern, replace } of rewrites) {
  let n = 0;
  src = src.replace(pattern, (m) => {
    n++;
    return replace(m);
  });
  counts[name] = n;
}

writeFileSync(FILE, src);

console.log("Rewrote image URLs:");
for (const [name, n] of Object.entries(counts)) {
  console.log(`  ${name}: ${n}`);
}
console.log("\nDone. Now run: npx tsx scripts/seed-supabase.ts");
