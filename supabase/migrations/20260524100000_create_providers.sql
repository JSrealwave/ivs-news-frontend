-- Providers directory table for IVS News
create extension if not exists "uuid-ossp";

create table if not exists providers (
  id uuid primary key default uuid_generate_v4(),
  name text unique not null,
  category text[],
  description text,
  website text,
  logo_url text,
  thumbnail_url text,
  status text default 'active' check (status in ('active', 'pending', 'rejected')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace function public.set_providers_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists providers_set_updated_at on public.providers;

create trigger providers_set_updated_at
  before update on public.providers
  for each row
  execute function public.set_providers_updated_at();

alter table public.providers enable row level security;

drop policy if exists "Public read active providers" on public.providers;

create policy "Public read active providers"
  on public.providers
  for select
  using (status = 'active');
