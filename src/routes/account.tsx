import { createFileRoute, Link } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { DealCard } from "@/components/DealCard";
import { deals } from "@/data/catalog";
import { ProductCard } from "@/components/ProductCard";
import { products } from "@/data/products";
import { useWishlist } from "@/components/WishlistButton";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My Account — Saved Deals & Wishlist | DealCanvas" },
      { name: "description", content: "Your saved deals, favourite brands and newsletter preferences." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const { ids } = useWishlist();
  const saved = deals.filter((d) => ids.includes(d.id));
  const savedProducts = products.filter((p) => ids.includes(p.id));

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Account" }]} />
      <header className="mb-10 border-b pb-6">
        <p className="editorial-eyebrow">Guest session</p>
        <h1 className="mt-3 text-4xl md:text-5xl">My Wishlist</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Saved deals are stored on this device. Sign-in and deal alerts arrive in the next release.
        </p>
      </header>

      {savedProducts.length > 0 ? (
        <section className="mb-14">
          <h2 className="mb-6 border-b pb-3 text-2xl">Saved Products</h2>
          <div className="grid grid-cols-2 gap-x-5 gap-y-9 lg:grid-cols-4">
            {savedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : null}

      {saved.length === 0 && savedProducts.length === 0 ? (
        <div className="rounded-lg border bg-cream p-10 text-center">
          <p className="text-sm text-muted-foreground">You haven't saved any deals yet.</p>
          <Link
            to="/deals"
            className="mt-5 inline-block rounded-sm bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground hover:bg-clay hover:text-clay-foreground"
          >
            Browse deals
          </Link>
        </div>
      ) : (
        <section>
          {saved.length > 0 ? <h2 className="mb-6 border-b pb-3 text-2xl">Saved Deals</h2> : null}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {saved.map((d) => (
              <DealCard key={d.id} deal={d} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
