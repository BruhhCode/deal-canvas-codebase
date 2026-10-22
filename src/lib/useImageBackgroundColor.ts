import { useEffect, useState } from "react";
import { sampleImageBackground } from "@/lib/sampleImageBackground";

/**
 * Resolves to the sampled background color of a product photo, or undefined
 * while pending/unavailable — callers should treat undefined as "use the
 * default background", not as a loading state to block on.
 */
export function useImageBackgroundColor(src: string | undefined): string | undefined {
  const [color, setColor] = useState<string | undefined>(undefined);

  useEffect(() => {
    setColor(undefined);
    if (!src) return;
    let cancelled = false;
    sampleImageBackground(src).then((result) => {
      if (!cancelled && result) setColor(result);
    });
    return () => {
      cancelled = true;
    };
  }, [src]);

  return color;
}
