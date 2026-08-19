import { cn } from "@/lib/utils";
import { getStore } from "@/data/stores";

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
  const store = getStore(slug);
  const name = store?.name ?? slug;
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-sm border bg-cream font-semibold tracking-tight text-foreground",
        size === "sm" && "h-6 w-6 text-[10px]",
        size === "md" && "h-9 w-9 text-xs",
        size === "lg" && "h-14 w-14 text-sm",
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
