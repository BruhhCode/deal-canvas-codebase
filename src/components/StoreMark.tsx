import { useState } from "react";
import { cn } from "@/lib/utils";
import { getStore, storeLogo, storeLogoFallback } from "@/data/stores";

const initials = (name: string) =>
  name
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

export function StoreMark({
  slug,
  size = "sm",
  className,
}: {
  slug: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const [stage, setStage] = useState<"primary" | "fallback" | "failed">("primary");
  const store = getStore(slug);
  const name = store?.name ?? slug;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-sm bg-white font-semibold tracking-tight text-foreground",
        size === "sm" && "h-6 w-6 text-[10px]",
        size === "md" && "h-9 w-9 text-xs",
        size === "lg" && "h-14 w-14 text-sm",
        className,
      )}
    >
      {stage === "failed" ? (
        <span aria-hidden>{initials(name)}</span>
      ) : (
        <img
          key={stage}
          src={stage === "primary" ? storeLogo(slug) : storeLogoFallback(slug)}
          alt={`${name} logo`}
          className="h-full w-full object-contain"
          loading="lazy"
          onError={() => setStage((s) => (s === "primary" ? "fallback" : "failed"))}
        />
      )}
    </span>
  );
}
