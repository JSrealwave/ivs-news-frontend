import type { DirectoryProvider } from "./directory";
import { formatProviderLoadError } from "./provider-load-errors";
import { getSupabaseServerClient } from "./supabase/server";

export const PROVIDER_SELECT_FIELDS =
  "id,name,category,description,website,logo_url,thumbnail_url,status,updated_at";

export type ProviderRow = {
  id: string;
  name: string;
  category: string[] | null;
  description: string | null;
  website: string | null;
  logo_url: string | null;
  thumbnail_url: string | null;
  status: string;
  updated_at: string;
};

export function mapProviderRowToDirectory(row: ProviderRow): DirectoryProvider {
  return {
    id: row.id,
    name: row.name,
    categories: row.category ?? [],
    description: row.description ?? "",
    website: row.website ?? "",
    logoUrl: row.logo_url,
    thumbnailUrl: row.thumbnail_url,
  };
}

export type DirectoryProvidersResult = {
  providers: DirectoryProvider[];
  updatedAt: string;
  loadError: string | null;
  source: "supabase" | "static";
};

export async function getDirectoryProviders(): Promise<DirectoryProvidersResult> {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return {
      providers: [],
      updatedAt: new Date().toISOString().slice(0, 10),
      loadError:
        "Supabase is not configured. Add SUPABASE_URL/SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_URL/NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      source: "static",
    };
  }

  const { data, error } = await supabase
    .from("providers")
    .select(PROVIDER_SELECT_FIELDS)
    .eq("status", "active")
    .order("name", { ascending: true });

  if (error) {
    return {
      providers: [],
      updatedAt: new Date().toISOString().slice(0, 10),
      loadError: formatProviderLoadError(error.message),
      source: "static",
    };
  }

  const rows = (data ?? []) as ProviderRow[];

  if (rows.length === 0) {
    return {
      providers: [],
      updatedAt: new Date().toISOString().slice(0, 10),
      loadError:
        "No providers in Supabase yet. Run the migration and `npm run directory:seed`.",
      source: "static",
    };
  }

  const updatedAt =
    rows.reduce<string | null>((latest, row) => {
      if (!row.updated_at) return latest;
      if (!latest || row.updated_at > latest) return row.updated_at;
      return latest;
    }, null) ?? new Date().toISOString();

  return {
    providers: rows.map(mapProviderRowToDirectory),
    updatedAt,
    loadError: null,
    source: "supabase",
  };
}
