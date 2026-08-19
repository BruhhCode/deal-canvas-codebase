import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CurrencyCode = "USD" | "EUR" | "GBP" | "AED";

interface CurrencyMeta {
  code: CurrencyCode;
  label: string;
  symbol: string;
  locale: string;
  /** conversion rate from the catalog's stored base amount to this currency */
  rate: number;
}

/** Catalog prices are stored in a legacy base unit; this is its value in USD. */
const BASE_TO_USD = 1 / 83;

export const currencies: CurrencyMeta[] = [
  { code: "USD", label: "US · $ USD", symbol: "$", locale: "en-US", rate: BASE_TO_USD },
  { code: "EUR", label: "EU · € EUR", symbol: "€", locale: "de-DE", rate: BASE_TO_USD * 0.92 },
  { code: "GBP", label: "UK · £ GBP", symbol: "£", locale: "en-GB", rate: BASE_TO_USD * 0.79 },
  { code: "AED", label: "AE · د.إ AED", symbol: "د.إ", locale: "en-AE", rate: BASE_TO_USD * 3.6725 },
];

const currencyByCode = new Map(currencies.map((c) => [c.code, c]));

/** Non-hook USD conversion for use outside React (route `head()` loaders, JSON-LD, etc). */
export const toUsd = (amount: number) => amount * BASE_TO_USD;

/** Non-hook USD formatting for use outside React (route `head()` loaders, JSON-LD, etc). */
export const formatUsd = (amount: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
    toUsd(amount),
  );

const STORAGE_KEY = "dealcanvas-currency";

interface CurrencyContextValue {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  /** the active currency's symbol, e.g. "$" */
  symbol: string;
  /** converts a stored catalog price into the selected currency */
  convert: (amount: number) => number;
  /** converts an amount in the selected currency back into the catalog's stored base amount */
  toBase: (amount: number) => number;
  /** converts and formats a stored catalog price as a localized currency string */
  format: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>("USD");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && currencyByCode.has(stored as CurrencyCode)) {
      setCurrencyState(stored as CurrencyCode);
    }
  }, []);

  const setCurrency = (code: CurrencyCode) => {
    setCurrencyState(code);
    window.localStorage.setItem(STORAGE_KEY, code);
  };

  const value = useMemo<CurrencyContextValue>(() => {
    const meta = currencyByCode.get(currency)!;
    const convert = (amount: number) => amount * meta.rate;
    const toBase = (amount: number) => amount / meta.rate;
    const format = (amount: number) =>
      new Intl.NumberFormat(meta.locale, {
        style: "currency",
        currency: meta.code,
        maximumFractionDigits: 0,
      }).format(convert(amount));
    return { currency, setCurrency, symbol: meta.symbol, convert, toBase, format };
  }, [currency]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within a CurrencyProvider");
  return ctx;
}
