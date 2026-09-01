import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown, Heart, Menu, User, X } from "lucide-react";
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
  const [openDept, setOpenDept] = useState<string | null>(null);
  const [openDeptMobile, setOpenDeptMobile] = useState<string | null>(null);
  const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // The dropdown panel sits below the trigger with a visual gap; closing on
  // mouseleave the instant the cursor exits the trigger meant moving down
  // toward the panel crossed that gap while nothing was hovered, closing the
  // menu before a click could land. A short delay gives that transit time.
  const scheduleClose = (slug: string) => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    closeTimeout.current = setTimeout(() => {
      setOpenDept((v) => (v === slug ? null : v));
    }, 250);
  };
  const cancelClose = () => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
      closeTimeout.current = null;
    }
  };

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
          {departmentNav.map((d) => (
            <li
              key={d.slug}
              className="relative"
              onMouseEnter={() => {
                cancelClose();
                setOpenDept(d.slug);
              }}
              onMouseLeave={() => scheduleClose(d.slug)}
            >
              <button
                type="button"
                onClick={() => setOpenDept((v) => (v === d.slug ? null : d.slug))}
                aria-expanded={openDept === d.slug}
                className={cn(
                  "flex items-center gap-1 hover:text-clay",
                  openDept === d.slug && "text-clay",
                )}
              >
                {d.name}
                <ChevronDown className="h-3 w-3" />
              </button>
              {openDept === d.slug ? (
                <div
                  onMouseEnter={cancelClose}
                  onMouseLeave={() => scheduleClose(d.slug)}
                  className="absolute left-0 top-full z-50 mt-1 w-56 rounded-sm border bg-card p-2 pt-3 normal-case shadow-lg before:absolute before:inset-x-0 before:-top-2 before:h-2 before:content-['']"
                >
                  {categoriesByDepartment(d.slug).map((c) => (
                    <Link
                      key={c.slug}
                      to="/shop"
                      search={{ q: "", category: c.slug, department: d.slug, view: "", store: "" }}
                      onClick={() => setOpenDept(null)}
                      className="block rounded-sm px-3 py-2 text-sm font-normal tracking-normal hover:bg-cream hover:text-clay"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              ) : null}
            </li>
          ))}
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
