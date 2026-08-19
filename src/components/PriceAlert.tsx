import { useState } from "react";
import { toast } from "sonner";
import { useCurrency } from "@/lib/currency";

const KEY = "dc_price_alerts";

export function PriceAlert({ productId, currentPrice }: { productId: string; currentPrice: number }) {
  const { format, convert, toBase, symbol } = useCurrency();
  const suggested = Math.round(convert(currentPrice) * 0.85);
  const [target, setTarget] = useState(String(suggested));

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(target);
    if (!value || value <= 0) return;
    const baseValue = Math.round(toBase(value));
    try {
      const all = JSON.parse(window.localStorage.getItem(KEY) ?? "{}") as Record<string, number>;
      all[productId] = baseValue;
      window.localStorage.setItem(KEY, JSON.stringify(all));
    } catch {
      /* ignore */
    }
    toast.success(`Price alert set at ${format(baseValue)}`, {
      description: "We'll email you when any store drops below your target.",
    });
  };

  return (
    <form onSubmit={save} className="rounded-lg border bg-cream p-5">
      <p className="editorial-eyebrow">Want it cheaper?</p>
      <p className="mt-2 text-sm text-muted-foreground">
        Current best price {format(currentPrice)}. Tell us your target and we'll watch every store for you.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <label className="sr-only" htmlFor={`alert-${productId}`}>
          Target price
        </label>
        <div className="flex flex-1 items-center gap-1 rounded-sm border bg-card px-3 py-2">
          <span className="text-sm text-muted-foreground">{symbol}</span>
          <input
            id={`alert-${productId}`}
            inputMode="numeric"
            value={target}
            onChange={(e) => setTarget(e.target.value.replace(/[^0-9]/g, ""))}
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
        <button
          type="submit"
          className="rounded-sm bg-primary px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-clay hover:text-clay-foreground"
        >
          Set price alert
        </button>
      </div>
    </form>
  );
}
