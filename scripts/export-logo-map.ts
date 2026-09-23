/**
 * One-off export: dumps every brand's and store's *current* logo URL (as
 * computed by `brandLogo()` / `storeLogo()` in src/data/catalog.ts /
 * src/data/stores.ts — the override map where one exists, else a favicon
 * fallback built from the brand/store's domain) to a JSON file.
 *
 * Why this exists: the admin panel repo's backfill-brand-logos.mjs needs to
 * download and re-host each logo, but those source URLs live in this repo's
 * code, not in the database. Rather than duplicating brandLogoOverrides /
 * brandDomains as a second copy in the other repo (which would silently go
 * stale the next time a brand is added here), this script re-derives the
 * URLs by calling the same functions the site itself uses, then hands off a
 * plain JSON snapshot.
 *
 * catalog.ts imports image assets (`@/assets/*.jpg`) and uses the `@` path
 * alias, which plain Node/tsx can't resolve — same reason seed-supabase.ts
 * loads it through a throwaway Vite SSR server instead of importing it
 * directly.
 *
 * Usage:
 *   npx tsx scripts/export-logo-map.ts
 *   -> writes logo-map.json to the repo root
 *
 * Then copy logo-map.json into the admin panel repo and run:
 *   npm run backfill:logos -- path/to/logo-map.json
 */

import fs from "node:fs";
import path from "node:path";
import { createServer } from "vite";
import type { Brand } from "../src/data/catalog";
import type { Store } from "../src/data/stores";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT_PATH = path.resolve(ROOT, "logo-map.json");

async function loadModules() {
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
    return {
      brands: catalog.brands as Brand[],
      brandLogo: catalog.brandLogo as (slug: string) => string,
      stores: storesMod.stores as Store[],
      storeLogo: storesMod.storeLogo as (slug: string) => string,
    };
  } finally {
    await server.close();
  }
}

async function main() {
  console.log("Loading catalog/stores via Vite SSR...");
  const { brands, brandLogo, stores, storeLogo } = await loadModules();

  const brandMap: Record<string, string> = {};
  for (const b of brands) brandMap[b.slug] = brandLogo(b.slug);

  const storeMap: Record<string, string> = {};
  for (const s of stores) storeMap[s.slug] = storeLogo(s.slug);

  const out = { brands: brandMap, stores: storeMap };
  fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2));

  console.log(`Wrote ${Object.keys(brandMap).length} brand + ${Object.keys(storeMap).length} store logo URLs`);
  console.log(`-> ${OUT_PATH}`);
  console.log("\nCopy this file into the admin panel repo, then run:");
  console.log("  npm run backfill:logos -- path/to/logo-map.json");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
