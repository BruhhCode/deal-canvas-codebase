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

    // mediahub.boohoo.com / mediahub.prettylittlething.com (same CDN
    // platform, both Boohoo Group brands): the URL's trailing size keyword
    // is effectively binary — "_xl" serves the full-resolution master
    // (400-550 KiB per curl check), any other value (including "_sm" or a
    // nonsense string) serves the same much smaller default rendition
    // (~13-90 KiB, ~5x smaller) — verified by hand against real product
    // URLs, not guessed. "_sm" used here as the readable, intentional one.
    if (host === "mediahub.boohoo.com" || host === "mediahub.prettylittlething.com") {
      return url.replace(/_xl$/, "_sm");
    }

    // n.nordstrommedia.com honours a plain ?w= query param (verified:
    // ~70 KiB raw -> ~13 KiB at w=400, regardless of displayed width here).
    if (host === "n.nordstrommedia.com") {
      u.searchParams.set("w", String(width));
      return u.toString();
    }

    // cdn-images.farfetch-contents.com bakes size into the filename itself
    // as the segment before the extension (e.g. "..._1000.jpg") — query
    // params are ignored (verified: ?w= returns the same bytes as no param
    // at all), but replacing that segment works (~20 KiB -> ~4 KiB at 400).
    if (host === "cdn-images.farfetch-contents.com") {
      return url.replace(/_\d+(\.\w+)$/, `_${width}$1`);
    }

    // Our own Supabase Storage-hosted images (product-images / brand-logos
    // buckets, see docs/shared-context.md "Image & logo storage") are
    // already served pre-sized — pass through unchanged.
    if (host.endsWith(".supabase.co")) {
      return url;
    }

    // TODO: no known resize param for this host (e.g. ASOS, ShopStyle-style
    // CDNs) — return the original, full-size URL.
    return url;
  } catch {
    return url;
  }
}
