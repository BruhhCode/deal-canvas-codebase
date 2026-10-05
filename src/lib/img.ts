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
    // platform, both Boohoo Group brands): this used to rewrite "_xl" to
    // "_sm" for a smaller download, on the assumption that "_sm" was just a
    // smaller rendition of the same photo. Not true for every SKU — for a
    // real subset of products (confirmed by hand, e.g. cnq6463_blue and
    // cmm26528_white), "_sm" actually serves that retailer's literal
    // "Image coming soon" / "This image is under construction" placeholder
    // graphic instead of the product photo, while "_xl" always has the real
    // one. Passing the URL through unchanged trades the file-size saving for
    // never showing a placeholder graphic as a product's photo.
    if (host === "mediahub.boohoo.com" || host === "mediahub.prettylittlething.com") {
      return url;
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
