-- Pass 1: hide junk articles without deleting them.
-- Production hide currently uses source='hidden' as the equivalent flag
-- because this migration needs a Postgres session (SQL editor / db push).
-- Apply when DATABASE_URL or the SQL editor is available, then backfill:
--   update public.ivs_articles set is_hidden = true where source = 'hidden';

alter table public.ivs_articles
  add column if not exists is_hidden boolean not null default false;

create index if not exists ivs_articles_is_hidden_idx
  on public.ivs_articles (is_hidden);
