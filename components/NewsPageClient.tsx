"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import NewsExploreCard from "./NewsExploreCard";
import { PageContainer } from "./PageContainer";
import type { NewsExploreItem } from "../lib/news-explore";
import {
  NEWS_TOPIC_FILTERS,
  newsTopicQueryValue,
  type NewsTopicFilter,
} from "../lib/news-topics";

export default function NewsPageClient({
  items,
  topic,
}: {
  items: NewsExploreItem[];
  topic: NewsTopicFilter;
}) {
  const [query, setQuery] = useState("");
  const [briefedOnly, setBriefedOnly] = useState(false);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter((item) => {
      if (briefedOnly && !item.briefed) return false;
      if (topic !== "All" && item.topic !== topic) return false;
      if (!needle) return true;
      return item.searchText.includes(needle) || item.title.toLowerCase().includes(needle);
    });
  }, [briefedOnly, items, query, topic]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200">
      <PageContainer className="pb-16">
        <div className="mb-8 max-w-3xl sm:mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            IVS News
          </h1>
          <p className="mt-3 text-base text-zinc-400 sm:text-lg">
            Explore coverage by topic. Last 60 days.
          </p>
        </div>

        <div className="mb-8 flex flex-col gap-4">
          <label htmlFor="news-explore-search" className="sr-only">
            Search coverage
          </label>
          <div className="relative max-w-xl">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-zinc-500"
              aria-hidden
            />
            <input
              id="news-explore-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search titles and sources…"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-3 pl-11 pr-4 text-sm text-zinc-100 placeholder:text-zinc-500 focus-visible:border-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-blue-500/40"
            />
          </div>

          <div
            role="group"
            aria-label="Topic"
            className="flex flex-wrap gap-2"
          >
            {NEWS_TOPIC_FILTERS.map((filter) => {
              const selected = topic === filter;
              const href =
                filter === "All"
                  ? "/news"
                  : `/news?topic=${newsTopicQueryValue(filter)}`;
              return (
                <Link
                  key={filter}
                  href={href}
                  scroll={false}
                  aria-current={selected ? "page" : undefined}
                  className={[
                    "rounded-full px-3 py-1.5 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400",
                    selected
                      ? "bg-white text-zinc-950"
                      : "border border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-600 hover:text-white",
                  ].join(" ")}
                >
                  {filter}
                </Link>
              );
            })}
          </div>

          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-zinc-400">
            <input
              type="checkbox"
              checked={briefedOnly}
              onChange={(event) => setBriefedOnly(event.target.checked)}
              className="size-4 rounded border-zinc-600 bg-zinc-900 text-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
            />
            Briefed only
          </label>
        </div>

        <p className="mb-4 text-xs text-zinc-500">
          {visible.length} {visible.length === 1 ? "item" : "items"}
        </p>

        {visible.length === 0 ? (
          <p className="border-t border-zinc-800 py-12 text-sm text-zinc-400">
            No items match this search and topic.
          </p>
        ) : (
          <div className="border-t border-zinc-800 pt-4">
            {visible.map((item) => (
              <NewsExploreCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </PageContainer>
    </div>
  );
}
