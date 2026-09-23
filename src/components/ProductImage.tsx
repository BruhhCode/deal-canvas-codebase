import { useState } from "react";
import { cn } from "@/lib/utils";
import { productImg } from "@/lib/img";

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
export function ProductImage({
  src,
  alt,
  className,
  sizes = "(min-width: 1024px) 240px, (min-width: 640px) 33vw, 50vw",
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
}) {
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
      src={productImg(src, 480)}
      srcSet={`${productImg(src, 240)} 240w, ${productImg(src, 480)} 480w`}
      sizes={sizes}
      alt={alt}
      loading="lazy"
      width={900}
      height={900}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
