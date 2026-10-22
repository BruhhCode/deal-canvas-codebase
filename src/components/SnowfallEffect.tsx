import { useMemo } from "react";
import "./SnowfallEffect.css";

const PARTICLE_COUNT = 26;
// Roughly 1 in 7 particles is a falling gift instead of a snowflake.
const GIFT_EVERY = 7;

type Particle = {
  key: number;
  kind: "flake" | "gift";
  style: React.CSSProperties;
};

// Built once per mount (this component only ever mounts while the
// Christmas theme is active) rather than re-randomized on every render.
function buildParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => {
    const isGift = i % GIFT_EVERY === GIFT_EVERY - 1;
    const duration = (isGift ? 11 : 8) + Math.random() * 10; // gifts fall a little slower
    const delay = Math.random() * -18; // negative = already mid-fall on mount
    const size = isGift ? 1.1 + Math.random() * 0.6 : 0.5 + Math.random() * 0.9; // rem
    const drift = `${(Math.random() - 0.5) * 120}px`;
    return {
      key: i,
      kind: isGift ? "gift" : "flake",
      style: {
        "--dc-snow-x": `${Math.random() * 100}%`,
        "--dc-snow-size": `${size}rem`,
        "--dc-snow-opacity": isGift ? 0.85 : 0.5 + Math.random() * 0.4,
        "--dc-snow-duration": `${duration}s`,
        "--dc-snow-delay": `${delay}s`,
        "--dc-snow-drift": drift,
      } as React.CSSProperties,
    };
  });
}

// Static gifts resting on the snow ground — fixed x-positions (not
// randomized) so they sit in the same deliberate spots every load.
const GROUND_GIFTS = [
  { left: "8%", rotate: "-8deg" },
  { left: "47%", rotate: "6deg" },
  { left: "88%", rotate: "-4deg" },
];

/**
 * Purely decorative Christmas overlay: falling snow + falling gifts, plus a
 * static "snow lying on the ground" strip along the bottom of the viewport
 * with a couple of gifts resting on it. Never intercepts clicks
 * (pointer-events: none throughout) and the falling layer is hidden outright
 * under prefers-reduced-motion (the static ground stays, since it doesn't
 * animate). Only ever rendered while the Christmas theme is active (see
 * useActiveTheme() in lib/site-theme.ts), and lazy-loaded from there so no
 * one outside that theme pays for it.
 */
export function SnowfallEffect() {
  const particles = useMemo(buildParticles, []);

  return (
    <>
      <div className="dc-snowfall" aria-hidden="true">
        {particles.map((p) =>
          p.kind === "gift" ? (
            <span key={p.key} className="dc-snowfall__gift" style={p.style}>
              🎁
            </span>
          ) : (
            <span key={p.key} className="dc-snowfall__flake" style={p.style} />
          ),
        )}
      </div>

      <div className="dc-snowground" aria-hidden="true" />
      <div className="dc-snowground__corner dc-snowground__corner--left" aria-hidden="true" />
      <div className="dc-snowground__corner dc-snowground__corner--right" aria-hidden="true" />
      {GROUND_GIFTS.map((g, i) => (
        <span
          key={i}
          className="dc-snowground__gift"
          aria-hidden="true"
          style={{ left: g.left, transform: `rotate(${g.rotate})` }}
        >
          🎁
        </span>
      ))}
    </>
  );
}

export default SnowfallEffect;
