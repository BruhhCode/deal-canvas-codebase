-- Incremental migration — safe to run against the live DB, does NOT drop
-- or recreate offers/products/deals/sale_events (unlike a full schema.sql
-- run). Paste into Supabase Dashboard -> SQL Editor -> New query -> Run.

create unique index if not exists offers_product_slug_store_url_key on offers(product_slug, store, product_url);

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

drop policy if exists "public write" on offers;
drop policy if exists "admin write" on offers;
create policy "admin write" on offers for all to authenticated using (is_admin()) with check (is_admin());

drop policy if exists "public write" on deals;
drop policy if exists "admin write" on deals;
create policy "admin write" on deals for all to authenticated using (is_admin()) with check (is_admin());

drop policy if exists "public write" on sale_events;
drop policy if exists "admin write" on sale_events;
create policy "admin write" on sale_events for all to authenticated using (is_admin()) with check (is_admin());
