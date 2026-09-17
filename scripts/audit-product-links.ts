/**
 * Live-checks every offer's outbound `product_url` and clears the ones that
 * are genuinely dead (404/410/DNS failure/connection refused/timeout).
 *
 * Doesn't add new fallback logic — `offerAffiliateUrl()` (src/data/products.ts)
 * already sends shoppers to the brand's homepage whenever `offer.productUrl`
 * is empty or fails to parse as a URL. So the fix here is just: find the
 * offers whose link is confirmed dead, and blank `product_url` for them —
 * the existing runtime fallback does the rest, on every render, automatically.
 *
 * Deliberately conservative about what counts as "broken": a store blocking
 * automated/headless requests (403/429/503) looks identical to a dead link
 * from a script's point of view, but a real shopper's browser would likely
 * still get through — those are logged separately and left untouched rather
 * than risk sending working links to the brand homepage instead.
 *
 * Inserts/updates through the anon key — `offers` already has a public-write
 * RLS policy (the same one the admin dashboard uses).
 *
 * Usage: npx tsx scripts/audit-product-links.ts [--apply]
 *   (no flag = dry run, prints what WOULD change; --apply writes the fix)
 */
process.loadEnvFile?.();

import { createClient } from "@supabase/supabase-js";

const url = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
if (!url || !anonKey) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env");
  process.exit(1);
}
const supabase = createClient(url, anonKey, { auth: { persistSession: false } });

const APPLY = process.argv.includes("--apply");
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";
const TIMEOUT_MS = 10_000;
const CONCURRENCY = 12;

type Offer = { id: string; product_slug: string; store: string; product_url: string };

type Verdict = "ok" | "dead" | "uncertain" | "empty-or-malformed";

async function checkUrl(raw: string): Promise<{ verdict: Verdict; detail: string }> {
  if (!raw) return { verdict: "empty-or-malformed", detail: "empty" };
  try {
    new URL(raw);
  } catch {
    return { verdict: "empty-or-malformed", detail: "unparsable" };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    let res: Response;
    try {
      res = await fetch(raw, { method: "HEAD", redirect: "follow", signal: controller.signal, headers: { "User-Agent": UA } });
    } catch {
      // Some stores reject HEAD outright — retry with GET before concluding anything.
      res = await fetch(raw, { method: "GET", redirect: "follow", signal: controller.signal, headers: { "User-Agent": UA } });
    }
    if (res.status === 404 || res.status === 410) return { verdict: "dead", detail: `HTTP ${res.status}` };
    if (res.status === 405) {
      // HEAD not allowed by the server itself — confirm with GET.
      const res2 = await fetch(raw, { method: "GET", redirect: "follow", signal: controller.signal, headers: { "User-Agent": UA } });
      if (res2.status === 404 || res2.status === 410) return { verdict: "dead", detail: `HTTP ${res2.status}` };
      if (res2.status >= 200 && res2.status < 400) return { verdict: "ok", detail: `HTTP ${res2.status}` };
      return { verdict: "uncertain", detail: `HTTP ${res2.status}` };
    }
    if (res.status >= 200 && res.status < 400) return { verdict: "ok", detail: `HTTP ${res.status}` };
    return { verdict: "uncertain", detail: `HTTP ${res.status}` };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("abort")) return { verdict: "dead", detail: "timeout" };
    return { verdict: "dead", detail: msg.slice(0, 80) };
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  const offers: Offer[] = [];
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from("offers")
      .select("id, product_slug, store, product_url")
      .range(from, from + PAGE - 1);
    if (error) throw error;
    offers.push(...(data as Offer[]));
    if (data.length < PAGE) break;
  }
  console.log(`Checking ${offers.length} offer links (concurrency ${CONCURRENCY})...`);

  const results: { offer: Offer; verdict: Verdict; detail: string }[] = [];
  let i = 0;
  async function worker() {
    while (i < offers.length) {
      const offer = offers[i++]!;
      const { verdict, detail } = await checkUrl(offer.product_url);
      results.push({ offer, verdict, detail });
      if (results.length % 100 === 0) console.log(`  checked ${results.length}/${offers.length}`);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  const dead = results.filter((r) => r.verdict === "dead");
  const malformed = results.filter((r) => r.verdict === "empty-or-malformed");
  const uncertain = results.filter((r) => r.verdict === "uncertain");
  const ok = results.filter((r) => r.verdict === "ok");

  console.log(`\nok: ${ok.length}`);
  console.log(`already empty/malformed (already falls back today): ${malformed.length}`);
  console.log(`uncertain (blocked automated requests, left untouched): ${uncertain.length}`);
  console.log(`confirmed dead (404/410/DNS/timeout): ${dead.length}`);

  if (dead.length) {
    console.log("\nDead links:");
    for (const r of dead) {
      console.log(`  [${r.detail}] ${r.offer.product_slug} @ ${r.offer.store} -> ${r.offer.product_url}`);
    }
  }
  if (uncertain.length) {
    console.log("\nUncertain (not modified):");
    for (const r of uncertain) {
      console.log(`  [${r.detail}] ${r.offer.product_slug} @ ${r.offer.store} -> ${r.offer.product_url}`);
    }
  }

  if (!dead.length) {
    console.log("\nNothing to fix.");
    return;
  }

  if (!APPLY) {
    console.log(`\nDry run — ${dead.length} offer(s) would have product_url cleared. Re-run with --apply to write it.`);
    return;
  }

  console.log(`\nClearing product_url on ${dead.length} dead offer(s)...`);
  for (const r of dead) {
    const { error } = await supabase.from("offers").update({ product_url: "" }).eq("id", r.offer.id);
    if (error) console.error(`  failed for ${r.offer.id}:`, error.message);
  }
  console.log("Done — those offers will now send shoppers to the brand homepage instead of a dead link.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
