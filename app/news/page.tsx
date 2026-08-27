import type { Metadata } from "next";

import NewsPageClient from "../../components/NewsPageClient";
import {
  ARTICLE_FEED_LIMIT,
  ARTICLE_SELECT_FIELDS,
  HIDDEN_ARTICLE_SOURCE,
  filterAlsoNotedArticles,
  newsFeedCutoffDate,
  newsFeedCutoffIso,
  type Article,
} from "../../lib/articles";
import { collectBriefedSources } from "../../lib/brief-sources";
import { getLatestBrief, getPublishedBriefs } from "../../lib/briefs";
import { getSupabaseServerClient } from "../../lib/supabase/server";

export const metadata: Metadata = {
  title: "News",
  description:
    "Sources behind the weekday IVS brief, plus a few items noted but not briefed.",
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
    articles: (data ?? []) as Article[],
    initialLoadError: null,
  };
}

export default async function NewsPage() {
  const cutoffDate = newsFeedCutoffDate();
  const [{ articles, initialLoadError }, latestBrief, published] =
    await Promise.all([
      getInitialArticles(),
      getLatestBrief(),
      getPublishedBriefs({ sinceDate: cutoffDate }),
    ]);

  const briefed = collectBriefedSources(published.briefs);
  const alsoNoted = filterAlsoNotedArticles(articles, briefed.canonicalUrls);

  return (
    <NewsPageClient
      alsoNoted={alsoNoted}
      briefedGroups={briefed.groups}
      initialLoadError={initialLoadError}
      latestBrief={latestBrief.brief}
    />
  );
}
