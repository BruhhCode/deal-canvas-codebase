import { useState } from "react";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

/** Renders a product photo, or a neutral placeholder when there isn't a genuine one. */
export function ProductImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className={cn("flex items-center justify-center bg-cream text-muted-foreground/50", className)}>
        <ImageOff className="h-8 w-8" />
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
