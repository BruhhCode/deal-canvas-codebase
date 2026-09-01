import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown, ChevronRight, Heart, LayoutGrid, Menu, User, X } from "lucide-react";
import { categoriesByDepartment, departments } from "@/data/products";
import { cn } from "@/lib/utils";

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

const deptOrder = ["men", "women", "kids", "lifestyle"] as const;
const departmentNav = deptOrder
  .map((slug) => departments.find((d) => d.slug === slug))
  .filter((d): d is (typeof departments)[number] => Boolean(d));

export function Header() {
  const [open, setOpen] = useState(false);
  const [catMenuOpen, setCatMenuOpen] = useState(false);
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

        <div className="ml-auto flex items-center gap-4">
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
