import { useMemo } from "react";
import "./HalloweenEffect.css";

const PARTICLE_COUNT = 20;
// Roughly 1 in 6 particles is a spider instead of a bat.
const SPIDER_EVERY = 6;

type Particle = {
  key: number;
  glyph: string;
  style: React.CSSProperties;
};

// Built once per mount (this component only ever mounts while the
// Halloween theme is active) rather than re-randomized on every render.
function buildParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => {
    const isSpider = i % SPIDER_EVERY === SPIDER_EVERY - 1;
    const duration = (isSpider ? 13 : 9) + Math.random() * 9;
    const delay = Math.random() * -20; // negative = already mid-fall on mount
    const size = isSpider ? 1.1 + Math.random() * 0.5 : 1 + Math.random() * 0.8; // rem
    const drift = `${(Math.random() - 0.5) * 140}px`;
    return {
      key: i,
      glyph: isSpider ? "🕷️" : "🦇",
      style: {
        "--dc-hw-x": `${Math.random() * 100}%`,
        "--dc-hw-size": `${size}rem`,
        "--dc-hw-opacity": 0.55 + Math.random() * 0.35,
        "--dc-hw-duration": `${duration}s`,
        "--dc-hw-delay": `${delay}s`,
        "--dc-hw-drift": drift,
      } as React.CSSProperties,
    };
  });
}

// Static jack-o-lanterns resting on the ground — fixed x-positions (not
// randomized) so they sit in the same deliberate spots every load.
const GROUND_PUMPKINS = [
  { left: "12%", rotate: "-6deg" },
  { left: "50%", rotate: "5deg" },
  { left: "84%", rotate: "-3deg" },
];

/**
 * Purely decorative Halloween overlay: falling bats/spiders, cobwebs pinned
 * in the top corners, a low ground mist, and jack-o-lanterns resting along
 * the bottom. Never intercepts clicks (pointer-events: none throughout) and
 * the falling layer is hidden outright under prefers-reduced-motion (the
 * static decoration stays, since it doesn't animate). Only ever rendered
 * while the Halloween theme is active (see useActiveTheme() in
 * lib/site-theme.ts), and lazy-loaded from there so no one outside that
 * theme pays for it.
 */
export function HalloweenEffect() {
  const particles = useMemo(buildParticles, []);

  return (
    <>
      <div className="dc-halloween" aria-hidden="true">
        {particles.map((p) => (
          <span key={p.key} className="dc-halloween__particle" style={p.style}>
            {p.glyph}
          </span>
        ))}
      </div>

      <span className="dc-halloween__web dc-halloween__web--left" aria-hidden="true">
        🕸️
      </span>
      <span className="dc-halloween__web dc-halloween__web--right" aria-hidden="true">
        🕸️
      </span>

      <div className="dc-halloween-fog" aria-hidden="true" />
      {GROUND_PUMPKINS.map((p, i) => (
        <span
          key={i}
          className="dc-halloween-ground__pumpkin"
          aria-hidden="true"
          style={{ left: p.left, transform: `rotate(${p.rotate})` }}
        >
          🎃
        </span>
      ))}
    </>
  );
}

export default HalloweenEffect;
