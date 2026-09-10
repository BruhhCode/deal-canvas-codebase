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
-- Row Level Security
--
-- Public (anon key) can read everything, and — for now, since the admin
-- dashboard has no real authentication yet — can also write to the tables
-- the admin dashboard edits. Tighten the write policies (e.g. restrict to
-- an authenticated `admin` role) before deploying the admin app anywhere
-- publicly reachable.
-- ---------------------------------------------------------------------------
alter table brands enable row level security;
alter table stores enable row level security;
alter table products enable row level security;
alter table offers enable row level security;
alter table deals enable row level security;
alter table sale_events enable row level security;
alter table coupons enable row level security;

do $$
declare
  t text;
begin
  for t in select unnest(array['brands','stores','products','offers','deals','sale_events','coupons'])
  loop
    execute format('drop policy if exists "public read" on %I', t);
    execute format('create policy "public read" on %I for select using (true)', t);
  end loop;
end $$;

-- Writes: only offers, deals and sale_events are edited from the admin UI today.
drop policy if exists "public write" on offers;
create policy "public write" on offers for all using (true) with check (true);

drop policy if exists "public write" on deals;
create policy "public write" on deals for all using (true) with check (true);

drop policy if exists "public write" on sale_events;
create policy "public write" on sale_events for all using (true) with check (true);

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
