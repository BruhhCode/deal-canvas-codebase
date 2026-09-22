import { useState } from "react";
import { cn } from "@/lib/utils";

/** First letter of up to the first two words — same monogram convention as BrandMark. */
function initialsOf(text: string): string {
  return text
    .replace(/[^A-Za-z ]/g, "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

/** Renders a product photo, or a branded monogram placeholder when there isn't a genuine one. */
export function ProductImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-sand to-cream",
          className,
        )}
      >
        <span className="font-serif text-3xl text-foreground/25" aria-hidden="true">
          {initialsOf(alt) || "DC"}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      width={900}
      height={900}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
