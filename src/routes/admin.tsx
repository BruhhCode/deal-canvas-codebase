import { useEffect, useMemo, useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import type { Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { DealBadge } from "@/components/DealBadge";
import { brandName, brands, coupons, deals, discountPct, type Deal, type DealStatus } from "@/data/catalog";
import { stores } from "@/data/stores";
import {
  bestOffer,
  categoryName,
  lastUpdatedLabel,
  productDiscount,
  products,
  productsByStore,
  saleEvents,
  type Offer,
  type Product,
} from "@/data/products";
import { fromUsd, toUsd, useCurrency } from "@/lib/currency";
import { useCatalogVersion } from "@/lib/live-catalog";
import { supabase } from "@/lib/supabase";

/**
 * Tracks the signed-in Supabase Auth session so the dashboard can gate
 * writes behind actually being logged in. `undefined` = still checking the
 * initial session, `null` = confirmed signed out. Being signed in isn't
 * sufficient on its own for offers/deals/sale_events writes to succeed —
 * RLS also requires the account to be listed in `admin_users` (see
 * supabase/schema.sql and docs/shared-context.md) — this hook only knows
 * about the auth half, and a write attempt from a signed-in-but-not-admin
 * account will fail with a normal Supabase error surfaced via the existing
 * toast.error() calls in ProductRow/DealRow below.
 */
function useAdminSession(): Session | null | undefined {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  useEffect(() => {
    if (!supabase) {
      setSession(null);
      return;
    }
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => subscription.unsubscribe();
  }, []);
  return session;
}

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Deal Management Dashboard | DealsCanvas Admin" },
      { name: "description", content: "Internal dashboard for managing deals, coupons, affiliate tracking and performance analytics." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

const tabs = ["Products", "Stores", "Deals", "Sales", "Analytics", "Networks"] as const;
const availabilityOptions: Offer["availability"][] = ["IN STOCK", "LOW STOCK", "OUT OF STOCK"];
const dealStatusOptions: DealStatus[] = ["ACTIVE", "UPCOMING", "EXPIRED", "SOLD OUT", "PAUSED"];

function AdminPage() {
  const session = useAdminSession();

  if (session === undefined) {
    return <div className="mx-auto max-w-7xl px-6 py-24 text-center text-sm text-muted-foreground">Loading…</div>;
  }
  if (!session) {
    return <AdminLogin />;
  }
  return <AdminDashboard session={session} />;
}

/** Minimal email/password gate — real Supabase Auth, matching the sibling admin-panel repo's login flow. */
function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      toast.error("Supabase isn't configured — set VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (error) toast.error(error.message);
  };

  return (
    <div className="mx-auto flex max-w-sm flex-col px-6 py-24">
      <p className="editorial-eyebrow">Internal</p>
      <h1 className="mt-3 text-3xl">Admin sign in</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Sign in with an admin account to manage prices, deals and sale events.
      </p>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <div>
          <label htmlFor="admin-email" className="editorial-eyebrow mb-2 block">
            Email
          </label>
          <input
            id="admin-email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-sm border bg-card px-3 py-2 text-sm outline-none focus:border-clay"
          />
        </div>
        <div>
          <label htmlFor="admin-password" className="editorial-eyebrow mb-2 block">
            Password
          </label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-sm border bg-card px-3 py-2 text-sm outline-none focus:border-clay"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-sm bg-primary px-5 py-2.5 text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-clay hover:text-clay-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="mt-6 text-xs text-muted-foreground">
        Signing in isn't enough on its own to save changes — the account also needs to be listed in the{" "}
        <code>admin_users</code> table (see <code>docs/shared-context.md</code>).
      </p>
    </div>
  );
}

function AdminDashboard({ session }: { session: Session }) {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Products");
  const [q, setQ] = useState("");
  const { format } = useCurrency();
  const version = useCatalogVersion();

  const rows = useMemo(
    () => deals.filter((d) => (d.title + brandName(d.brand)).toLowerCase().includes(q.toLowerCase())),
    [q, version],
  );

  const totalClicks = deals.reduce((s, d) => s + d.clicks, 0);
  const affiliateClicks = Math.round(totalClicks * 0.82);
  const conversions = Math.round(affiliateClicks * 0.041);
  const revenue = conversions * 640;

  const topBrands = brands
    .map((b) => ({ ...b, clicks: deals.filter((d) => d.brand === b.slug).reduce((s, d) => s + d.clicks, 0) }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 6);

  const networks = Array.from(new Set(deals.map((d) => d.network))).map((n) => ({
    name: n,
    deals: deals.filter((d) => d.network === n).length,
    clicks: deals.filter((d) => d.network === n).reduce((s, d) => s + d.clicks, 0),
  }));

  const stats = [
    { label: "Total clicks", value: totalClicks.toLocaleString("en-US") },
    { label: "Affiliate clicks", value: affiliateClicks.toLocaleString("en-US") },
    { label: "CTR", value: "6.4%" },
    { label: "Conversion rate", value: "4.1%" },
    { label: "Revenue (30d)", value: format(revenue) },
    { label: "EPC", value: format(Math.round(revenue / affiliateClicks)) },
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Admin" }]} />
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b pb-6">
        <div>
          <p className="editorial-eyebrow">Internal · mockup</p>
          <h1 className="mt-3 text-4xl">Catalogue Management</h1>
          <p className="mt-1 text-xs text-muted-foreground">Signed in as {session.user.email}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-sm border px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] ${
                tab === t ? "border-clay bg-clay text-clay-foreground" : "hover:border-clay"
              }`}
            >
              {t}
            </button>
          ))}
          <button
            type="button"
            onClick={() => supabase?.auth.signOut()}
            className="rounded-sm border px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] hover:border-clay"
          >
            Sign out
          </button>
        </div>
      </header>

      {tab === "Products" ? (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products..."
              aria-label="Search products"
              className="w-full max-w-sm rounded-sm border bg-card px-3 py-2 text-sm outline-none focus:border-clay"
            />
            <div className="flex flex-wrap gap-2">
              {["Add product", "Import feed", "Bulk update"].map((a) => (
                <button
                  key={a}
                  type="button"
                  className="rounded-sm border px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] hover:border-clay"
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-cream text-xs uppercase tracking-[0.14em] text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Brand</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Stores</th>
                  <th className="px-4 py-3">Best price</th>
                  <th className="px-4 py-3">Availability</th>
                  <th className="px-4 py-3">Discount</th>
                  <th className="px-4 py-3">Freshness</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products
                  .filter((p) => (p.name + brandName(p.brand)).toLowerCase().includes(q.toLowerCase()))
                  .slice(0, 30)
                  .map((p) => (
                    <ProductRow key={p.id} product={p} />
                  ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}

      {tab === "Stores" ? (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-cream text-xs uppercase tracking-[0.14em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Store</th>
                <th className="px-4 py-3">Network</th>
                <th className="px-4 py-3">Campaign</th>
                <th className="px-4 py-3">Store ID</th>
                <th className="px-4 py-3">Products</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {stores.map((st) => (
                <tr key={st.slug}>
                  <td className="px-4 py-3">{st.name}</td>
                  <td className="px-4 py-3">{st.network}</td>
                  <td className="px-4 py-3">{st.campaign}</td>
                  <td className="px-4 py-3">{st.storeId}</td>
                  <td className="px-4 py-3">{productsByStore(st.slug).length}</td>
                  <td className="px-4 py-3 text-clay">Active</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {tab === "Sales" ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {saleEvents.map((e) => (
            <div key={e.id} className="rounded-lg border bg-card p-5">
              <p className="editorial-eyebrow">{e.window.replace("-", " ")}</p>
              <h3 className="mt-2 text-lg">{e.title}</h3>
              <p className="mt-1 text-sm text-clay">{e.discount}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {e.code ? `Code ${e.code} · ` : ""}Scheduled · store {e.store}
              </p>
              <div className="mt-4 flex gap-2">
                {["Edit", "Feature", "Expire"].map((a) => (
                  <button
                    key={a}
                    type="button"
                    className="rounded-sm border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] hover:border-clay"
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {tab === "Deals" ? (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search deals..."
              aria-label="Search deals"
              className="w-full max-w-sm rounded-sm border bg-card px-3 py-2 text-sm outline-none focus:border-clay"
            />
            <button
              type="button"
              className="rounded-sm bg-primary px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground"
            >
              + Add deal
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border bg-card">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-cream text-left text-xs uppercase tracking-[0.12em] text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Deal</th>
                  <th className="px-4 py-3">Brand</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Disc.</th>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Network</th>
                  <th className="px-4 py-3">Clicks</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((d) => (
                  <DealRow key={d.id} deal={d} />
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}

      {tab === "Analytics" ? (
        <div className="space-y-10">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map((s) => (
              <div key={s.label} className="rounded-lg border bg-card p-5">
                <p className="editorial-eyebrow">{s.label}</p>
                <p className="mt-2 font-serif text-3xl">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-lg border bg-card p-6">
              <h2 className="mb-4 text-xl">Top brands by clicks</h2>
              <ul className="space-y-3">
                {topBrands.map((b) => (
                  <li key={b.slug}>
                    <div className="flex justify-between text-sm">
                      <span>{b.name}</span>
                      <span className="text-muted-foreground">{b.clicks.toLocaleString("en-US")}</span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-cream">
                      <div
                        className="h-1.5 rounded-full bg-clay"
                        style={{ width: `${(b.clicks / topBrands[0]!.clicks) * 100}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border bg-card p-6">
              <h2 className="mb-4 text-xl">Top performing coupons</h2>
              <ul className="space-y-3 text-sm">
                {coupons
                  .slice()
                  .sort((a, b) => b.usedToday - a.usedToday)
                  .slice(0, 6)
                  .map((c) => (
                    <li key={c.id} className="flex justify-between border-b pb-2 last:border-0">
                      <span className="font-mono text-xs">{c.code}</span>
                      <span className="text-muted-foreground">
                        {c.usedToday} uses · {c.successRate}% success
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      ) : null}

      {tab === "Networks" ? (
        <div className="overflow-x-auto rounded-lg border bg-card">
          <table className="w-full min-w-[600px] text-sm">
            <thead className="bg-cream text-left text-xs uppercase tracking-[0.12em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Affiliate network</th>
                <th className="px-4 py-3">Merchants</th>
                <th className="px-4 py-3">Deals</th>
                <th className="px-4 py-3">Clicks</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {networks.map((n) => (
                <tr key={n.name} className="border-t">
                  <td className="px-4 py-3">{n.name}</td>
                  <td className="px-4 py-3">{brands.filter((b) => b.network === n.name).length}</td>
                  <td className="px-4 py-3">{n.deals}</td>
                  <td className="px-4 py-3">{n.clicks.toLocaleString("en-US")}</td>
                  <td className="px-4 py-3"><DealBadge badge="ACTIVE" /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="border-t px-4 py-3 text-xs text-muted-foreground">
            Tracking links are generated per deal from merchant URL + network + campaign + sub-ID, so new
            networks can be added without changing the storefront.
          </p>
        </div>
      ) : null}
    </div>
  );
}

/** Editable row: edits the product's best offer (price + availability) and writes straight to Supabase. */
function ProductRow({ product: p }: { product: Product }) {
  const offer = bestOffer(p);
  const [price, setPrice] = useState(toUsd(offer.price).toFixed(2));
  const [availability, setAvailability] = useState<Offer["availability"]>(offer.availability);
  const [saving, setSaving] = useState(false);
  const dirty = Number(price) !== Math.round(toUsd(offer.price) * 100) / 100 || availability !== offer.availability;

  const save = async () => {
    if (!supabase) {
      toast.error("Supabase isn't configured — set VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.");
      return;
    }
    const nextPriceUsd = Number(price);
    if (!Number.isFinite(nextPriceUsd) || nextPriceUsd < 0) {
      toast.error("Enter a valid price.");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("offers")
      .update({ price: fromUsd(nextPriceUsd), availability })
      .eq("product_slug", p.slug)
      .eq("store", offer.store);
    setSaving(false);
    if (error) toast.error(`Couldn't save: ${error.message}`);
    else toast.success(`${p.name} updated — live on the site now.`);
  };

  return (
    <tr>
      <td className="px-4 py-3">{p.name}</td>
      <td className="px-4 py-3">{brandName(p.brand)}</td>
      <td className="px-4 py-3">{categoryName(p.category)}</td>
      <td className="px-4 py-3">{p.offers.length}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground">$</span>
          <input
            type="number"
            min={0}
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-20 rounded-sm border bg-card px-2 py-1 text-sm outline-none focus:border-clay"
          />
        </div>
      </td>
      <td className="px-4 py-3">
        <select
          value={availability}
          onChange={(e) => setAvailability(e.target.value as Offer["availability"])}
          className="rounded-sm border bg-card px-2 py-1 text-xs outline-none focus:border-clay"
        >
          {availabilityOptions.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </td>
      <td className="px-4 py-3">{productDiscount(p)}%</td>
      <td className="px-4 py-3 text-muted-foreground">{lastUpdatedLabel(p)}</td>
      <td className="px-4 py-3">
        <button
          type="button"
          disabled={!dirty || saving}
          onClick={save}
          className="rounded-sm border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] hover:border-clay disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-input"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </td>
    </tr>
  );
}

/** Editable row: edits the deal's price + status and writes straight to Supabase. */
function DealRow({ deal: d }: { deal: Deal }) {
  const [price, setPrice] = useState(toUsd(d.price).toFixed(2));
  const [status, setStatus] = useState<DealStatus>(d.status);
  const [saving, setSaving] = useState(false);
  const dirty = Number(price) !== Math.round(toUsd(d.price) * 100) / 100 || status !== d.status;

  const save = async () => {
    if (!supabase) {
      toast.error("Supabase isn't configured — set VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.");
      return;
    }
    const nextPriceUsd = Number(price);
    if (!Number.isFinite(nextPriceUsd) || nextPriceUsd < 0) {
      toast.error("Enter a valid price.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("deals").update({ price: fromUsd(nextPriceUsd), status }).eq("id", d.id);
    setSaving(false);
    if (error) toast.error(`Couldn't save: ${error.message}`);
    else toast.success(`${d.title} updated — live on the site now.`);
  };

  return (
    <tr className="border-t">
      <td className="px-4 py-3">{d.product}</td>
      <td className="px-4 py-3">{brandName(d.brand)}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground">$</span>
          <input
            type="number"
            min={0}
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-20 rounded-sm border bg-card px-2 py-1 text-sm outline-none focus:border-clay"
          />
        </div>
      </td>
      <td className="px-4 py-3">{discountPct(d)}%</td>
      <td className="px-4 py-3 font-mono text-xs">{d.code ?? "—"}</td>
      <td className="px-4 py-3 text-xs">{d.network}</td>
      <td className="px-4 py-3">{d.clicks.toLocaleString("en-US")}</td>
      <td className="px-4 py-3">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as DealStatus)}
          className="rounded-sm border bg-card px-2 py-1 text-xs outline-none focus:border-clay"
        >
          {dealStatusOptions.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </td>
      <td className="px-4 py-3">
        <button
          type="button"
          disabled={!dirty || saving}
          onClick={save}
          className="rounded-sm border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] hover:border-clay disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-input"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </td>
    </tr>
  );
}
