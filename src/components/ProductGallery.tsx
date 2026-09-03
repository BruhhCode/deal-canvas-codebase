import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProductGallery({
  images,
  alt,
  badge,
}: {
  images: string[];
  alt: string;
  badge?: React.ReactNode;
}) {
  const [active, setActive] = useState(0);
  const current = Math.min(active, images.length - 1);

  const go = (delta: number) => setActive((i) => (i + delta + images.length) % images.length);

  return (
    <div className="flex gap-3">
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
              <img src={src} alt="" className="aspect-square w-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      ) : null}

      <div className="relative flex-1 overflow-hidden rounded-lg bg-cream">
        <img
          key={current}
          src={images[current]}
          alt={alt}
          width={900}
          height={900}
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
