import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// Default/fallback slides, used when the admin panel's `banners` table
// (placement='hero') is empty or unreachable — see src/routes/index.tsx's
// loader. Keeping these here (rather than deleting them) means the hero
// never goes blank if the DB has nothing in it yet.
export const SLIDES = [
  "https://images.unsplash.com/photo-1621261027519-a71ac66d5a68?auto=format&fit=crop&w=1920&q=70", // bright minimalist boutique
  "https://images.unsplash.com/photo-1606143412458-acc5f86de897?auto=format&fit=crop&w=1920&q=70", // fashion editorial, black & white portrait
  "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1920&q=70", // boutique clothing rack under hanging lights
  "https://images.unsplash.com/photo-1629511565591-a1d494ad6c58?auto=format&fit=crop&w=1920&q=70", // fashion editorial, bold color portrait
  "https://images.unsplash.com/photo-1555529771-122e5d9f2341?auto=format&fit=crop&w=1920&q=70", // boutique interior, exposed brick
  "https://images.unsplash.com/photo-1630905119003-329447458f85?auto=format&fit=crop&w=1920&q=70", // bright boutique corridor
  "https://images.unsplash.com/photo-1561715276-a2d087060f1d?auto=format&fit=crop&w=1920&q=70", // shopping bag
  "https://images.unsplash.com/photo-1595991209266-5ff5a3a2f008?auto=format&fit=crop&w=1920&q=70", // eclectic boutique interior
];

const SLIDE_DURATION_MS = 4500;
const FADE_DURATION_MS = 1800;

/**
 * Builds a `srcset` at 800/1280/1920w from a base Unsplash URL (already
 * `w=1920&q=70`) by rewriting its `w` query param. Only Unsplash's own CDN
 * supports this on-the-fly resizing — an admin-uploaded image from any other
 * host has no such contract, so this returns `undefined` for anything that
 * isn't an `images.unsplash.com` URL and the caller falls back to a plain,
 * un-resized `<img src>`.
 */
export function heroSrcSet(url: string): string | undefined {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return undefined;
  }
  if (parsed.hostname !== "images.unsplash.com") return undefined;
  return [800, 1280, 1920]
    .map((w) => {
      const u = new URL(url);
      u.searchParams.set("w", String(w));
      return `${u.toString()} ${w}w`;
    })
    .join(", ");
}

export type HeroSlide = {
  imageUrl: string;
  alt: string;
};

/** Full-bleed background carousel for the hero section — cycles slides on a timer with a crossfade. */
export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [active, setActive] = useState(0);
  // Bumped only for the slide that's *becoming* active, so its zoom animation
  // remounts (restarts from scale(1)) at the exact moment it's still fully
  // transparent — never while a slide is visible and mid-fade, which is what
  // caused the visible snap.
  const [epoch, setEpoch] = useState(() => slides.map(() => 0));
  // Slide 0 renders fully opaque with no transition on first paint (so it's
  // the LCP element with zero render delay). Fade/crossfade behavior for
  // every slide, including slide 0's eventual fade-out, only turns on once
  // the browser has painted that first frame.
  const [fadeEnabled, setFadeEnabled] = useState(false);
  const everShown = useRef(new Set<number>([0]));
  everShown.current.add(active);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setFadeEnabled(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    // Respect prefers-reduced-motion: leave the first slide showing statically
    // instead of auto-advancing every SLIDE_DURATION_MS (the CSS-level reduced-
    // motion override alone would just turn each advance into an abrupt flash
    // rather than a crossfade, which is worse, not better).
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      setActive((i) => {
        const next = (i + 1) % slides.length;
        everShown.current.add(next);
        setEpoch((prev) => prev.map((e, idx) => (idx === next ? e + 1 : e)));
        return next;
      });
    }, SLIDE_DURATION_MS);
    return () => clearInterval(id);
  }, [slides.length]);

  const nextSlide = (active + 1) % slides.length;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {slides.map((slide, i) => {
        // Only the current slide, the next one in rotation, and any slide the
        // user has actually reached are mounted — the other 5 never hit the
        // network on first load.
        if (i !== active && i !== nextSlide && !everShown.current.has(i)) return null;
        const isFirstPaint = i === 0 && !fadeEnabled;
        const srcSet = heroSrcSet(slide.imageUrl);
        return (
          <img
            key={`${slide.imageUrl}-${epoch[i]}`}
            src={slide.imageUrl}
            srcSet={srcSet}
            sizes={srcSet ? "100vw" : undefined}
            alt={slide.alt}
            aria-hidden={slide.alt ? undefined : "true"}
            loading={i === 0 ? "eager" : "lazy"}
            fetchPriority={i === 0 ? "high" : "low"}
            decoding="async"
            style={{
              transitionDuration: `${FADE_DURATION_MS}ms`,
              animationDuration: `${SLIDE_DURATION_MS + FADE_DURATION_MS}ms`,
            }}
            className={cn(
              "absolute inset-0 h-full w-full object-cover ease-in-out animate-kenburns",
              i === active ? "opacity-100" : "opacity-0",
              !isFirstPaint && "transition-opacity",
            )}
          />
        );
      })}
      <div className="absolute inset-0 bg-ink/55" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-ink/30" />

      <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
        {slides.map((slide, i) => (
          <button
            key={slide.imageUrl}
            type="button"
            aria-label={`Show slide ${i + 1}`}
            onClick={() => {
              setActive(i);
              everShown.current.add(i);
              setEpoch((prev) => prev.map((e, idx) => (idx === i ? e + 1 : e)));
            }}
            className="group flex min-h-11 min-w-11 items-center justify-center"
          >
            {/* Fixed-width track; only `transform: scaleX()` animates (compositor-only), width never does.
                The button's own box is padded out to a full 44px touch target — this span is just the
                visible bar, sized independently of it. */}
            <span
              className={cn(
                "h-1.5 w-6 origin-left rounded-full transition-transform duration-300",
                i === active
                  ? "scale-x-100 bg-background"
                  : "scale-x-[0.25] bg-background/50 group-hover:bg-background/75",
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
