import { useState } from "react";
import { brandLogo, brandLogoFallback, brandName } from "@/data/catalog";
import { cn } from "@/lib/utils";

const sizes = {
  sm: "h-7 w-7 text-[10px]",
  md: "h-11 w-11 text-sm",
  lg: "h-16 w-16 text-lg",
};

export function BrandMark({
  slug,
  size = "md",
  className,
}: {
  slug: string;
  size?: keyof typeof sizes;
  className?: string;
}) {
  const [stage, setStage] = useState<"primary" | "fallback" | "failed">("primary");
  const name = brandName(slug);
  const initials = name
    .replace(/[^A-Za-z ]/g, "")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-sm bg-white font-semibold uppercase tracking-wider text-foreground",
        sizes[size],
        className,
      )}
    >
      {stage === "failed" ? (
        <span aria-hidden="true">{initials}</span>
      ) : (
        <img
          key={stage}
          src={stage === "primary" ? brandLogo(slug) : brandLogoFallback(slug)}
          alt={`${name} logo`}
          className="h-full w-full object-contain"
          loading="lazy"
          onError={() => setStage((s) => (s === "primary" ? "fallback" : "failed"))}
        />
      )}
    </span>
  );
}
