import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Heart, Menu, User, X } from "lucide-react";
import { ProductSearch } from "./ProductSearch";

type NavItem = { label: string; to: string; search?: Record<string, string> };

const nav: NavItem[] = [
  { label: "Shop", to: "/shop", search: { q: "", category: "", department: "", view: "" } },
  { label: "Deals", to: "/deals" },
  { label: "Stores", to: "/stores" },
  { label: "Brands", to: "/brands" },
  { label: "New In", to: "/shop", search: { q: "", category: "", department: "", view: "new" } },
  { label: "Sale", to: "/shop", search: { q: "", category: "", department: "", view: "sale" } },
  { label: "Trending", to: "/shop", search: { q: "", category: "", department: "", view: "trending" } },
  { label: "Sales Calendar", to: "/sales-calendar" },
];

const markets = ["IN · ₹ INR", "AE · د.إ AED", "UK · £ GBP", "US · $ USD"];

export function Header() {
  const [open, setOpen] = useState(false);
  const [market, setMarket] = useState(markets[0]);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 md:px-6">
        <button
          type="button"
          className="lg:hidden"
          aria-label="Open menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <Link to="/" className="font-serif text-xl tracking-tight md:text-2xl">
          Deal<span className="text-clay">Canvas</span>
        </Link>

        <div className="ml-auto hidden max-w-md flex-1 md:block">
          <ProductSearch size="sm" />
        </div>

        <div className="ml-auto flex items-center gap-4 md:ml-4">
          <label className="hidden text-xs text-muted-foreground lg:block">
            <span className="sr-only">Country and currency</span>
            <select
              value={market}
              onChange={(e) => setMarket(e.target.value)}
              className="rounded-sm border bg-card px-2 py-1.5 text-xs text-foreground outline-none"
            >
              {markets.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>
          <Link to="/account" aria-label="Saved products" className="hover:text-clay">
            <Heart className="h-5 w-5" />
          </Link>
          <Link to="/account" className="flex items-center gap-2 text-sm font-medium hover:text-clay">
            <User className="h-5 w-5" />
            <span className="hidden sm:inline">Account</span>
          </Link>
        </div>
      </div>

      <nav className="hidden border-t lg:block">
        <ul className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em]">
          {nav.map((n) => (
            <li key={n.label}>
              <Link
                to={n.to as "/"}
                {...(n.search ? { search: n.search as never } : {})}
                activeProps={{ className: "text-clay" }}
                className="hover:text-clay"
              >
                {n.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {open ? (
        <div className="border-t bg-background lg:hidden">
          <div className="p-4">
            <ProductSearch size="sm" />
          </div>
          <ul className="grid grid-cols-2 gap-px bg-border pb-px">
            {nav.map((n) => (
              <li key={n.label} className="bg-background">
                <Link
                  to={n.to as "/"}
                  {...(n.search ? { search: n.search as never } : {})}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em]"
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </header>
  );
}
