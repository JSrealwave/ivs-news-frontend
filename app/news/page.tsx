import type { Metadata } from "next";

import NewsPageClient from "../../components/NewsPageClient";
import {
  ARTICLE_FEED_LIMIT,
  ARTICLE_SELECT_FIELDS,
  HIDDEN_ARTICLE_SOURCE,
  newsFeedCutoffDate,
  newsFeedCutoffIso,
  type Article,
} from "../../lib/articles";
import { buildNewsExploreItems } from "../../lib/news-explore";
import { getPublishedBriefs } from "../../lib/briefs";
import { getSupabaseServerClient } from "../../lib/supabase/server";

export const metadata: Metadata = {
  title: "News",
  description: "Explore IVS coverage by topic. Last 60 days.",
};

export const revalidate = 60;

async function getVisibleArticles(): Promise<Article[]> {
  const supabaseServer = getSupabaseServerClient();
  if (!supabaseServer) return [];

  const { data, error } = await supabaseServer
    .from("ivs_articles")
    .select(ARTICLE_SELECT_FIELDS)
    .not("published_at", "is", null)
    .neq("source", HIDDEN_ARTICLE_SOURCE)
    .gte("published_at", newsFeedCutoffIso())
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(ARTICLE_FEED_LIMIT);

  if (error) return [];
  return (data ?? []) as Article[];
}

export default async function NewsPage() {
  const [articles, published] = await Promise.all([
    getVisibleArticles(),
    getPublishedBriefs({ sinceDate: newsFeedCutoffDate() }),
  ]);

  const items = buildNewsExploreItems(published.briefs, articles);

  return <NewsPageClient items={items} />;
}
