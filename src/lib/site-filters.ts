import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export type FilterDisplayStyle = "dropdown" | "chips" | "checkbox-list";
export type FilterOption = { value: string; label: string };

export type FilterOverride = {
  label: string;
  displayStyle: FilterDisplayStyle;
  enabled: boolean;
  sortOrder: number;
  options: FilterOption[] | null;
  minValue: number | null;
  maxValue: number | null;
  stepValue: number | null;
};

type SiteFilterRow = {
  key: string;
  label: string;
  display_style: FilterDisplayStyle | null;
  enabled: boolean;
  sort_order: number;
  options: FilterOption[] | null;
  min_value: number | null;
  max_value: number | null;
  step_value: number | null;
};

/**
 * Per-filter admin overrides for a /shop or /deals filter sidebar (see the
 * admin panel's Filters section, `site_filters` table). Returns `{}` until
 * the client fetch resolves, or if the table is empty/unreachable, so every
 * caller always has its own hardcoded default to fall back to for any key
 * not present here — same "hardcoded default + live override" convention as
 * Header.tsx's useLiveNav for nav_items.
 */
export function useFilterOverrides(section: "shop" | "deals"): Record<string, FilterOverride> {
  const [overrides, setOverrides] = useState<Record<string, FilterOverride>>({});

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    supabase
      .from("site_filters")
      .select("key,label,display_style,enabled,sort_order,options,min_value,max_value,step_value")
      .eq("section", section)
      .then(({ data, error }) => {
        if (cancelled || error || !data) return;
        const map: Record<string, FilterOverride> = {};
        for (const row of data as SiteFilterRow[]) {
          map[row.key] = {
            label: row.label,
            displayStyle: row.display_style ?? "dropdown",
            enabled: row.enabled,
            sortOrder: row.sort_order,
            options: row.options,
            minValue: row.min_value,
            maxValue: row.max_value,
            stepValue: row.step_value,
          };
        }
        setOverrides(map);
      });
    return () => {
      cancelled = true;
    };
  }, [section]);

  return overrides;
}
