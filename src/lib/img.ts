/**
 * Rewrites a product/offer image URL to request a smaller size from the
 * source CDN, where the CDN supports it. Never throws — any URL this can't
 * confidently rewrite is returned unchanged.
 */
export function productImg(url: string, width: number): string {
  if (!url) return url;

  try {
    const u = new URL(url);
    const host = u.hostname;

    if (host === "images.unsplash.com") {
      u.searchParams.set("w", String(width));
      u.searchParams.set("q", "70");
      u.searchParams.set("auto", "format");
      return u.toString();
    }

    if (host === "cdn.shopify.com") {
      u.searchParams.set("width", String(width));
      return u.toString();
    }

    if (host === "m.media-amazon.com") {
      // e.g. .../I/71abc._AC_UL640_.jpg -> ._AC_UL{width}_.
      return url.replace(/\._AC_[A-Z]{2}\d+_\./, `._AC_UL${width}_.`);
    }

    if (host === "images.puma.com") {
      // Cloudinary-style transform segment, e.g. /image/upload/w_2000,h_2000/...
      if (/w_\d+,h_\d+/.test(url)) {
        return url.replace(/w_\d+,h_\d+/, `w_${width},h_${width}`);
      }
      return url;
    }

    // Our own Supabase Storage-hosted images (product-images / brand-logos
    // buckets, see docs/shared-context.md "Image & logo storage") are
    // already served pre-sized — pass through unchanged.
    if (host.endsWith(".supabase.co")) {
      return url;
    }

    // TODO: no known resize param for this host (e.g. Nordstrom, Farfetch,
    // ASOS, ShopStyle-style CDNs) — return the original, full-size URL.
    return url;
  } catch {
    return url;
  }
}
