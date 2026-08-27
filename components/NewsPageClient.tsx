"use client";

import ArticleCard from "./ArticleCard";
import BriefedSources from "./BriefedSources";
import NewsBriefStrip from "./NewsBriefStrip";
import { PageContainer } from "./PageContainer";
import type { Article } from "../lib/articles";
import type { BriefedSourceGroup } from "../lib/brief-sources";
import type { IvsBriefRow } from "../lib/briefs";

export default function NewsPageClient({
  alsoNoted,
  briefedGroups,
  initialLoadError,
  latestBrief = null,
}: {
  alsoNoted: Article[];
  briefedGroups: BriefedSourceGroup[];
  initialLoadError: string | null;
  latestBrief?: IvsBriefRow | null;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200">
      <PageContainer className="pb-16">
        <div className="mb-10 max-w-3xl sm:mb-12 lg:mb-14">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            IVS News
          </h1>
          <p className="mt-3 text-base text-zinc-400 sm:text-lg">
            Sources behind the weekday brief, plus a few items we noted but did
            not brief.
          </p>
        </div>

        {latestBrief ? <NewsBriefStrip brief={latestBrief} /> : null}

        <BriefedSources groups={briefedGroups} />

        {alsoNoted.length > 0 ? (
          <section aria-labelledby="also-noted-heading">
            <h2
              id="also-noted-heading"
              className="mb-6 text-xl font-semibold tracking-tight text-white sm:text-2xl"
            >
              Also noted
            </h2>
            {initialLoadError ? (
              <p className="text-sm text-red-500">{initialLoadError}</p>
            ) : (
              <div className="article-grid">
                {alsoNoted.map((article, index) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    viewMode="grid"
                    priorityImage={index < 6}
                  />
                ))}
              </div>
            )}
          </section>
        ) : null}
      </PageContainer>
    </div>
  );
}
