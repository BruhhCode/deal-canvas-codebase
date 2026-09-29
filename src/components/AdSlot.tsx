import { cn } from "@/lib/utils";

const sizes = {
  leaderboard: "h-24 md:h-[90px]",
  rectangle: "h-64",
  banner: "h-40",
} as const;

/**
 * Placeholder ad unit — reserves a fixed height per `variant` so a real ad
 * script dropped in later can't cause layout shift (CLS), and is always
 * visibly labeled "Advertisement" per standard ad-disclosure convention.
 * Not wired to any ad network; swap the inner content for a real slot/tag
 * when one is chosen.
 */
export function AdSlot({
  variant = "rectangle",
  className,
}: {
  variant?: keyof typeof sizes;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-1", className)}>
      <span className="editorial-eyebrow text-muted-foreground/70">Advertisement</span>
      <div
        className={cn(
          "flex w-full items-center justify-center rounded-lg border border-dashed bg-muted/40 text-sm text-muted-foreground",
          sizes[variant],
        )}
      >
        Ad space
      </div>
    </div>
  );
}
