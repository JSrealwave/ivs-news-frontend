import { ExternalLink } from "lucide-react";

import type { NewsExploreItem } from "../lib/news-explore";

const TOPIC_CHIP_CLASS: Record<NewsExploreItem["topic"], string> = {
  LPR: "border-sky-700/80 bg-sky-950/80 text-sky-200",
  VMS: "border-violet-700/80 bg-violet-950/80 text-violet-200",
  Edge: "border-emerald-700/80 bg-emerald-950/80 text-emerald-200",
  Policy: "border-amber-700/80 bg-amber-950/80 text-amber-200",
  Other: "border-zinc-700 bg-zinc-900 text-zinc-300",
};

export default function NewsExploreCard({ item }: { item: NewsExploreItem }) {
  return (
    <article className="border-b border-zinc-800 py-4 first:pt-0">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="min-w-0">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            data-ivs-entity="article"
            data-ivs-id={item.id}
            className="text-base font-semibold text-zinc-100 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 sm:text-lg"
          >
            <span className="inline-flex items-start gap-2">
              <span>{item.title}</span>
              <ExternalLink
                className="mt-1 size-3.5 shrink-0 text-zinc-500"
                aria-hidden
              />
            </span>
          </a>
          <p className="mt-1.5 font-mono text-xs text-zinc-500">{item.domain}</p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <time
            dateTime={item.dateIso}
            className="text-xs text-zinc-400 sm:text-sm"
          >
            {item.dateLabel}
          </time>
          <span
            className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${TOPIC_CHIP_CLASS[item.topic]}`}
          >
            {item.topic}
          </span>
          {item.briefedBadge ? (
            <span className="rounded-full border border-zinc-700 bg-zinc-900 px-2.5 py-0.5 text-xs text-zinc-300">
              {item.briefedBadge}
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
