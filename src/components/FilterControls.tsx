import type { ReactNode } from "react";

/**
 * Shared dropdown + range-slider filter primitives — the one filter UI
 * paradigm used across Shop and Deals listing pages (previously Shop used a
 * pill-button/chip list instead, which had its own internal scrollbar for
 * long option lists like Brand/Store; this reads as one consistent pattern
 * with a native <select> instead).
 */

const selectClass =
  "w-full rounded-sm border bg-card px-3 py-2 text-sm outline-none focus:border-clay";

export function FilterPanel({ children, sticky }: { children: ReactNode; sticky?: boolean }) {
  return (
    <aside className={sticky ? "h-fit space-y-5 rounded-lg border bg-card p-5 lg:sticky lg:top-36" : "space-y-5"}>
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
    <label className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-clay"
      />
      {label}
    </label>
  );
}

/** The "Sort" control shown above a result grid — same casing/treatment everywhere. */
export function SortControl({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="editorial-eyebrow">Sort</span>
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
