/**
 * Wires the static catalog (src/data/products.ts, catalog.ts) to Supabase Realtime.
 *
 * The catalog's `products`, `deals` and `saleEvents` arrays already live in module
 * scope as plain, shared object references — every component reads the same array
 * and the same product/deal/event objects. So instead of replacing that data layer,
 * this module subscribes to Postgres changes on `products`, `offers`, `deals` and
 * `sale_events` and mutates the matching object *in place* when a row changes (e.g.
 * the admin dashboard adds a product or edits a price). Components that display
 * live data call `useCatalogVersion()`, which forces a re-render whenever a
 * mutation happens — so they always read the freshly-mutated fields on their next
 * render.
 *
 * Requires `products` (alongside `offers`/`deals`/`sale_events`) to be added to the
 * `supabase_realtime` publication in Postgres — see scripts in the admin panel's
 * src/scripts/enable-products-realtime.sql.
 */
import { useSyncExternalStore } from "react";
import { supabase } from "./supabase";
import { canonicalCategory, type Gender } from "./categorize";
import { products } from "@/data/products";
import type { Offer, Product } from "@/data/products";
import { deals, type Deal } from "@/data/catalog";
import { saleEvents } from "@/data/products";
import type { SaleEvent } from "@/data/products";

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

// Offers can arrive over Realtime before the product row that owns them
// (no ordering guarantee across two channels/rows in the same WAL batch).
// Buffer any offer whose product isn't known yet and flush it once the
// product INSERT is applied.
const pendingOffersBySlug = new Map<string, OfferRow[]>();

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

function applyOfferRow(row: OfferRow, deleted: boolean) {
  const product = productsBySlug.get(row.product_slug);
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

  const existing = productsBySlug.get(row.slug);
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

  products.push(mapped);
  productsBySlug.set(mapped.slug, mapped);
  productsById.set(mapped.id, mapped);

  const pending = pendingOffersBySlug.get(row.slug);
  if (pending) {
    pendingOffersBySlug.delete(row.slug);
    for (const offerRow of pending) applyOfferRow(offerRow, false);
  }
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

let started = false;

/** Client-only; safe to call multiple times (e.g. on re-mount in dev) — it only wires up once. */
export function initLiveCatalog() {
  if (started || typeof window === "undefined" || !supabase) return;
  started = true;

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
