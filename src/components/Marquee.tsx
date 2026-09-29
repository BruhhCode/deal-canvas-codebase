import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Infinite horizontal auto-scroll: renders `items` twice back-to-back and
 * animates the track from 0 to -50%, looping seamlessly forever. Spacing
 * comes from a uniform trailing margin on every item (not a flex `gap`) —
 * `gap` on the outer track would add one extra gap's worth of width that
 * isn't mirrored inside each half, so -50% lands half a gap short of the
 * real loop point and the seam visibly jumps. A flat, evenly-spaced list
 * of 2n items has no such asymmetry.
 *
 * The second half of items is marked `inert` per item — not just visually
 * hidden — so those duplicate product links never enter the tab order or
 * the accessibility tree. `aria-hidden` alone on a region containing
 * focusable links is itself an accessibility violation; `inert` is the
 * attribute built for exactly this "visible duplicate, not interactive"
 * case.
 *
 * Pauses on hover/focus (so a shopper can actually read/click a card
 * instead of it sliding away) and stops outright under
 * prefers-reduced-motion (ambient auto-playing motion — same treatment as
 * the hero carousel's Ken Burns zoom, see styles.css).
 */
export function Marquee<T>({
  items,
  keyFor,
  renderItem,
  durationSeconds,
  itemClassName,
  className,
}: {
  items: T[];
  keyFor: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  durationSeconds: number;
  itemClassName?: string;
  className?: string;
}) {
  return (
    <div className={cn("overflow-hidden", className)}>
      <div
        className="animate-marquee flex w-max hover:[animation-play-state:paused] focus-within:[animation-play-state:paused]"
        style={{ animationDuration: `${durationSeconds}s` }}
      >
        {items.map((item) => (
          <div key={`a-${keyFor(item)}`} className={cn("mr-5 shrink-0", itemClassName)}>
            {renderItem(item)}
          </div>
        ))}
        {items.map((item) => (
          <div key={`b-${keyFor(item)}`} className={cn("mr-5 shrink-0", itemClassName)} inert={true}>
            {renderItem(item)}
          </div>
        ))}
      </div>
    </div>
  );
}
