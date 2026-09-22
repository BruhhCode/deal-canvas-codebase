import type { Badge } from "@/data/catalog";
import { cn } from "@/lib/utils";

// Two treatments only: "soft" (tinted bg, the default for anything that
// isn't genuine time pressure) and "solid" (full-fill, reserved for real
// urgency — flash sales, hard deadlines). Don't add a third treatment here.
const styles: Record<string, string> = {
  "HOT DEAL": "bg-clay/12 text-clay border-clay/30", // soft
  EXCLUSIVE: "bg-ink/8 text-ink border-ink/30", // soft — scarcity, not urgency
  "BEST PRICE": "bg-sage/12 text-sage border-sage/30", // soft, trust signal
  "LIMITED TIME": "bg-clay text-clay-foreground border-clay", // solid — genuine urgency
  COUPON: "bg-secondary text-secondary-foreground border-border", // soft
  "FLASH SALE": "bg-clay text-clay-foreground border-clay", // solid — genuine urgency
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
