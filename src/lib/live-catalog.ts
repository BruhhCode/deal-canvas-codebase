/**
 * Wires the static catalog (src/data/products.ts, catalog.ts, stores.ts) to Supabase Realtime.
 *
 * The catalog's `products`, `deals`, `saleEvents`, `brands` and `stores` arrays
 * already live in module scope as plain, shared object references — every
 * component reads the same array and the same product/deal/event/brand/store
 * objects. So instead of replacing that data layer, this module subscribes to
 * Postgres changes on `products`, `offers`, `deals`, `sale_events`, `brands`
 * and `stores` and mutates the matching object *in place* when a row changes
 * (e.g. the admin dashboard adds a product or edits a price). Components that
 * display live data call `useCatalogVersion()`, which forces a re-render
 * whenever a mutation happens — so they always read the freshly-mutated
 * fields on their next render.
 *
 * Requires all six tables to be added to the `supabase_realtime` publication
 * in Postgres — see scripts in the admin panel's
 * src/scripts/enable-products-realtime.sql.
 */
import { useSyncExternalStore } from "react";
import { supabase } from "./supabase";
import { canonicalCategory, type Gender } from "./categorize";
import { products } from "@/data/products";
import type { Offer, Product } from "@/data/products";
import { brands, deals, type Brand, type Deal } from "@/data/catalog";
import { saleEvents } from "@/data/products";
import type { SaleEvent } from "@/data/products";
import { stores, type Store } from "@/data/stores";

let version = 0;
const listeners = new Set<() => void>();

function bump() {
  version++;
  for (const l of listeners) l();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return version;
}

/** Call in any component that renders live price/availability/deal/sale-event data. */
export function useCatalogVersion() {
  return useSyncExternalStore(subscribe, getSnapshot, () => 0);
}

const productsBySlug = new Map(products.map((p) => [p.slug, p]));
const productsById = new Map(products.map((p) => [p.id, p]));
const dealsById = new Map(deals.map((d) => [d.id, d]));
const saleEventsById = new Map(saleEvents.map((e) => [e.id, e]));
const brandsBySlug = new Map(brands.map((b) => [b.slug, b]));
const storesBySlug = new Map(stores.map((s) => [s.slug, s]));

// Offers can arrive over Realtime before the product row that owns them
// (no ordering guarantee across two channels/rows in the same WAL batch).
// Buffer any offer whose product isn't known yet and flush it once the
// product INSERT is applied.
const pendingOffersBySlug = new Map<string, OfferRow[]>();

// The reverse gap: a product row can also arrive before any of its offers
// (they're written as a second, separate insert). Every existing consumer
// of `products` (bestOffer, filterProducts, sortProducts, JSON-LD, etc.)
// assumes every product has at least one offer — bestOffer's reduce throws
// on an empty array — so a product must not be published into the shared
// `products` array until it actually has one, or it can crash any page that
// renders the live list. Held here until its first offer arrives.
const pendingProductsBySlug = new Map<string, Product>();

type OfferRow = {
  product_slug: string;
  store: string;
  price: number;
  original_price: number;
  currency: "USD";
  availability: Offer["availability"];
  product_url: string;
  coupon_code: string | null;
  shipping: string;
  updated_hours_ago: number;
  sponsored: boolean;
};

/** Moves a pending (offerless) product into the live `products` array once it has its first offer. */
function publishPendingProduct(slug: string) {
  const pending = pendingProductsBySlug.get(slug);
  if (!pending || !pending.offers.length) return;
  pendingProductsBySlug.delete(slug);
  products.push(pending);
  productsBySlug.set(pending.slug, pending);
  productsById.set(pending.id, pending);
}

function applyOfferRow(row: OfferRow, deleted: boolean) {
  const product = productsBySlug.get(row.product_slug) ?? pendingProductsBySlug.get(row.product_slug);
  if (!product) {
    if (!deleted) {
      const pending = pendingOffersBySlug.get(row.product_slug) ?? [];
      pending.push(row);
      pendingOffersBySlug.set(row.product_slug, pending);
    }
    return;
  }

  const idx = product.offers.findIndex((o) => o.store === row.store);

  if (deleted) {
    if (idx !== -1) product.offers.splice(idx, 1);
    return;
  }

  const mapped: Offer = {
    store: row.store,
    price: row.price,
    originalPrice: row.original_price,
    currency: row.currency,
    availability: row.availability,
    productUrl: row.product_url,
    couponCode: row.coupon_code ?? undefined,
    shipping: row.shipping,
    updatedHoursAgo: row.updated_hours_ago,
    sponsored: row.sponsored,
  };

  if (idx === -1) product.offers.push(mapped);
  else product.offers[idx] = mapped;

  publishPendingProduct(row.product_slug);
}

type ProductRow = {
  slug: string;
  source_id: string;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  gender: string;
  description: string;
  image: string;
  images: string[] | null;
  colors: string[];
  sizes: string[];
  tags: string[];
  rating: number;
  reviews: number;
  views: number;
  new_in: boolean;
};

function toGender(raw: string): Gender {
  return raw === "men" || raw === "women" ? raw : "unisex";
}

function applyProductRow(row: ProductRow, deleted: boolean) {
  if (deleted) {
    const existing = productsBySlug.get(row.slug);
    if (existing) {
      const idx = products.indexOf(existing);
      if (idx !== -1) products.splice(idx, 1);
      productsBySlug.delete(row.slug);
      productsById.delete(existing.id);
    }
    pendingProductsBySlug.delete(row.slug);
    return;
  }

  const gender = toGender(row.gender);
  const category = canonicalCategory({
    brand: row.brand,
    rawCategory: row.category,
    subcategory: row.subcategory,
    gender,
    name: row.name,
  });

  // Covers both an already-published product and one still waiting on its
  // first offer — either way this is a field update, not a brand-new row.
  const existing = productsBySlug.get(row.slug) ?? pendingProductsBySlug.get(row.slug);
  if (existing) {
    Object.assign(existing, {
      name: row.name,
      brand: row.brand,
      category,
      subcategory: row.subcategory,
      gender,
      description: row.description,
      image: row.image,
      images: row.images ?? undefined,
      colors: row.colors,
      sizes: row.sizes,
      tags: row.tags,
      rating: row.rating,
      reviews: row.reviews,
      views: row.views,
      newIn: row.new_in,
    });
    return;
  }

  const mapped: Product = {
    // The live products table has no separate synthetic id column — the
    // slug is the primary key, so we reuse it as the in-app id too (it's
    // only ever used for equality checks like relatedProducts/similarInCategory).
    id: row.slug,
    slug: row.slug,
    name: row.name,
    brand: row.brand,
    category,
    subcategory: row.subcategory,
    gender,
    description: row.description,
    image: row.image,
    images: row.images ?? undefined,
    colors: row.colors,
    sizes: row.sizes,
    tags: row.tags,
    rating: row.rating,
    reviews: row.reviews,
    views: row.views,
    newIn: row.new_in,
    offers: [],
  };

  // Held back from the shared `products` array (see pendingProductsBySlug
  // above) until it has at least one offer, whether that's already buffered
  // here from an offer that arrived first, or still to come.
  pendingProductsBySlug.set(mapped.slug, mapped);

  const pending = pendingOffersBySlug.get(row.slug);
  if (pending) {
    pendingOffersBySlug.delete(row.slug);
    for (const offerRow of pending) applyOfferRow(offerRow, false);
  }
}

/**
 * Fallback for the product detail route: its loader runs before the
 * `initLiveCatalog()` client-side hydration has a chance to complete (it's
 * synchronous SSR on a cold load), so a product that only exists in
 * Supabase — not yet in the bundled static data — would 404 even though
 * `hydrateFromSupabase` would eventually have found it. Fetches and applies
 * just that one product + its offers directly, server or client side.
 * Returns true if the product now exists in the live catalog.
 */
export async function fetchAndApplyProduct(slug: string): Promise<boolean> {
  if (!supabase) return false;

  const { data: productRow } = await supabase.from("products").select("*").eq("slug", slug).maybeSingle();
  if (!productRow) return false;
  applyProductRow(productRow as ProductRow, false);

  const { data: offerRows } = await supabase.from("offers").select("*").eq("product_slug", slug);
  for (const row of offerRows ?? []) applyOfferRow(row as OfferRow, false);

  return productsBySlug.has(slug);
}

type DealRow = {
  id: string;
  slug: string;
  title: string;
  product: string;
  brand: string;
  category: string;
  subcategory: string | null;
  original_price: number;
  price: number;
  code: string | null;
  deal_type: string;
  badges: Deal["badges"];
  description: string;
  terms: string[];
  expires_in_hours: number;
  status: Deal["status"];
  image: string;
  tags: string[];
  merchant_url: string;
  network: Deal["network"];
  campaign: string;
  sub_id: string;
  tracking_id: string;
  clicks: number;
  featured: boolean;
  flash: boolean;
  sponsored: boolean;
};

function applyDealRow(row: DealRow, deleted: boolean) {
  const existing = dealsById.get(row.id);
  if (deleted) {
    if (existing) {
      const idx = deals.indexOf(existing);
      if (idx !== -1) deals.splice(idx, 1);
      dealsById.delete(row.id);
    }
    return;
  }

  const mapped: Deal = {
    id: row.id,
    slug: row.slug,
    title: row.title,
    product: row.product,
    brand: row.brand,
    category: row.category,
    ...(row.subcategory ? { subcategory: row.subcategory } : {}),
    originalPrice: row.original_price,
    price: row.price,
    ...(row.code ? { code: row.code } : {}),
    dealType: row.deal_type,
    badges: row.badges,
    description: row.description,
    terms: row.terms,
    expiresInHours: row.expires_in_hours,
    status: row.status,
    image: row.image,
    tags: row.tags,
    merchantUrl: row.merchant_url,
    network: row.network,
    campaign: row.campaign,
    subId: row.sub_id,
    trackingId: row.tracking_id,
    clicks: row.clicks,
    featured: row.featured,
    flash: row.flash,
    sponsored: row.sponsored,
  };

  if (existing) Object.assign(existing, mapped);
  else {
    deals.push(mapped);
    dealsById.set(row.id, mapped);
  }
}

type SaleEventRow = {
  id: string;
  store: string;
  title: string;
  discount: string;
  window: SaleEvent["window"];
  detail: string;
  code: string | null;
};

function applySaleEventRow(row: SaleEventRow, deleted: boolean) {
  const existing = saleEventsById.get(row.id);
  if (deleted) {
    if (existing) {
      const idx = saleEvents.indexOf(existing);
      if (idx !== -1) saleEvents.splice(idx, 1);
      saleEventsById.delete(row.id);
    }
    return;
  }

  const mapped: SaleEvent = {
    id: row.id,
    store: row.store,
    title: row.title,
    discount: row.discount,
    window: row.window,
    detail: row.detail,
    ...(row.code ? { code: row.code } : {}),
  };

  if (existing) Object.assign(existing, mapped);
  else {
    saleEvents.push(mapped);
    saleEventsById.set(row.id, mapped);
  }
}

type BrandRow = {
  slug: string;
  name: string;
  description: string;
  category: string;
  network: Brand["network"];
  featured: boolean;
};

function applyBrandRow(row: BrandRow, deleted: boolean) {
  const existing = brandsBySlug.get(row.slug);
  if (deleted) {
    if (existing) {
      const idx = brands.indexOf(existing);
      if (idx !== -1) brands.splice(idx, 1);
      brandsBySlug.delete(row.slug);
    }
    return;
  }

  const mapped: Brand = {
    slug: row.slug,
    name: row.name,
    description: row.description,
    category: row.category,
    network: row.network,
    featured: row.featured,
  };

  if (existing) Object.assign(existing, mapped);
  else {
    brands.push(mapped);
    brandsBySlug.set(row.slug, mapped);
  }
}

type StoreRow = {
  slug: string;
  name: string;
  description: string;
  network: Store["network"];
  domain: string;
  campaign: string;
  store_id: string;
  sub_id: string;
  ships_to: string;
  store_wide_offer: string | null;
  featured: boolean;
  sponsored: boolean;
};

function applyStoreRow(row: StoreRow, deleted: boolean) {
  const existing = storesBySlug.get(row.slug);
  if (deleted) {
    if (existing) {
      const idx = stores.indexOf(existing);
      if (idx !== -1) stores.splice(idx, 1);
      storesBySlug.delete(row.slug);
    }
    return;
  }

  const mapped: Store = {
    slug: row.slug,
    name: row.name,
    description: row.description,
    network: row.network,
    domain: row.domain,
    campaign: row.campaign,
    storeId: row.store_id,
    subId: row.sub_id,
    shipsTo: row.ships_to,
    ...(row.store_wide_offer ? { storeWideOffer: row.store_wide_offer } : {}),
    featured: row.featured,
    sponsored: row.sponsored,
  };

  if (existing) Object.assign(existing, mapped);
  else {
    stores.push(mapped);
    storesBySlug.set(row.slug, mapped);
  }
}

let started = false;

/**
 * Realtime only delivers events that happen *while a client is subscribed* —
 * it never backfills changes made earlier (e.g. a product added in the admin
 * panel while no one had the site open in a browser tab). Without this, such
 * a product would never appear until the static data file was regenerated at
 * the next build. So on every client mount we pull the current DB state once
 * and apply it the same way a realtime INSERT/UPDATE would, before/alongside
 * subscribing — this self-heals any drift, not just literal misses.
 */
// PostgREST caps an unbounded `select("*")` at its configured max-rows (1000
// on this project) — with 1000+ products, a plain select silently drops
// everything past the cap instead of erroring, so every table must be paged.
const PAGE_SIZE = 1000;

// Column lists mirror each table's Row type above exactly — trims whatever
// extra DB columns (timestamps, etc.) aren't in those types out of the
// payload, instead of pulling every column with select("*").
const BRAND_COLUMNS = "slug,name,description,category,network,featured";
const STORE_COLUMNS =
  "slug,name,description,network,domain,campaign,store_id,sub_id,ships_to,store_wide_offer,featured,sponsored";
const PRODUCT_COLUMNS =
  "slug,source_id,name,brand,category,subcategory,gender,description,image,images,colors,sizes,tags,rating,reviews,views,new_in";
const OFFER_COLUMNS =
  "product_slug,store,price,original_price,currency,availability,product_url,coupon_code,shipping,updated_hours_ago,sponsored";
const DEAL_COLUMNS =
  "id,slug,title,product,brand,category,subcategory,original_price,price,code,deal_type,badges,description,terms,expires_in_hours,status,image,tags,merchant_url,network,campaign,sub_id,tracking_id,clicks,featured,flash,sponsored";
const SALE_EVENT_COLUMNS = "id,store,title,discount,window,detail,code";

async function fetchAllRows<T>(table: string, columns: string): Promise<T[]> {
  if (!supabase) return [];
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .range(from, from + PAGE_SIZE - 1);
    if (error || !data) break;
    rows.push(...(data as T[]));
    if (data.length < PAGE_SIZE) break;
  }
  return rows;
}

async function hydrateFromSupabase() {
  if (!supabase) return;

  const brandRows = await fetchAllRows<BrandRow>("brands", BRAND_COLUMNS);
  for (const row of brandRows) applyBrandRow(row, false);

  const storeRows = await fetchAllRows<StoreRow>("stores", STORE_COLUMNS);
  for (const row of storeRows) applyStoreRow(row, false);

  const prods = await fetchAllRows<ProductRow>("products", PRODUCT_COLUMNS);
  for (const row of prods) applyProductRow(row, false);

  const offs = await fetchAllRows<OfferRow>("offers", OFFER_COLUMNS);
  for (const row of offs) applyOfferRow(row, false);

  const dealRows = await fetchAllRows<DealRow>("deals", DEAL_COLUMNS);
  for (const row of dealRows) applyDealRow(row, false);

  const eventRows = await fetchAllRows<SaleEventRow>("sale_events", SALE_EVENT_COLUMNS);
  for (const row of eventRows) applySaleEventRow(row, false);

  bump();
}

/**
 * Client-only; safe to call multiple times (e.g. on re-mount in dev) — it
 * only wires up once. The one-time bulk hydrate is deferred to idle time
 * (it exists purely to self-heal drift from edits made while no tab was
 * open — the catalog is already statically bundled, so it doesn't need to
 * compete with first paint); realtime subscriptions still attach
 * immediately since they're push-based, not a payload cost.
 */
export function initLiveCatalog() {
  if (started || typeof window === "undefined" || !supabase) return;
  started = true;

  const runWhenIdle = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 1));
  runWhenIdle(() => void hydrateFromSupabase());

  supabase
    .channel("brands-live")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "brands" },
      (payload) => {
        const deleted = payload.eventType === "DELETE";
        const row = (deleted ? payload.old : payload.new) as BrandRow;
        applyBrandRow(row, deleted);
        bump();
      },
    )
    .subscribe();

  supabase
    .channel("stores-live")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "stores" },
      (payload) => {
        const deleted = payload.eventType === "DELETE";
        const row = (deleted ? payload.old : payload.new) as StoreRow;
        applyStoreRow(row, deleted);
        bump();
      },
    )
    .subscribe();

  supabase
    .channel("products-live")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "products" },
      (payload) => {
        const deleted = payload.eventType === "DELETE";
        const row = (deleted ? payload.old : payload.new) as ProductRow;
        applyProductRow(row, deleted);
        bump();
      },
    )
    .subscribe();

  supabase
    .channel("offers-live")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "offers" },
      (payload) => {
        const deleted = payload.eventType === "DELETE";
        const row = (deleted ? payload.old : payload.new) as OfferRow;
        applyOfferRow(row, deleted);
        bump();
      },
    )
    .subscribe();

  supabase
    .channel("deals-live")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "deals" },
      (payload) => {
        const deleted = payload.eventType === "DELETE";
        const row = (deleted ? payload.old : payload.new) as DealRow;
        applyDealRow(row, deleted);
        bump();
      },
    )
    .subscribe();

  supabase
    .channel("sale-events-live")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "sale_events" },
      (payload) => {
        const deleted = payload.eventType === "DELETE";
        const row = (deleted ? payload.old : payload.new) as SaleEventRow;
        applySaleEventRow(row, deleted);
        bump();
      },
    )
    .subscribe();
}
