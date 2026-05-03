
import HomePageClient, { type Article } from "../components/HomePageClient";
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
    .select(
      "id,title,summary,url,category,score_relevance,score_technical,score_compelling,created_at"
    )
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