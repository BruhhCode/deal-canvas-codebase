import { Link } from "@tanstack/react-router";
import { categories, seasonalSales } from "@/data/catalog";
import { useCurrency } from "@/lib/currency";

export function Footer() {
  const { currency } = useCurrency();
  return (
    <footer className="border-t bg-cream">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-5">
        <div className="md:col-span-2 lg:col-span-1">
          <p className="font-serif text-2xl">
            Deals<span className="text-clay">Canvas</span>
          </p>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            A curated fashion and lifestyle deal aggregator. We earn a commission when you shop
            through our links — the price you pay never changes.
          </p>
        </div>

        <div>
          <p className="editorial-eyebrow mb-4">Categories</p>
          <ul className="space-y-2 text-sm">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link to="/category/$slug" params={{ slug: c.slug }} className="hover:text-clay">
                  {c.name} Deals
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="editorial-eyebrow mb-4">Discover</p>
          <ul className="space-y-2 text-sm">
            <li><Link to="/deals" className="hover:text-clay">All Deals</Link></li>
            <li><Link to="/coupons" className="hover:text-clay">Coupons & Promo Codes</Link></li>
            <li><Link to="/flash-deals" className="hover:text-clay">Flash Deals</Link></li>
            <li><Link to="/brands" className="hover:text-clay">All Brands</Link></li>
            <li><Link to="/guides" className="hover:text-clay">Shopping Guides</Link></li>
            <li><Link to="/sales-calendar" className="hover:text-clay">Sales Calendar</Link></li>
            <li><Link to="/faq" className="hover:text-clay">FAQ</Link></li>
          </ul>
        </div>

        <div>
          <p className="editorial-eyebrow mb-4">Seasonal Sales</p>
          <ul className="space-y-2 text-sm">
            {seasonalSales.map((s) => (
              <li key={s.slug}>
                <Link to="/sale/$slug" params={{ slug: s.slug }} className="hover:text-clay">
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="editorial-eyebrow mb-4">Company</p>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="hover:text-clay">About Us</Link></li>
            <li><Link to="/terms" className="hover:text-clay">Terms & Conditions</Link></li>
            <li><Link to="/contact" className="hover:text-clay">Contact Us</Link></li>
            <li><Link to="/privacy" className="hover:text-clay">Privacy Policy</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-6 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} DealsCanvas. All prices in {currency} and subject to change.</p>
          <p className="flex items-center gap-3">
            <Link to="/terms" className="hover:text-clay">Terms & Conditions</Link>
            <span aria-hidden="true">·</span>
            <Link to="/privacy" className="hover:text-clay">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
