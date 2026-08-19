import { Link } from "@tanstack/react-router";
import { categories, seasonalSales } from "@/data/catalog";

export function Footer() {
  return (
    <footer className="border-t bg-cream">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-4">
        <div>
          <p className="font-serif text-2xl">
            Deal<span className="text-clay">Canvas</span>
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
            <li><Link to="/admin" className="hover:text-clay">Admin Dashboard</Link></li>
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
      </div>

      <div className="border-t">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-6 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} DealCanvas. All prices in INR and subject to change.</p>
          <p>Affiliate disclosure · Editorial policy · Privacy</p>
        </div>
      </div>
    </footer>
  );
}
