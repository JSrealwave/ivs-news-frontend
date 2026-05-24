import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const globalForSupabase = globalThis as typeof globalThis & {
  __ivsSupabaseServerClient?: SupabaseClient | null;
};

/**
 * Server Supabase client singleton (cached on globalThis for dev HMR).
 */
export function getSupabaseServerClient(): SupabaseClient | null {
  if (globalForSupabase.__ivsSupabaseServerClient !== undefined) {
    return globalForSupabase.__ivsSupabaseServerClient;
  }

  const supabaseUrl =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    globalForSupabase.__ivsSupabaseServerClient = null;
    return null;
  }

  globalForSupabase.__ivsSupabaseServerClient = createClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );

  return globalForSupabase.__ivsSupabaseServerClient;
}
