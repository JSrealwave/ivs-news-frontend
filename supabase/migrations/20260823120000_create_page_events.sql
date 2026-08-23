-- First-party page views, dwell, and outbound clicks.
create extension if not exists "pgcrypto";

create table if not exists public.page_events (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  path text not null,
  referrer text,
  event_type text not null check (event_type in ('view', 'dwell', 'outbound')),
  seconds integer,
  target_url text,
  entity_type text,
  entity_id text,
  created_at timestamptz not null default now()
);

create index if not exists page_events_created_at_idx
  on public.page_events (created_at desc);

create index if not exists page_events_event_type_idx
  on public.page_events (event_type);

create index if not exists page_events_path_idx
  on public.page_events (path);

alter table public.page_events enable row level security;

drop policy if exists "Anon insert page_events" on public.page_events;

create policy "Anon insert page_events"
  on public.page_events
  for insert
  to anon, authenticated
  with check (
    event_type in ('view', 'dwell', 'outbound')
    and char_length(session_id) between 8 and 80
    and char_length(path) between 1 and 500
  );
