-- Pass 2: mark articles that appeared in a weekday brief.
-- Safe to apply after 20260827140000_add_ivs_articles_is_hidden.sql.
-- Live hide flag remains source='hidden' until is_hidden is applied.

alter table public.ivs_articles
  add column if not exists is_hidden boolean not null default false;

alter table public.ivs_articles
  add column if not exists featured_in_brief_date date;

create index if not exists ivs_articles_is_hidden_idx
  on public.ivs_articles (is_hidden);

create index if not exists ivs_articles_featured_in_brief_date_idx
  on public.ivs_articles (featured_in_brief_date);

update public.ivs_articles
  set is_hidden = true
  where source = 'hidden' and is_hidden is not true;
