import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown, ChevronRight, Heart, LayoutGrid, Menu, Search, X } from "lucide-react";
import { categoriesByDepartment, departments } from "@/data/products";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { ProductSearch } from "./ProductSearch";

type StaticNavItem = { label: string; to: string; search?: Record<string, string> };

// Fallback shown until the live nav loads (or if it fails / the table is
// empty) — keeps the header from ever flashing empty, and matches what
// src/scripts/create-cms-tables.sql seeds into `nav_items` in the admin
// panel repo, so there's no visible difference on a normal page load.
//
// Kept to 6 items on purpose (Categories, the department mega-menu, is the
// 6th "item" — it's rendered separately below, not in this array). "Sale"
// and "Trending" used to be separate entries pointing at /shop?view=sale
// and /shop?view=trending — both routes still work, they're just reachable
// via the Deals page (its own sort options include "Trending", and
// discount filtering covers "Sale") instead of a dedicated top-nav slot.
// Sales Calendar / FAQ / Contact moved to the footer for the same reason —
// real pages, just not core shopping-flow items that need a permanent header
// slot. (The sibling admin-panel repo's `nav_items` table drives the *live*
// nav shown here when it has rows — if it still seeds the old 10-item list,
// it's worth trimming there too for consistency, but that's out of this
// repo's control.)
const defaultNav: StaticNavItem[] = [
  { label: "Shop", to: "/shop", search: { q: "", category: "", department: "", view: "" } },
  { label: "Deals", to: "/deals" },
  { label: "Stores", to: "/stores" },
  { label: "Brands", to: "/brands" },
  { label: "New In", to: "/shop", search: { q: "", category: "", department: "", view: "new" } },
];

type NavRow = { slug: string; label: string; href: string; sort_order: number; visible: boolean };

/**
 * Nav items are admin-editable (see the admin panel's Navigation section),
 * so their `href` is arbitrary free text — it might carry a query string
 * ("/shop?view=new"), point at a not-yet-typed CMS page, or be an external
 * URL. TanStack Router's typed `Link to`/`search` props can't safely accept
 * that, so live items render as plain `<a>` tags (a full navigation instead
 * of a client-side transition) rather than fighting the router's typing for
 * admin-controlled strings — an acceptable trade-off for a handful of
 * top-level nav clicks.
 */
// Builds a plain href for a nav item — static items carry `to` + `search`
// separately (the pre-existing typed-Link shape), live items already have
// the full path (query string included) baked into `to`.
function hrefFor(n: StaticNavItem): string {
  if (!n.search) return n.to;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(n.search)) {
    if (value) params.set(key, value);
  }
  const qs = params.toString();
  return qs ? `${n.to}?${qs}` : n.to;
}

function useLiveNav(): StaticNavItem[] {
  const [items, setItems] = useState<StaticNavItem[]>(defaultNav);

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    supabase
      .from("nav_items")
      .select("slug,label,href,sort_order,visible")
      .order("sort_order")
      .then(({ data, error }) => {
        if (cancelled || error || !data || data.length === 0) return;
        const visible = (data as NavRow[]).filter((n) => n.visible);
        if (visible.length === 0) return;
        setItems(visible.map((n) => ({ label: n.label, to: n.href })));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return items;
}

const deptOrder = ["men", "women", "kids", "lifestyle"] as const;

export function Header() {
  // Computed inside the component (not at module scope) so it never depends on
  // this module's import of `departments` having finished initializing before
  // this file's own top-level code runs — a real production crash on Vercel's
  // build ("Cannot read properties of undefined (reading 'find')") turned out
  // to be exactly this: a different chunk-splitting order than other presets
  // used, evaluating this module before `@/data/products` had assigned
  // `departments` yet.
  const departmentNav = useMemo(
    () =>
      deptOrder
        .map((slug) => departments.find((d) => d.slug === slug))
        .filter((d): d is (typeof departments)[number] => Boolean(d)),
    [],
  );

  const nav = useLiveNav();
  const [open, setOpen] = useState(false);
  const [catMenuOpen, setCatMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [hoveredDept, setHoveredDept] = useState<string>(departmentNav[0]?.slug ?? "");
  const [openDeptMobile, setOpenDeptMobile] = useState<string | null>(null);
  const catMenuRef = useRef<HTMLLIElement>(null);

  // Close the categories mega-menu on outside click or Escape.
  useEffect(() => {
    if (!catMenuOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (catMenuRef.current && !catMenuRef.current.contains(e.target as Node)) setCatMenuOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCatMenuOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [catMenuOpen]);

  // Close the header search bar on Escape.
  useEffect(() => {
    if (!searchOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [searchOpen]);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 md:px-6">
        <button
          type="button"
          className="lg:hidden"
          aria-label="Open menu"
          onClick={() => {
            setOpen((v) => !v);
            setSearchOpen(false);
          }}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <Link to="/" className="font-serif text-xl tracking-tight md:text-2xl">
          Deals<span className="text-clay">Canvas</span>
        </Link>

        <div className="ml-auto flex items-center gap-4">
          <button
            type="button"
            aria-label={searchOpen ? "Close search" : "Search"}
            aria-expanded={searchOpen}
            onClick={() => {
              setSearchOpen((v) => !v);
              setOpen(false);
            }}
            className={cn("hover:text-clay", searchOpen && "text-clay")}
          >
            {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </button>
          <Link to="/account" className="flex items-center gap-2 text-sm font-medium hover:text-clay">
            <Heart className="h-5 w-5" />
            <span className="hidden sm:inline">Wishlist</span>
          </Link>
        </div>
      </div>

      {searchOpen ? (
        <div className="border-t bg-cream">
          <div className="mx-auto max-w-2xl px-4 py-3 md:px-6">
            <ProductSearch size="sm" autoFocus onSubmit={() => setSearchOpen(false)} />
          </div>
        </div>
      ) : null}

      <nav className="hidden border-t lg:block">
        <ul className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em]">
          <li ref={catMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setCatMenuOpen((v) => !v)}
              aria-expanded={catMenuOpen}
              className={cn("flex items-center gap-1.5 hover:text-clay", catMenuOpen && "text-clay")}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Categories
            </button>

            {/* Always rendered (not conditionally mounted) so opening/closing animates via
                opacity/scale/translate instead of an abrupt pop. Two-pane layout: the left
                column only ever lists the 4 sections, and hovering one swaps the right pane
                to its categories — instead of dumping every category for every section on
                screen at once. */}
            <div
              className={cn(
                "absolute left-0 top-full z-50 mt-1 flex h-72 w-[34rem] rounded-sm border bg-card normal-case shadow-lg transition-all duration-150 ease-out",
                catMenuOpen
                  ? "translate-y-0 opacity-100"
                  : "pointer-events-none -translate-y-1 opacity-0",
              )}
            >
              <div className="w-44 shrink-0 border-r p-2">
                {departmentNav.map((d) => (
                  <Link
                    key={d.slug}
                    to="/shop"
                    search={{ q: "", category: "", department: d.slug, view: "", store: "" }}
                    onMouseEnter={() => setHoveredDept(d.slug)}
                    onClick={() => setCatMenuOpen(false)}
                    className={cn(
                      "flex items-center justify-between rounded-sm px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] hover:bg-cream hover:text-clay",
                      hoveredDept === d.slug && "bg-cream text-clay",
                    )}
                  >
                    {d.name}
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                ))}
              </div>
              <div className="flex-1 space-y-1 overflow-y-auto p-3">
                {categoriesByDepartment(hoveredDept).map((c) => (
                  <Link
                    key={c.slug}
                    to="/shop"
                    search={{ q: "", category: c.slug, department: hoveredDept, view: "", store: "" }}
                    onClick={() => setCatMenuOpen(false)}
                    className="block rounded-sm px-3 py-2 text-sm font-normal normal-case tracking-normal text-muted-foreground hover:bg-cream hover:text-clay"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          </li>
          {nav.map((n) => (
            <li key={n.label}>
              {/* Plain <a>, not <Link> — nav items are admin-editable free
                  text (see hrefFor above), so they can't safely go through
                  the router's typed to/search props. */}
              <a href={hrefFor(n)} className="hover:text-clay">
                {n.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {open ? (
        <div className="border-t bg-background lg:hidden">
          <ul className="border-b border-border">
            {departmentNav.map((d) => (
              <li key={d.slug} className="border-t border-border first:border-t-0">
                <button
                  type="button"
                  onClick={() => setOpenDeptMobile((v) => (v === d.slug ? null : d.slug))}
                  aria-expanded={openDeptMobile === d.slug}
                  className="flex w-full items-center justify-between px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em]"
                >
                  {d.name}
                  <ChevronDown
                    className={cn("h-3.5 w-3.5 transition-transform", openDeptMobile === d.slug && "rotate-180")}
                  />
                </button>
                {openDeptMobile === d.slug ? (
                  <div className="bg-cream px-4 pb-3">
                    {categoriesByDepartment(d.slug).map((c) => (
                      <Link
                        key={c.slug}
                        to="/shop"
                        search={{ q: "", category: c.slug, department: d.slug, view: "", store: "" }}
                        onClick={() => {
                          setOpen(false);
                          setOpenDeptMobile(null);
                        }}
                        className="block py-2 text-sm"
                      >
                        {c.name}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
          <ul className="grid grid-cols-2 gap-px bg-border pb-px">
            {nav.map((n, i) => (
              <li
                key={n.label}
                className={cn("bg-background", i === nav.length - 1 && nav.length % 2 !== 0 && "col-span-2")}
              >
                <a
                  href={hrefFor(n)}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em]"
                >
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </header>
  );
}
