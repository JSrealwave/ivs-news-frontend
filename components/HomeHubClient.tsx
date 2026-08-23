import Link from "next/link";

import type { IvsBriefRow } from "../lib/briefs";
import { SITE_TAGLINE, SUBSCRIBE_URL } from "../lib/site";
import { PageContainer } from "./PageContainer";
import TodaysBrief from "./TodaysBrief";

export default function HomeHubClient({
  latestBrief,
  loadError = null,
}: {
  latestBrief: IvsBriefRow | null;
  loadError?: string | null;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200">
      <PageContainer className="pb-16">
        <section className="mb-8 max-w-3xl sm:mb-10">
          <p className="text-base text-zinc-400 sm:text-lg">{SITE_TAGLINE}</p>
          <p className="mt-2 text-sm text-zinc-500">
            Free, source-linked, not a lab.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <a
              href={SUBSCRIBE_URL}
              data-ivs-entity="subscribe"
              className="inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
            >
              Get the weekday brief
            </a>
            <Link
              href="/news"
              className="text-sm font-medium text-zinc-400 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
            >
              News
            </Link>
            <Link
              href="/directory"
              className="text-sm font-medium text-zinc-400 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
            >
              Directory
            </Link>
          </div>
        </section>

        {loadError && (
          <p className="mb-6 text-sm text-red-400">
            Failed to load brief: {loadError}
          </p>
        )}

        {latestBrief ? (
          <TodaysBrief brief={latestBrief} />
        ) : (
          !loadError && (
            <section className="overflow-hidden rounded-2xl border border-zinc-700/80 bg-zinc-900/70">
              <div aria-hidden className="h-0.5 w-full bg-blue-600" />
              <div className="px-5 py-8 sm:px-7 sm:py-10">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Latest brief
                </p>
                <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  No brief published yet
                </h1>
                <p className="mt-3 max-w-2xl text-base text-zinc-400">
                  Daily IVS research briefs will appear here when available.
                </p>
                <Link
                  href="/briefs"
                  className="mt-6 inline-flex items-center rounded-full bg-white px-3.5 py-1.5 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
                >
                  Browse briefs archive
                </Link>
              </div>
            </section>
          )
        )}
      </PageContainer>
    </div>
  );
}
