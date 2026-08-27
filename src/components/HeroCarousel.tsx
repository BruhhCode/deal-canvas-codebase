import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const SLIDES = [
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1920&q=70", // clothing boutique
  "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1920&q=70", // fashion editorial
  "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1920&q=70", // sneakers
  "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1920&q=70", // heels
  "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1920&q=70", // makeup brushes
  "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1920&q=70", // makeup / lipstick
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1920&q=70", // shopping bags
  "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1920&q=70", // clothing
];

const SLIDE_DURATION_MS = 4500;
const FADE_DURATION_MS = 1800;

/** Full-bleed background carousel for the hero section — cycles slides on a timer with a crossfade. */
export function HeroCarousel() {
  const [active, setActive] = useState(0);
  // Bumped only for the slide that's *becoming* active, so its zoom animation
  // remounts (restarts from scale(1)) at the exact moment it's still fully
  // transparent — never while a slide is visible and mid-fade, which is what
  // caused the visible snap.
  const [epoch, setEpoch] = useState(() => SLIDES.map(() => 0));

  useEffect(() => {
    const id = setInterval(() => {
      setActive((i) => {
        const next = (i + 1) % SLIDES.length;
        setEpoch((prev) => prev.map((e, idx) => (idx === next ? e + 1 : e)));
        return next;
      });
    }, SLIDE_DURATION_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {SLIDES.map((src, i) => (
        <img
          key={`${src}-${epoch[i]}`}
          src={src}
          alt=""
          aria-hidden="true"
          loading={i === 0 ? "eager" : "lazy"}
          style={{
            transitionDuration: `${FADE_DURATION_MS}ms`,
            animationDuration: `${SLIDE_DURATION_MS + FADE_DURATION_MS}ms`,
          }}
          className={cn(
            "absolute inset-0 h-full w-full object-cover ease-in-out animate-kenburns",
            i === active ? "opacity-100 transition-opacity" : "opacity-0 transition-opacity",
          )}
        />
      ))}
      <div className="absolute inset-0 bg-ink/55" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-ink/30" />

      <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
        {SLIDES.map((src, i) => (
          <button
            key={src}
            type="button"
            aria-label={`Show slide ${i + 1}`}
            onClick={() => {
              setActive(i);
              setEpoch((prev) => prev.map((e, idx) => (idx === i ? e + 1 : e)));
            }}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === active ? "w-6 bg-background" : "w-1.5 bg-background/50 hover:bg-background/75",
            )}
          />
        ))}
      </div>
    </div>
  );
}
