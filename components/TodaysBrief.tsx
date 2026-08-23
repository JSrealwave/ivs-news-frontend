import { ExternalLink } from "lucide-react";
import Link from "next/link";

import BriefWhyItMatters from "./BriefWhyItMatters";
import {
  briefItemKeyPoint,
  briefSignalPillClass,
  formatBriefDate,
  normalizeBriefItems,
  type IvsBriefRow,
} from "../lib/briefs";

export default function TodaysBrief({ brief }: { brief: IvsBriefRow }) {
  const items = normalizeBriefItems(brief.items).filter((item) => {
    const title = typeof item.title === "string" ? item.title.trim() : "";
    return Boolean(title || briefItemKeyPoint(item));
  });

  const dateLabel = formatBriefDate(brief.brief_date);
  const signal = brief.signal_level?.trim() || null;

  return (
    <section
      aria-labelledby="todays-brief-heading"
      className="overflow-hidden rounded-2xl border border-zinc-700/80 bg-zinc-900/70"
    >
      <div aria-hidden className="h-0.5 w-full bg-blue-600" />

      <div className="px-5 py-6 sm:px-7 sm:py-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Latest brief
            </p>
            <h1
              id="todays-brief-heading"
              className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
            >
              {brief.title}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <time
              dateTime={brief.brief_date}
              className="rounded-full border border-zinc-700 bg-zinc-950/60 px-3 py-1 font-mono text-xs text-zinc-300 sm:text-sm"
            >
              {dateLabel}
            </time>
            {signal && (
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide sm:text-sm ${briefSignalPillClass(signal)}`}
              >
                {signal}
              </span>
            )}
          </div>
        </div>

        {items.length > 0 ? (
          <ol className="mt-6 divide-y divide-zinc-800 border-t border-zinc-800">
            {items.map((item, index) => {
              const title =
                (typeof item.title === "string" && item.title.trim()) ||
                `Signal ${index + 1}`;
              const keyPoint = briefItemKeyPoint(item);
              const url =
                typeof item.url === "string" && item.url.trim()
                  ? item.url.trim()
                  : null;

              return (
                <li key={`${title}-${index}`} className="py-4 first:pt-5">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <span className="w-6 shrink-0 pt-0.5 font-mono text-sm text-zinc-500">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-base font-semibold text-zinc-100 sm:text-lg">
                          {title}
                        </p>
                        {url && (
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            data-ivs-entity="brief"
                            data-ivs-id={brief.id}
                            aria-label={`Open source for ${title}`}
                            className="shrink-0 rounded-lg border border-zinc-700 bg-zinc-950 p-2 text-zinc-300 transition hover:border-zinc-500 hover:text-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
                          >
                            <ExternalLink className="size-4" aria-hidden />
                          </a>
                        )}
                      </div>
                      {keyPoint && (
                        <p className="mt-1.5 text-sm leading-relaxed text-zinc-300 sm:text-base">
                          {keyPoint}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="mt-6 text-base text-zinc-400">
            Brief published — open the full write-up for details.
          </p>
        )}

        {brief.assessment_md?.trim() && (
          <BriefWhyItMatters assessmentMd={brief.assessment_md} />
        )}

        <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-zinc-800 pt-5">
          <Link
            href={`/briefs/${brief.brief_date}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
          >
            Read full brief
          </Link>
        </div>
      </div>
    </section>
  );
}
