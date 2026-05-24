# Supabase — providers directory

## Migration

Apply `migrations/20260524120000_create_providers.sql` in the Supabase SQL editor, or:

```bash
npm run directory:migrate   # needs DATABASE_URL or SUPABASE_ACCESS_TOKEN
# or
supabase db push
```

## Seed

From the frontend repo (reads `../ivs_news/providers.json` by default):

```bash
npm run directory:seed
```

Requires `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (same as `ivs_news` pipeline).

## Static fallback (dev / offline)

```bash
npm run directory:fallback
```

Writes `data/directory-providers.json` for use when Supabase is unavailable.
