import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { productImg } from "@/lib/img";

/**
 * A single gallery <img> with a broken-image fallback. Checks
 * complete/naturalWidth once after mount in addition to onError — an SSR'd
 * <img> starts loading as soon as the browser parses the HTML, often before
 * React finishes hydrating and attaches onError, so a fast failure (e.g. a
 * host erroring at the protocol level) can be missed by onError alone and
 * leave a permanently broken image in the DOM. Same fix as ProductImage.tsx.
 */
function GalleryImg({
  src,
  width,
  srcSetWidths,
  sizes,
  alt,
  className,
  loading,
}: {
  src: string;
  width: number;
  srcSetWidths?: number[];
  sizes?: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
}) {
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const el = imgRef.current;
    if (el && el.complete && el.naturalWidth === 0) setFailed(true);
  }, [src]);

  if (failed) {
    return (
      <div className={cn("flex items-center justify-center bg-cream text-muted-foreground/50", className)}>
        <ImageOff className="h-6 w-6" />
      </div>
    );
  }

  return (
    <img
      ref={imgRef}
      src={productImg(src, width)}
      srcSet={srcSetWidths ? srcSetWidths.map((w) => `${productImg(src, w)} ${w}w`).join(", ") : undefined}
      sizes={sizes}
      alt={alt}
      loading={loading}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}

export function ProductGallery({
  images: rawImages,
  alt,
  badge,
}: {
  images: string[];
  alt: string;
  badge?: React.ReactNode;
}) {
  const images = rawImages.filter(Boolean);
  const [active, setActive] = useState(0);
  const current = Math.min(active, images.length - 1);

  const go = (delta: number) => setActive((i) => (i + delta + images.length) % images.length);

  if (!images.length) {
    return (
      <div className="relative flex aspect-square items-center justify-center rounded-lg bg-cream text-muted-foreground/50">
        <ImageOff className="h-10 w-10" />
        {badge}
      </div>
    );
  }

  return (
    // items-start: without it, flex's default "stretch" cross-axis alignment forces the
    // main image's container to match the thumbnail column's height whenever there are
    // enough thumbnails to be taller than the (fixed, square) main image — leaving empty
    // space below the actual photo. Products with 5+ images (the thumbnail rail
    // outgrowing a square hero image) reproduced this; fewer images never did.
    <div className="flex items-start gap-3">
      {images.length > 1 ? (
        <div className="hidden w-16 shrink-0 flex-col gap-3 overflow-y-auto sm:flex md:w-20">
          {images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              aria-current={i === current}
              className={cn(
                "shrink-0 overflow-hidden rounded-sm border bg-cream transition-colors",
                i === current ? "border-foreground" : "border-transparent hover:border-border",
              )}
            >
              <GalleryImg src={src} width={160} alt="" loading="lazy" className="aspect-square w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}

      <div className="relative flex-1 overflow-hidden rounded-lg bg-cream">
        <GalleryImg
          key={current}
          src={images[current]!}
          width={960}
          srcSetWidths={[640, 960, 1280]}
          sizes="(min-width: 1024px) 50vw, 100vw"
          alt={alt}
          className="aspect-square w-full object-cover"
        />
        {badge}

        {images.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 shadow-sm transition-colors hover:bg-background"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next image"
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 shadow-sm transition-colors hover:bg-background"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 sm:hidden">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={cn("h-1.5 w-1.5 rounded-full", i === current ? "bg-foreground" : "bg-foreground/30")}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
