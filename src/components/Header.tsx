import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown, ChevronRight, Heart, LayoutGrid, Menu, X } from "lucide-react";
import { brandName } from "@/data/catalog";
import { products, shopCategories } from "@/data/products";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useCatalogVersion } from "@/lib/live-catalog";
import { useWishlist } from "./WishlistButton";

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

// The mega-menu used to group by department (Women/Men/Kids/Lifestyle) and
// list generic category names underneath. What shoppers actually want to
// browse by here is product type (Shoes, Clothing, Bags, ...) and then which
// brands carry that type — so categories are grouped by their shared display
// name (collapsing the department-specific slugs, e.g. "shoes"/"mens-shoes"/
// "kids-shoes" all become one "Shoes" entry) instead of by department.
type CategoryGroup = { name: string; slugs: string[] };

// Computed inside the component (not at module scope) for the same reason
// `departmentNav` used to be: this depends on this module's import of
// `shopCategories` from `@/data/products` having finished initializing
// before this file's own top-level code runs, which isn't guaranteed —
// a different chunk-splitting order on Vercel already crashed production
// once this way ("Cannot read properties of undefined (reading 'find')").
function buildCategoryGroups(): CategoryGroup[] {
  const order: string[] = [];
  const bySlugs = new Map<string, string[]>();
  for (const c of shopCategories) {
    if (!bySlugs.has(c.name)) {
      bySlugs.set(c.name, []);
      order.push(c.name);
    }
    bySlugs.get(c.name)!.push(c.slug);
  }
  return order.map((name) => ({ name, slugs: bySlugs.get(name)! }));
}

/** Brands carrying products in a given category group, ranked by product count. */
function brandsInGroup(group: CategoryGroup | undefined) {
  if (!group) return [];
  const slugs = new Set(group.slugs);
  const counts = new Map<string, number>();
  for (const p of products) {
    if (slugs.has(p.category)) counts.set(p.brand, (counts.get(p.brand) ?? 0) + 1);
  }
  return Array.from(counts.keys())
    .sort((a, b) => counts.get(b)! - counts.get(a)!)
    .slice(0, 10);
}

export function Header() {
  useCatalogVersion();
  const { ids: wishlistIds } = useWishlist();
  const nav = useLiveNav();
  const categoryGroups = useMemo(buildCategoryGroups, []);
  const [open, setOpen] = useState(false);
  const [catMenuOpen, setCatMenuOpen] = useState(false);
  const [hoveredGroup, setHoveredGroup] = useState<string>(() => buildCategoryGroups()[0]?.name ?? "");
  const [openGroupMobile, setOpenGroupMobile] = useState<string | null>(null);
  const [wishlistPopped, setWishlistPopped] = useState(false);
  const prevWishlistCount = useRef(wishlistIds.length);

  // Pop the heart whenever a product is added to or removed from the
  // wishlist anywhere on the site (WishlistButton dispatches "dc-wishlist",
  // which useWishlist() picks up) — skip the very first render so the icon
  // doesn't pop just because localStorage already had saved items on load.
  useEffect(() => {
    if (wishlistIds.length !== prevWishlistCount.current) {
      prevWishlistCount.current = wishlistIds.length;
      setWishlistPopped(true);
      const t = setTimeout(() => setWishlistPopped(false), 320);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [wishlistIds.length]);
  const catMenuRef = useRef<HTMLLIElement>(null);

  const hoveredBrands = useMemo(
    () => brandsInGroup(categoryGroups.find((g) => g.name === hoveredGroup)),
    [categoryGroups, hoveredGroup],
  );

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
          Deals<span className="text-clay">Canvas</span>
        </Link>

        <div className="ml-auto flex items-center gap-4">
          <Link to="/account" className="relative flex items-center gap-2 text-sm font-medium hover:text-clay">
            <span className="relative">
              <Heart
                className={cn(
                  "h-5 w-5 transition-transform duration-200 ease-out",
                  wishlistIds.length > 0 && "fill-clay text-clay",
                  wishlistPopped && "scale-125",
                )}
              />
              {wishlistIds.length > 0 ? (
                <span
                  key={wishlistIds.length}
                  className="animate-in zoom-in-50 duration-200 absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-clay px-1 text-[10px] font-semibold leading-none text-clay-foreground"
                >
                  {wishlistIds.length > 99 ? "99+" : wishlistIds.length}
                </span>
              ) : null}
            </span>
            <span className="hidden sm:inline">Wishlist</span>
          </Link>
        </div>
      </div>

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
                column lists product-type categories, and hovering one swaps the right pane
                to the brands that carry that type. */}
            <div
              className={cn(
                "absolute left-0 top-full z-50 mt-1 flex h-72 w-[34rem] rounded-sm border bg-card normal-case shadow-lg transition-all duration-150 ease-out",
                catMenuOpen
                  ? "translate-y-0 opacity-100"
                  : "pointer-events-none -translate-y-1 opacity-0",
              )}
            >
              <div className="w-44 shrink-0 overflow-y-auto border-r p-2">
                {categoryGroups.map((g) => (
                  <Link
                    key={g.name}
                    to="/shop"
                    search={{ q: g.name, category: "", department: "", view: "", store: "" }}
                    onMouseEnter={() => setHoveredGroup(g.name)}
                    onClick={() => setCatMenuOpen(false)}
                    className={cn(
                      "flex items-center justify-between rounded-sm px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] hover:bg-cream hover:text-clay",
                      hoveredGroup === g.name && "bg-cream text-clay",
                    )}
                  >
                    {g.name}
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                ))}
              </div>
              <div className="flex-1 space-y-1 overflow-y-auto p-3">
                <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Brands in {hoveredGroup}
                </p>
                {hoveredBrands.length ? (
                  hoveredBrands.map((slug) => (
                    <Link
                      key={slug}
                      to="/shop"
                      search={{ q: `${brandName(slug)} ${hoveredGroup}`, category: "", department: "", view: "", store: "" }}
                      onClick={() => setCatMenuOpen(false)}
                      className="block rounded-sm px-3 py-2 text-sm font-normal normal-case tracking-normal text-muted-foreground hover:bg-cream hover:text-clay"
                    >
                      {brandName(slug)}
                    </Link>
                  ))
                ) : (
                  <p className="px-3 py-2 text-sm font-normal normal-case tracking-normal text-muted-foreground">
                    No brands found.
                  </p>
                )}
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
            {categoryGroups.map((g) => (
              <li key={g.name} className="border-t border-border first:border-t-0">
                <button
                  type="button"
                  onClick={() => setOpenGroupMobile((v) => (v === g.name ? null : g.name))}
                  aria-expanded={openGroupMobile === g.name}
                  className="flex w-full items-center justify-between px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em]"
                >
                  {g.name}
                  <ChevronDown
                    className={cn("h-3.5 w-3.5 transition-transform", openGroupMobile === g.name && "rotate-180")}
                  />
                </button>
                {openGroupMobile === g.name ? (
                  <div className="bg-cream px-4 pb-3">
                    <Link
                      to="/shop"
                      search={{ q: g.name, category: "", department: "", view: "", store: "" }}
                      onClick={() => {
                        setOpen(false);
                        setOpenGroupMobile(null);
                      }}
                      className="block py-2 text-sm font-semibold"
                    >
                      All {g.name}
                    </Link>
                    {brandsInGroup(g).map((slug) => (
                      <Link
                        key={slug}
                        to="/shop"
                        search={{ q: `${brandName(slug)} ${g.name}`, category: "", department: "", view: "", store: "" }}
                        onClick={() => {
                          setOpen(false);
                          setOpenGroupMobile(null);
                        }}
                        className="block py-2 text-sm text-muted-foreground"
                      >
                        {brandName(slug)}
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
