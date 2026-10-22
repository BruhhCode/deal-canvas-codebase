import { productImg } from "@/lib/img";

const SAMPLE_SIZE = 32;
const BORDER_FRACTION = 0.15; // outer ring, as a fraction of SAMPLE_SIZE, assumed to be background
const LOAD_TIMEOUT_MS = 4000;

const cache = new Map<string, Promise<string | null>>();

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    const timer = setTimeout(() => reject(new Error("timeout")), LOAD_TIMEOUT_MS);
    img.onload = () => {
      clearTimeout(timer);
      resolve(img);
    };
    img.onerror = () => {
      clearTimeout(timer);
      reject(new Error("failed to load"));
    };
    img.src = src;
  });
}

/**
 * Samples the outer border ring of a (small, downscaled) copy of the image and
 * returns the most common color found there as an "rgb(r,g,b)" string — product
 * photos are almost always a centered subject on a flat/near-flat background, so
 * the border ring is a reliable stand-in for "the background color".
 *
 * Returns null whenever this can't be determined with confidence: the image
 * fails to load, the host doesn't send CORS headers (canvas sampling requires
 * `crossOrigin="anonymous"` to succeed, which many image CDNs don't support —
 * confirmed by hand that most of this catalog's hosts do, e.g. Nike, Adidas,
 * Shopify, Amazon, Nordstrom, Gap, SHEIN; a few don't, e.g. H&M, Uniqlo,
 * Farfetch), or sampling just times out. Callers should fall back to the
 * existing default background (white) in all of those cases.
 */
export function sampleImageBackground(url: string): Promise<string | null> {
  if (!url) return Promise.resolve(null);
  const cached = cache.get(url);
  if (cached) return cached;

  const promise = (async (): Promise<string | null> => {
    try {
      const img = await loadImage(productImg(url, SAMPLE_SIZE));

      const canvas = document.createElement("canvas");
      canvas.width = SAMPLE_SIZE;
      canvas.height = SAMPLE_SIZE;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return null;
      ctx.drawImage(img, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);

      // Throws (SecurityError) if the canvas got tainted by a cross-origin image
      // that didn't actually send CORS headers despite crossOrigin="anonymous".
      const { data } = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE);

      const border = Math.max(1, Math.round(SAMPLE_SIZE * BORDER_FRACTION));
      const counts = new Map<string, { count: number; r: number; g: number; b: number }>();

      for (let y = 0; y < SAMPLE_SIZE; y++) {
        for (let x = 0; x < SAMPLE_SIZE; x++) {
          const onBorder = x < border || x >= SAMPLE_SIZE - border || y < border || y >= SAMPLE_SIZE - border;
          if (!onBorder) continue;

          const i = (y * SAMPLE_SIZE + x) * 4;
          const r = data[i]!;
          const g = data[i + 1]!;
          const b = data[i + 2]!;
          const a = data[i + 3]!;
          if (a < 200) continue; // skip (near-)transparent pixels

          // Quantize to buckets of 16 so near-identical edge/anti-aliasing noise
          // collapses into the same bucket instead of splitting the vote.
          const key = `${r >> 4}-${g >> 4}-${b >> 4}`;
          const existing = counts.get(key);
          if (existing) {
            existing.count++;
            existing.r += r;
            existing.g += g;
            existing.b += b;
          } else {
            counts.set(key, { count: 1, r, g, b });
          }
        }
      }

      let best: { count: number; r: number; g: number; b: number } | null = null;
      for (const bucket of counts.values()) {
        if (!best || bucket.count > best.count) best = bucket;
      }
      if (!best) return null;

      const r = Math.round(best.r / best.count);
      const g = Math.round(best.g / best.count);
      const b = Math.round(best.b / best.count);
      return `rgb(${r}, ${g}, ${b})`;
    } catch {
      return null;
    }
  })();

  cache.set(url, promise);
  return promise;
}
