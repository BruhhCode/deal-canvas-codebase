import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { FilterDisplayStyle } from "@/lib/site-filters";

/**
 * Shared dropdown + range-slider filter primitives — the one filter UI
 * paradigm used across Shop and Deals listing pages (previously Shop used a
 * pill-button/chip list instead, which had its own internal scrollbar for
 * long option lists like Brand/Store; this reads as one consistent pattern
 * with a native <select> instead).
 *
 * `FilterChips`/`FilterCheckboxList` below are alternate renderers for the
 * same select-like "one value out of a list" shape as `FilterSelect` — which
 * one a given filter uses is chosen per-filter from the admin panel's
 * Filters section (`site_filters.display_style`), not hardcoded here.
 */

const selectClass = "w-full rounded-sm border bg-card px-3 py-3 text-sm outline-none focus:border-clay";

export function FilterPanel({ children, sticky }: { children: ReactNode; sticky?: boolean }) {
  return (
    <aside
      className={
        sticky
          ? "h-fit space-y-5 overflow-y-auto rounded-lg border bg-card p-5 lg:sticky lg:top-36 lg:max-h-[calc(100vh-9rem-2rem)]"
          : "space-y-5"
      }
    >
      {children}
    </aside>
  );
}

export function FilterSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabledHint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  disabledHint?: string;
}) {
  if (disabledHint && !options.length) {
    return (
      <label className="block space-y-1.5 text-sm">
        <span className="font-medium">{label}</span>
        <p className="text-xs text-muted-foreground">{disabledHint}</p>
      </label>
    );
  }
  return (
    <label className="block space-y-1.5 text-sm">
      <span className="font-medium">{label}</span>
      <select className={selectClass} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

const chipClass = (active: boolean) =>
  cn(
    "min-h-11 rounded-full border px-3.5 text-xs font-medium transition-colors",
    active ? "border-foreground bg-foreground text-background" : "hover:border-clay hover:text-clay",
  );

/** Chip-button variant of `FilterSelect`/`SortControl` — single-select, same value/onChange shape. */
export function FilterChips({
  label,
  value,
  onChange,
  options,
  placeholder,
  clearable = true,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  /** false for a "Sort"-style control that always has a value and no "All" chip. */
  clearable?: boolean;
}) {
  return (
    <div className="space-y-1.5 text-sm">
      {label ? <span className="font-medium">{label}</span> : null}
      <div className="flex flex-wrap gap-2">
        {clearable ? (
          <button type="button" onClick={() => onChange("")} className={chipClass(value === "")}>
            {placeholder ?? "All"}
          </button>
        ) : null}
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={chipClass(value === o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Checkbox-list (radio-behavior) variant of `FilterSelect`/`SortControl` — same value/onChange shape. */
export function FilterCheckboxList({
  label,
  value,
  onChange,
  options,
  placeholder,
  clearable = true,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  clearable?: boolean;
}) {
  return (
    <div className="space-y-1.5 text-sm">
      {label ? <span className="font-medium">{label}</span> : null}
      <div className="max-h-48 space-y-1.5 overflow-y-auto pr-1">
        {clearable ? (
          <label className="flex min-h-11 items-center gap-2">
            <input type="radio" checked={value === ""} onChange={() => onChange("")} className="accent-clay" />
            {placeholder ?? "All"}
          </label>
        ) : null}
        {options.map((o) => (
          <label key={o.value} className="flex min-h-11 items-center gap-2">
            <input
              type="radio"
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              className="accent-clay"
            />
            {o.label}
          </label>
        ))}
      </div>
    </div>
  );
}

export function FilterRange({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block space-y-1.5 text-sm">
      <span className="font-medium">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-clay"
      />
    </label>
  );
}

export function FilterCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex min-h-11 items-center gap-2 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="accent-clay" />
      {label}
    </label>
  );
}

/** The "Sort" control shown above a result grid — same casing/treatment everywhere. */
export function SortControl({
  value,
  onChange,
  options,
  label = "Sort",
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  label?: string;
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="editorial-eyebrow">{label}</span>
      <select className={selectClass} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/**
 * Picks the select-like renderer for a given `display_style` (admin-chosen
 * per filter, see `site_filters.display_style`) — shared by shop.tsx and
 * deals.tsx so both pages' filters support the same three styles.
 */
export function renderSelectLike(
  displayStyle: FilterDisplayStyle,
  props: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: { value: string; label: string }[];
    placeholder: string;
  },
) {
  if (displayStyle === "chips") return <FilterChips {...props} />;
  if (displayStyle === "checkbox-list") return <FilterCheckboxList {...props} />;
  return <FilterSelect {...props} />;
}
