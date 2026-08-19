import type { Badge } from "@/data/catalog";
import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  "HOT DEAL": "bg-clay/12 text-clay border-clay/30",
  EXCLUSIVE: "bg-ink text-background border-ink",
  "BEST PRICE": "bg-secondary text-secondary-foreground border-border",
  "LIMITED TIME": "bg-clay/12 text-clay border-clay/30",
  COUPON: "bg-secondary text-secondary-foreground border-border",
  "FLASH SALE": "bg-clay text-clay-foreground border-clay",
  "EDITOR'S PICK": "bg-transparent text-foreground border-foreground/40",
  SPONSORED: "bg-transparent text-muted-foreground border-dashed border-border",
};

export function DealBadge({ badge, className }: { badge: Badge | string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]",
        styles[badge] ?? "bg-secondary text-secondary-foreground border-border",
        className,
      )}
    >
      {badge}
    </span>
  );
}
