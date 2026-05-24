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

create index if not exists providers_status_idx on providers (status);
create index if not exists providers_name_idx on providers (name);

alter table providers enable row level security;

create policy "Public read active providers"
  on providers
  for select
  using (status = 'active');

create or replace function public.set_providers_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists providers_updated_at on providers;

create trigger providers_updated_at
  before update on providers
  for each row
  execute function public.set_providers_updated_at();
