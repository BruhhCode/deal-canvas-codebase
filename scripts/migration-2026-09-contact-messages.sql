-- Incremental migration for the new Contact Us page — safe to run against
-- the live DB, does NOT touch any existing table. Paste into Supabase
-- Dashboard -> SQL Editor -> New query -> Run.

create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null default '',
  message text not null,
  created_at timestamptz not null default now()
);
create index if not exists contact_messages_created_at_idx on contact_messages(created_at desc);

alter table contact_messages enable row level security;

drop policy if exists "public insert" on contact_messages;
create policy "public insert" on contact_messages for insert with check (true);
