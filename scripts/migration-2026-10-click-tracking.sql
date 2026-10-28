-- Incremental migration — safe to run against the live DB. Paste into
-- Supabase Dashboard -> SQL Editor -> New query -> Run.
--
-- Adds real outbound-click tracking for deals. Until now `deals.clicks` was
-- a static number frozen in at seed/import time — nothing on the site ever
-- wrote to it, so the admin panel's "Total clicks"/"Top brands by clicks"
-- were showing frozen seed data, not real traffic.
--
-- The anon key can't write to `deals` at all (see
-- migration-2026-09-rls-lockdown.sql — offers/deals/sale_events are
-- `is_admin()`-gated after a prior public-write vulnerability). Rather than
-- reopen that, this adds one narrowly-scoped SECURITY DEFINER function that
-- can only ever increment `clicks` by 1 for a given deal id — nothing else
-- about the row is writable through it.
create or replace function increment_deal_clicks(p_deal_id text)
returns void
language sql
security definer
set search_path = public
as $$
  update deals set clicks = clicks + 1 where id = p_deal_id;
$$;

grant execute on function increment_deal_clicks(text) to anon, authenticated;
