import type { Metadata } from "next";

import NewsPageClient from "../../components/NewsPageClient";
import {
  ARTICLE_FEED_LIMIT,
  ARTICLE_SELECT_FIELDS,
  filterNewsArticles,
  type Article,
} from "../../lib/articles";
import {
  buildProviderLogoByHost,
  buildProviderLogoByName,
} from "../../lib/image-sources";
import { getDirectoryProviders } from "../../lib/providers";
import { getSupabaseServerClient } from "../../lib/supabase/server";

export const metadata: Metadata = {
  title: "News",
  description:
    "Recent technical news and analysis for AI and edge video surveillance.",
};

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
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
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
  const [{ articles, initialLoadError }, directory] = await Promise.all([
    getInitialArticles(),
    getDirectoryProviders(),
  ]);

  const providerLogoByHost = buildProviderLogoByHost(directory.providers);
  const providerLogoByName = buildProviderLogoByName(directory.providers);

  return (
    <NewsPageClient
      initialArticles={articles}
      initialLoadError={initialLoadError}
      providerLogoByHost={providerLogoByHost}
      providerLogoByName={providerLogoByName}
    />
  );
}
