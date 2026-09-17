-- DealsCanvas — Supabase schema
-- Run this once in the Supabase SQL Editor (Dashboard → SQL Editor → New query → paste → Run).
-- After it runs, `npx tsx scripts/seed-supabase.ts` pushes the current static catalog into these tables.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- brands
-- ---------------------------------------------------------------------------
create table if not exists brands (
  slug text primary key,
  name text not null,
  description text not null default '',
  category text not null default '',
  network text not null default '',
  featured boolean not null default false
);

-- ---------------------------------------------------------------------------
-- stores
-- ---------------------------------------------------------------------------
create table if not exists stores (
  slug text primary key,
  name text not null,
  description text not null default '',
  network text not null default '',
  domain text not null default '',
  campaign text not null default '',
  store_id text not null default '',
  sub_id text not null default '',
  ships_to text not null default '',
  store_wide_offer text,
  featured boolean not null default false,
  sponsored boolean not null default false
);

-- ---------------------------------------------------------------------------
-- products
--
-- Keyed on `slug` (not `id`): the scraped catalog's `id` values were assigned
-- per-source-file during import and are NOT globally unique (e.g. "PI-0081"
-- is reused across dozens of unrelated products from different brand feeds).
-- `slug` is what routes (`/product/$slug`) already key off, and — after one
-- fix for a single accidental collision — is unique across the catalog.
-- ---------------------------------------------------------------------------
drop table if exists offers cascade;
drop table if exists products cascade;
create table products (
  slug text primary key,
  source_id text not null,
  name text not null,
  brand text not null references brands(slug),
  category text not null default '',
  subcategory text not null default '',
  gender text not null default 'unisex',
  description text not null default '',
  image text not null default '',
  images jsonb not null default '[]',
  colors jsonb not null default '[]',
  sizes jsonb not null default '[]',
  tags jsonb not null default '[]',
  rating numeric not null default 0,
  reviews integer not null default 0,
  views integer not null default 0,
  new_in boolean not null default false,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- offers (one product -> many store offers; this is what the admin edits
-- most often — price, availability/stock, coupon code)
-- ---------------------------------------------------------------------------
create table offers (
  id uuid primary key default gen_random_uuid(),
  product_slug text not null references products(slug) on delete cascade,
  store text not null references stores(slug),
  price numeric not null default 0,
  original_price numeric not null default 0,
  currency text not null default 'USD',
  availability text not null default 'IN STOCK',
  product_url text not null default '',
  coupon_code text,
  shipping text not null default '',
  updated_hours_ago integer not null default 0,
  sponsored boolean not null default false,
  updated_at timestamptz not null default now()
);
create index offers_product_slug_idx on offers(product_slug);
create index offers_store_idx on offers(store);
-- (product_slug, store) alone is NOT unique in this catalog: a product can
-- legitimately have multiple offers from the same store when several CSV
-- rows sharing one product name (different colorways/SKUs, e.g. two Air
-- Force 1 colorways both from "nike-store") get grouped into one product by
-- scripts/import-products.ts — each keeps its own product_url. Including
-- product_url in the key is what actually identifies a distinct listing;
-- scripts/seed-supabase.ts upserts on this triple instead of deleting and
-- reinserting every offer on every run. (A one-time cleanup removed ~124
-- pre-existing rows that had no real product_url and were pure duplicate
-- noise from the old delete+reinsert seeding — see git history if this
-- index creation ever fails again with a conflict, that's the class of bug.)
create unique index offers_product_slug_store_url_key on offers(product_slug, store, product_url);

-- ---------------------------------------------------------------------------
-- deals (hand-curated marketing deal cards)
--
-- Dropped and recreated (not "if not exists") because this project already
-- had a `deals` table from an earlier/unrelated attempt with a stray
-- `product_id` foreign key into `products` that isn't part of this schema —
-- recreating it here guarantees it matches exactly what this file defines.
-- ---------------------------------------------------------------------------
drop table if exists deals cascade;
create table deals (
  id text primary key,
  slug text not null unique,
  title text not null,
  product text not null default '',
  brand text not null references brands(slug),
  category text not null default '',
  subcategory text,
  original_price numeric not null default 0,
  price numeric not null default 0,
  code text,
  deal_type text not null default '',
  badges jsonb not null default '[]',
  description text not null default '',
  terms jsonb not null default '[]',
  expires_in_hours integer not null default 0,
  status text not null default 'ACTIVE',
  image text not null default '',
  tags jsonb not null default '[]',
  merchant_url text not null default '',
  network text not null default '',
  campaign text not null default '',
  sub_id text not null default '',
  tracking_id text not null default '',
  clicks integer not null default 0,
  featured boolean not null default false,
  flash boolean not null default false,
  sponsored boolean not null default false,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- sale_events (sales calendar)
-- ---------------------------------------------------------------------------
drop table if exists sale_events cascade;
create table sale_events (
  id text primary key,
  store text not null references stores(slug),
  title text not null,
  discount text not null default '',
  "window" text not null default 'this-week',
  detail text not null default '',
  code text,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- coupons
-- ---------------------------------------------------------------------------
drop table if exists coupons cascade;
create table coupons (
  id text primary key,
  brand text not null references brands(slug),
  title text not null,
  description text not null default '',
  code text not null default '',
  discount text not null default '',
  expires_in_hours integer not null default 0,
  used_today integer not null default 0,
  success_rate numeric not null default 0,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- reviews (shopper-submitted ratings/reviews, written directly from the
-- product page — no admin gate, this is the one table the public site
-- itself writes to)
-- ---------------------------------------------------------------------------
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  product_slug text not null references products(slug) on delete cascade,
  author text not null default 'Anonymous',
  rating integer not null check (rating between 1 and 5),
  comment text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists reviews_product_slug_idx on reviews(product_slug);

-- ---------------------------------------------------------------------------
-- admin_users / is_admin() — the admin-role mechanism the write policies
-- below check against. A request must be both authenticated via Supabase
-- Auth AND have a row here to insert/update/delete offers, deals or
-- sale_events. There is deliberately no public read or write policy on this
-- table itself (see the RLS section below) — the only way to query it is
-- through the security-definer function, or the service-role key.
--
-- To make someone an admin: sign them up/in once via Supabase Auth (e.g.
-- through the admin login screen), then insert their auth.users id here —
-- `insert into admin_users (user_id) values ('<their-auth-uid>');` — using
-- the service-role key or the SQL Editor (both bypass RLS).
-- ---------------------------------------------------------------------------
create table if not exists admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table admin_users enable row level security;

create or replace function is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from admin_users where user_id = auth.uid());
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- Public (anon key) can read everything. Writes to offers/deals/sale_events
-- require an authenticated user who also passes is_admin() (see above) —
-- this used to be a wide-open `using (true) with check (true)` policy with
-- no `to` role restriction, meaning ANY holder of the public anon key (which
-- ships in every page load, so this was a real vulnerability, not just a
-- theoretical one) could insert/update/delete directly against the REST API
-- with no login at all. See docs/shared-context.md for the cross-repo note.
-- ---------------------------------------------------------------------------
alter table brands enable row level security;
alter table stores enable row level security;
alter table products enable row level security;
alter table offers enable row level security;
alter table deals enable row level security;
alter table sale_events enable row level security;
alter table coupons enable row level security;
alter table reviews enable row level security;

do $$
declare
  t text;
begin
  for t in select unnest(array['brands','stores','products','offers','deals','sale_events','coupons','reviews'])
  loop
    execute format('drop policy if exists "public read" on %I', t);
    execute format('create policy "public read" on %I for select using (true)', t);
  end loop;
end $$;

-- Writes: only offers, deals and sale_events are edited from the admin UI —
-- insert/update/delete all require to authenticated + is_admin(). No public
-- (anon) write policy exists on any of the three, so anon has zero write
-- access, including delete, without a fallback "public write" policy layered
-- underneath (Postgres RLS policies are OR'd, so a leftover permissive
-- policy would have silently defeated this — make sure both drops below
-- actually run, not just the "create policy" lines).
drop policy if exists "public write" on offers;
drop policy if exists "admin write" on offers;
create policy "admin write" on offers for all to authenticated using (is_admin()) with check (is_admin());

drop policy if exists "public write" on deals;
drop policy if exists "admin write" on deals;
create policy "admin write" on deals for all to authenticated using (is_admin()) with check (is_admin());

drop policy if exists "public write" on sale_events;
drop policy if exists "admin write" on sale_events;
create policy "admin write" on sale_events for all to authenticated using (is_admin()) with check (is_admin());

-- Reviews: any shopper can post one; nobody (not even the anon key) can edit
-- or delete someone else's — there's no "public write" policy here, only
-- "public read" (from the loop above) + this insert-only policy.
drop policy if exists "public insert" on reviews;
create policy "public insert" on reviews for insert with check (true);

-- ---------------------------------------------------------------------------
-- Realtime — broadcast row changes on the tables the admin edits.
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
begin
  for t in select unnest(array['offers','deals','sale_events'])
  loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table %I', t);
    end if;
  end loop;
end $$;
