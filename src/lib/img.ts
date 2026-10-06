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
    // platform, both Boohoo Group brands): used to rewrite "_xl" to "_sm"
    // for a smaller download. Not safe — for a real subset of SKUs
    // (confirmed by hand, e.g. cnq6463_blue, cmm26528_white), "_sm" (and
    // every other suffix: "_md", "_lg", "_l") serves that retailer's literal
    // "Image coming soon" / "This image is under construction" placeholder
    // instead of the product photo. The suffix is unsafe at any value other
    // than "_xl". A "?w=" query param on the "_xl" URL itself is a separate,
    // safe mechanism — verified on both SKUs above that it resizes the real
    // photo (740 KiB -> ~12 KiB at w=240) rather than ever switching to the
    // placeholder.
    if (host === "mediahub.boohoo.com" || host === "mediahub.prettylittlething.com") {
      u.searchParams.set("w", String(width));
      return u.toString();
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

    // images.lululemon.com / nb.scene7.com (New Balance) — both on Adobe
    // Dynamic Media (Scene7): "wid" resizes proportionally (verified:
    // lululemon 80 KiB -> 3.4 KiB at wid=240, nb.scene7 30 KiB -> 2.3 KiB at
    // wid=240). Our own New Balance URLs already carry a "hei" param for a
    // square crop — keep that square by setting hei to match when present,
    // instead of leaving it at its original value and distorting the image.
    if (host === "images.lululemon.com" || host === "nb.scene7.com") {
      u.searchParams.set("wid", String(width));
      if (u.searchParams.has("hei")) u.searchParams.set("hei", String(width));
      return u.toString();
    }

    // img.ltwebstatic.com (SHEIN): size is baked into the filename as
    // "_thumbnail_{width}x{height}" — verified swapping both numbers (height
    // recomputed to keep the original aspect ratio) serves a correctly
    // resized real photo (87.5 KiB -> 12 KiB at 240w). A completely
    // different "_square_" variant exists on the same CDN but returns a
    // different, much larger image — not used here.
    if (host === "img.ltwebstatic.com") {
      const m = url.match(/_thumbnail_(\d+)x(\d+)(\.\w+)$/);
      if (m) {
        const [, wStr, hStr, ext] = m;
        const newHeight = Math.round((Number(hStr) / Number(wStr)) * width);
        return url.replace(/_thumbnail_\d+x\d+\.\w+$/, `_thumbnail_${width}x${newHeight}${ext}`);
      }
      return url;
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
