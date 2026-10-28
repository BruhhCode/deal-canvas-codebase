import { useEffect, useState, type RefObject } from "react";
import { sampleImageBackground } from "@/lib/sampleImageBackground";

/**
 * Resolves to the sampled background color of a product photo, or undefined
 * while pending/unavailable — callers should treat undefined as "use the
 * default background", not as a loading state to block on.
 *
 * When `elRef` is given, sampling is deferred until that element scrolls near
 * the viewport (IntersectionObserver, 200px margin) — grid pages can render
 * dozens of tiles at once, and without this every one of them would fire its
 * own extra image fetch immediately on mount regardless of whether it's ever
 * seen, competing with actually-critical above-the-fold requests. Omit
 * `elRef` for single, always-visible images (e.g. a product page's hero)
 * where that deferral would just add a pointless delay.
 */
export function useImageBackgroundColor(src: string | undefined, elRef?: RefObject<Element | null>): string | undefined {
  const [color, setColor] = useState<string | undefined>(undefined);
  const [shouldLoad, setShouldLoad] = useState(!elRef);

  useEffect(() => {
    if (!elRef || shouldLoad) return;
    const el = elRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [elRef, shouldLoad]);

  useEffect(() => {
    setColor(undefined);
    if (!src || !shouldLoad) return;
    let cancelled = false;
    sampleImageBackground(src).then((result) => {
      if (!cancelled && result) setColor(result);
    });
    return () => {
      cancelled = true;
    };
  }, [src, shouldLoad]);

  return color;
}
