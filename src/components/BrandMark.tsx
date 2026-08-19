import { brandName } from "@/data/catalog";
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
  const name = brandName(slug);
  const initials = name
    .replace(/[^A-Za-z ]/g, "")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-sm border bg-cream font-semibold uppercase tracking-wider text-foreground",
        sizes[size],
        className,
      )}
    >
      {initials}
    </span>
  );
}
