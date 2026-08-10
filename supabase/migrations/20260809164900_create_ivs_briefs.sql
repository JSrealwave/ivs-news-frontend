-- Daily IVS intelligence briefs (Grok Build / Tavily pipeline)
create extension if not exists "pgcrypto";

create table if not exists public.ivs_briefs (
  id uuid primary key default gen_random_uuid(),
  brief_date date unique not null,
  title text not null,
  source text not null default 'grok_build_tavily',
  markdown text not null,
  signal_level text,
  assessment_md text,
  items jsonb not null default '[]'::jsonb,
  entity_names text[] default '{}'::text[],
  published boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists ivs_briefs_brief_date_idx on public.ivs_briefs (brief_date desc);
create index if not exists ivs_briefs_published_idx on public.ivs_briefs (published);

alter table public.ivs_briefs enable row level security;

drop policy if exists "Public read published ivs_briefs" on public.ivs_briefs;

create policy "Public read published ivs_briefs"
  on public.ivs_briefs
  for select
  using (published = true);

create or replace function public.set_ivs_briefs_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists ivs_briefs_updated_at on public.ivs_briefs;

create trigger ivs_briefs_updated_at
  before update on public.ivs_briefs
  for each row
  execute function public.set_ivs_briefs_updated_at();
