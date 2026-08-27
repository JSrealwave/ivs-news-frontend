"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Grid3X3, List, Search } from "lucide-react";
import ArticleCard from "./ArticleCard";
import NewsBriefStrip from "./NewsBriefStrip";
import { PageContainer } from "./PageContainer";
import { getSupabaseClient } from "../lib/supabase/client";
import {
  ARTICLE_FEED_LIMIT,
  ARTICLE_SELECT_FIELDS,
  HIDDEN_ARTICLE_SOURCE,
  filterNewsArticles,
  newsFeedCutoffIso,
  type Article,
} from "../lib/articles";
import type { IvsBriefRow } from "../lib/briefs";

const categories = [
  "All",
  "CV_Technique",
  "Customer_Implementation",
  "Marketplace_News",
  "Market_Trend",
  "Use_Case",
];

async function fetchArticles(selectedCategory: string): Promise<Article[]> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase client not initialized. Check your env vars.");
  }

  let query = supabase
    .from("ivs_articles")
    .select(ARTICLE_SELECT_FIELDS)
    .not("published_at", "is", null)
    .neq("source", HIDDEN_ARTICLE_SOURCE)
    .gte("published_at", newsFeedCutoffIso())
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(ARTICLE_FEED_LIMIT);

  if (selectedCategory !== "All") {
    query = query.eq("category", selectedCategory);
  }

  const { data, error } = await query;
  if (error) throw error;

  return filterNewsArticles((data ?? []) as Article[]);
}

export default function NewsPageClient({
  initialArticles,
  initialLoadError,
  latestBrief = null,
}: {
  initialArticles: Article[];
  initialLoadError: string | null;
  latestBrief?: IvsBriefRow | null;
}) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: articles, isPending, error } = useQuery({
    queryKey: ["feed", "pass1", selectedCategory],
    queryFn: () => fetchArticles(selectedCategory),
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
    initialData: selectedCategory === "All" ? initialArticles : undefined,
    refetchOnMount: false,
  });

  const feedArticles = useMemo(() => {
    return articles ?? (selectedCategory === "All" ? initialArticles : []);
  }, [articles, initialArticles, selectedCategory]);
  const filteredArticles = useMemo(() => {
    const needle = searchQuery.trim().toLowerCase();
    if (!needle) return feedArticles;
    return feedArticles.filter((article) => {
      const title = article.title.toLowerCase();
      const summary = (article.summary ?? "").toLowerCase();
      return title.includes(needle) || summary.includes(needle);
    });
  }, [feedArticles, searchQuery]);
  const showFeedLoading = isPending && feedArticles.length === 0;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200">
      <PageContainer className="pb-16">
        <div className="mb-10 max-w-3xl sm:mb-12 lg:mb-14">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            IVS News
          </h1>
          <p className="mt-3 text-base text-zinc-400 sm:text-lg">
            Recent technical coverage for AI and edge video. Last 60 days.
            Dated articles only; the feed may be sparse.
          </p>
        </div>

        {latestBrief ? <NewsBriefStrip brief={latestBrief} /> : null}

        <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
          <aside
            className="lg:w-64 lg:shrink-0"
            aria-label="Article filters"
          >
            <div className="space-y-6">
              <div>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Search
                </h2>
                <label htmlFor="article-search" className="sr-only">
                  Search articles
                </label>
                <div className="relative">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-zinc-500"
                    aria-hidden
                  />
                  <input
                    id="article-search"
                    type="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search articles…"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-3 pl-11 pr-4 text-sm text-zinc-100 placeholder:text-zinc-500 focus-visible:border-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-blue-500/40"
                  />
                </div>
              </div>

              <div>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Categories
                </h2>
                <div
                  role="group"
                  aria-label="Filter by category"
                  className="flex flex-wrap gap-2 lg:flex-col lg:gap-1"
                >
                  {categories.map((cat) => {
                    const selected = selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        aria-pressed={selected}
                        className={[
                          "rounded-lg px-3 py-2 text-left text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400",
                          selected
                            ? "bg-white text-zinc-950"
                            : "text-zinc-300 hover:bg-zinc-800",
                        ].join(" ")}
                      >
                        {cat.replace("_", " ")}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>

          <main className="min-w-0 flex-1">
            <div className="mb-4 flex justify-end">
              <div
                className="flex gap-1.5 rounded-full bg-zinc-800 p-1"
                role="group"
                aria-label="View mode"
              >
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  aria-pressed={viewMode === "grid"}
                  aria-label="Grid view"
                  className={[
                    "rounded-full px-3.5 py-1.5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400",
                    viewMode === "grid"
                      ? "bg-white text-zinc-950"
                      : "text-zinc-400 hover:text-zinc-200",
                  ].join(" ")}
                >
                  <Grid3X3 size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  aria-pressed={viewMode === "list"}
                  aria-label="List view"
                  className={[
                    "rounded-full px-3.5 py-1.5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400",
                    viewMode === "list"
                      ? "bg-white text-zinc-950"
                      : "text-zinc-400 hover:text-zinc-200",
                  ].join(" ")}
                >
                  <List size={18} />
                </button>
              </div>
            </div>

            {showFeedLoading && (
              <div className="article-grid">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="h-[320px] animate-pulse rounded-2xl border border-zinc-700 bg-zinc-900"
                  />
                ))}
              </div>
            )}

            {initialLoadError && (
              <p className="py-20 text-left text-red-500">{initialLoadError}</p>
            )}

            {error && (
              <p className="py-20 text-left text-red-500">
                Failed to load articles: {error.message}
              </p>
            )}

            {!showFeedLoading &&
              !initialLoadError &&
              !error &&
              feedArticles.length === 0 && (
                <p className="py-12 text-left text-sm text-zinc-400">
                  No dated articles in the last 60 days.
                </p>
              )}

            {!showFeedLoading &&
              feedArticles.length > 0 &&
              filteredArticles.length === 0 && (
                <p className="py-12 text-left text-sm text-zinc-400">
                  No articles match your search.
                </p>
              )}

            {filteredArticles.length > 0 && (
              <div
                className={
                  viewMode === "grid"
                    ? "article-grid"
                    : "grid grid-cols-1 gap-0.5"
                }
              >
                {filteredArticles.map((article, index) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    viewMode={viewMode}
                    priorityImage={index < 12}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </PageContainer>
    </div>
  );
}
