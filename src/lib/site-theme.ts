import { useEffect, useState } from "react";
import { supabase } from "./supabase";

// Keep in sync with the admin panel's types/catalog.ts SITE_THEMES — a
// closed set of code-built themes, not an admin-authored custom-color
// system. The theme's actual palette/effect/copy all live in this repo
// (styles.css's [data-theme="..."] blocks, SnowfallEffect.tsx, the
// homepage's festive copy below); the site_theme table only stores which
// one is selected.
export type ThemeKey = "default" | "christmas";

type SiteThemeRow = { active_theme: ThemeKey };

/**
 * Which theme is live right now. Starts at "default" (so SSR and the first
 * paint never show festive decoration before it's confirmed on), then
 * switches client-side once the one-row site_theme table resolves — same
 * "hardcoded default + live override" convention as useLiveNav/
 * useFilterOverrides. Falls back to "default" if the table is empty,
 * unreachable, or returns an unrecognized key.
 */
export function useActiveTheme(): ThemeKey {
  const [theme, setTheme] = useState<ThemeKey>("default");

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    supabase
      .from("site_theme")
      .select("active_theme")
      .eq("id", "singleton")
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled || error || !data) return;
        const row = data as SiteThemeRow;
        if (row.active_theme === "default" || row.active_theme === "christmas") {
          setTheme(row.active_theme);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return theme;
}
