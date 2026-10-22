import { useMemo } from "react";
import "./SnowfallEffect.css";

const FLAKE_COUNT = 28;
const FLAKES = ["❄", "❅", "❆"];

type Flake = {
  key: number;
  style: React.CSSProperties;
  glyph: string;
};

// Seeded off `key` so the set is stable across re-renders (not re-randomized
// every time the parent renders) without needing a prop-driven seed — this
// component only ever mounts once, when the Christmas theme is active.
function buildFlakes(): Flake[] {
  return Array.from({ length: FLAKE_COUNT }, (_, i) => {
    const duration = 8 + Math.random() * 10; // 8-18s fall
    const delay = Math.random() * -18; // negative delay = already mid-fall on mount
    const size = 0.6 + Math.random() * 1.2; // 0.6-1.8rem
    const drift = `${(Math.random() - 0.5) * 120}px`;
    return {
      key: i,
      glyph: FLAKES[i % FLAKES.length] ?? "❄",
      style: {
        "--dc-snow-x": `${Math.random() * 100}%`,
        "--dc-snow-size": `${size}rem`,
        "--dc-snow-opacity": 0.35 + Math.random() * 0.5,
        "--dc-snow-duration": `${duration}s`,
        "--dc-snow-delay": `${delay}s`,
        "--dc-snow-drift": drift,
      } as React.CSSProperties,
    };
  });
}

/**
 * Purely decorative, fixed-position overlay — never intercepts clicks
 * (pointer-events: none) and is hidden outright under
 * prefers-reduced-motion (see SnowfallEffect.css). Only ever rendered while
 * the Christmas theme is active (see useActiveTheme() in lib/site-theme.ts),
 * and lazy-loaded from there so no one outside that theme pays for it.
 */
export function SnowfallEffect() {
  const flakes = useMemo(buildFlakes, []);

  return (
    <div className="dc-snowfall" aria-hidden="true">
      {flakes.map((f) => (
        <span key={f.key} className="dc-snowfall__flake" style={f.style}>
          {f.glyph}
        </span>
      ))}
    </div>
  );
}

export default SnowfallEffect;
