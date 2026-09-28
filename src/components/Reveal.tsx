import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Fades + lifts its children in once they scroll into view — transform/
 * opacity only (never width/height, so it can't trigger layout thrash) and
 * fires once via IntersectionObserver, not on every scroll in/out. Content
 * already in the viewport on mount (e.g. above the fold on a short page)
 * reveals immediately, since IntersectionObserver invokes its callback for
 * an already-intersecting target as soon as observation starts.
 *
 * Reduced-motion is handled globally (see the prefers-reduced-motion block
 * in styles.css, which collapses transition-duration to ~0 sitewide) — this
 * component doesn't need its own reduced-motion branch.
 */
export function Reveal({
  children,
  className,
  delayMs = 0,
}: {
  children: ReactNode;
  className?: string;
  delayMs?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={delayMs ? { transitionDelay: `${delayMs}ms` } : undefined}
      className={cn(
        "transition-[opacity,transform] duration-500 ease-out",
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
        className,
      )}
    >
      {children}
    </div>
  );
}
