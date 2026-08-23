import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const globalForService = globalThis as typeof globalThis & {
  __ivsSupabaseServiceClient?: SupabaseClient | null;
};

/** Service-role client for password-gated analytics only. Never import from client components. */
export function getSupabaseServiceClient(): SupabaseClient | null {
  if (globalForService.__ivsSupabaseServiceClient !== undefined) {
    return globalForService.__ivsSupabaseServiceClient;
  }

  const supabaseUrl =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    globalForService.__ivsSupabaseServiceClient = null;
    return null;
  }

  globalForService.__ivsSupabaseServiceClient = createClient(
    supabaseUrl,
    serviceKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );

  return globalForService.__ivsSupabaseServiceClient;
}
