const MIGRATION_RELATIVE_PATH =
  "supabase/migrations/20260524120000_create_providers.sql";

export function isProvidersTableMissingError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("schema cache") ||
    lower.includes("could not find the table") ||
    (lower.includes("relation") && lower.includes("does not exist")) ||
    lower.includes("public.providers")
  );
}

export function formatProviderLoadError(message: string): string {
  if (!isProvidersTableMissingError(message)) {
    return message;
  }

  return [
    "The `public.providers` table has not been created on your Supabase project yet.",
    `Apply the migration in Supabase Dashboard → SQL Editor (paste from ${MIGRATION_RELATIVE_PATH}), or run \`npm run directory:migrate\` if DATABASE_URL is set.`,
    "Then run `npm run directory:seed` from this repo.",
  ].join(" ");
}

export const PROVIDERS_MIGRATION_PATH = MIGRATION_RELATIVE_PATH;
