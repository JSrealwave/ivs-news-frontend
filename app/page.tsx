
import HomePageClient from "../components/HomePageClient";
import { ARTICLE_SELECT_FIELDS, type Article } from "../lib/articles";
import { getSupabaseServerClient } from "../lib/supabase/server";

export const revalidate = 3600;

async function getInitialArticles(): Promise<{
  articles: Article[];
  initialLoadError: string | null;
}> {
  const supabaseServer = getSupabaseServerClient();
  if (!supabaseServer) {
    return {
      articles: [],
      initialLoadError:
        "Supabase is not configured. Add SUPABASE_URL/SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_URL/NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    };
  }

  const { data, error } = await supabaseServer
    .from("ivs_articles")
    .select(ARTICLE_SELECT_FIELDS)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    return {
      articles: [],
      initialLoadError: error.message,
    };
  }

  return {
    articles: (data ?? []) as Article[],
    initialLoadError: null,
  };
}

export default async function Home() {
  const { articles, initialLoadError } = await getInitialArticles();
  return (
    <HomePageClient
      initialArticles={articles}
      initialLoadError={initialLoadError}
    />
  );
}