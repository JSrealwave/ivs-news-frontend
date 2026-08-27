import type { Metadata } from "next";

import NewsPageClient from "../../components/NewsPageClient";
import {
  ARTICLE_FEED_LIMIT,
  ARTICLE_SELECT_FIELDS,
  HIDDEN_ARTICLE_SOURCE,
  filterNewsArticles,
  newsFeedCutoffIso,
  type Article,
} from "../../lib/articles";
import { getLatestBrief } from "../../lib/briefs";
import { getSupabaseServerClient } from "../../lib/supabase/server";

export const metadata: Metadata = {
  title: "News",
  description:
    "Recent technical news and analysis for AI and edge video surveillance.",
};

export const revalidate = 60;

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
    .not("published_at", "is", null)
    .neq("source", HIDDEN_ARTICLE_SOURCE)
    .gte("published_at", newsFeedCutoffIso())
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(ARTICLE_FEED_LIMIT);

  if (error) {
    return {
      articles: [],
      initialLoadError: error.message,
    };
  }

  return {
    articles: filterNewsArticles((data ?? []) as Article[]),
    initialLoadError: null,
  };
}

export default async function NewsPage() {
  const [{ articles, initialLoadError }, latestBrief] = await Promise.all([
    getInitialArticles(),
    getLatestBrief(),
  ]);

  return (
    <NewsPageClient
      initialArticles={articles}
      initialLoadError={initialLoadError}
      latestBrief={latestBrief.brief}
    />
  );
}
