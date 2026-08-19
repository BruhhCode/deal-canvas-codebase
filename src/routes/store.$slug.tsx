import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProductCard } from "@/components/ProductCard";
import { SectionHeading } from "@/components/SectionHeading";
import { StoreMark } from "@/components/StoreMark";
import { CouponCard } from "@/components/CouponCard";
import { coupons } from "@/data/catalog";
import { getStore } from "@/data/stores";
import {
  categoryName,
  productDiscount,
  productsByStore,
  saleEvents,
} from "@/data/products";

export const Route = createFileRoute("/store/$slug")({
  loader: ({ params }) => {
    const store = getStore(params.slug);
    if (!store) throw notFound();
    return { store };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Store unavailable | DealCanvas" }, { name: "robots", content: "noindex" }] };
    }
    const s = loaderData.store;
    const title = `${s.name} Deals, Offers & Price Comparison | DealCanvas`;
    const description = `${s.description} Compare ${s.name} prices against every other store we track and shop the lowest current price.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: StorePage,
});

function StorePage() {
  const { store } = Route.useLoaderData();
  const all = productsByStore(store.slug);
  const popular = all.slice().sort((a, b) => b.views - a.views).slice(0, 8);
  const sale = all.filter((p) => productDiscount(p) >= 25).slice(0, 8);
  const fresh = all.filter((p) => p.newIn).slice(0, 4);
  const events = saleEvents.filter((e) => e.store === store.slug);
  const cats = Array.from(new Set(all.map((p) => p.category))).slice(0, 8);
  const storeCoupons = coupons.filter((c) => store.slug.startsWith(c.brand)).slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
      <Breadcrumbs
        items={[{ label: "Home", to: "/" }, { label: "Stores", to: "/stores" }, { label: store.name }]}
      />

      <header className="mb-12 grid gap-6 rounded-lg border bg-cream p-8 md:grid-cols-[auto_1fr_auto] md:items-center">
        <StoreMark slug={store.slug} size="lg" />
        <div>
          <h1 className="text-4xl md:text-5xl">{store.name}</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">{store.description}</p>
          <p className="mt-3 text-xs uppercase tracking-[0.14em] text-muted-foreground">
            {all.length} products tracked · Ships to {store.shipsTo} · {store.network}
          </p>
          {store.storeWideOffer ? (
            <p className="mt-3 text-sm font-semibold text-clay">{store.storeWideOffer}</p>
          ) : null}
        </div>
        <Link
          to="/shop"
          search={{ q: "", category: "", department: "", view: "" }}
          className="rounded-sm bg-primary px-7 py-3 text-center text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-clay hover:text-clay-foreground"
        >
          Shop Store
        </Link>
      </header>

      {cats.length ? (
        <section className="mb-14">
          <SectionHeading eyebrow="Browse" title="Top Categories" />
          <div className="flex flex-wrap gap-2">
            {cats.map((c) => (
              <Link
                key={c}
                to="/shop"
                search={{ q: "", category: c, department: "", view: "" }}
                className="rounded-full border px-4 py-2 text-sm hover:border-clay hover:text-clay"
              >
                {categoryName(c)}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {events.length ? (
        <section className="mb-14">
          <SectionHeading eyebrow="Live" title="Current Store Sales" href="/sales-calendar" linkLabel="Sales calendar" />
          <div className="grid gap-4 md:grid-cols-2">
            {events.map((e) => (
              <div key={e.id} className="rounded-lg border bg-card p-5">
                <p className="editorial-eyebrow">{e.window.replace("-", " ")}</p>
                <h3 className="mt-2 text-xl">{e.title}</h3>
                <p className="mt-1 text-sm font-semibold text-clay">{e.discount}</p>
                <p className="mt-2 text-sm text-muted-foreground">{e.detail}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mb-14">
        <SectionHeading eyebrow="Popular" title={`Popular at ${store.name}`} />
        <div className="grid grid-cols-2 gap-x-5 gap-y-9 lg:grid-cols-4">
          {popular.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {fresh.length ? (
        <section className="mb-14">
          <SectionHeading eyebrow="New in" title="New Arrivals" />
          <div className="grid grid-cols-2 gap-x-5 gap-y-9 lg:grid-cols-4">
            {fresh.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : null}

      {sale.length ? (
        <section className="mb-14">
          <SectionHeading eyebrow="Sale" title="On Sale Now" />
          <div className="grid grid-cols-2 gap-x-5 gap-y-9 lg:grid-cols-4">
            {sale.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : null}

      {storeCoupons.length ? (
        <section className="mb-6">
          <SectionHeading eyebrow="Coupons" title="Codes for This Store" href="/coupons" />
          <div className="grid gap-6 md:grid-cols-3">
            {storeCoupons.map((c) => (
              <CouponCard key={c.id} coupon={c} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
