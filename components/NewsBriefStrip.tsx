import Link from "next/link";

import {
  briefSignalPillClass,
  formatBriefDate,
  normalizeBriefItems,
  type IvsBriefRow,
} from "../lib/briefs";

export default function NewsBriefStrip({ brief }: { brief: IvsBriefRow }) {
  const items = normalizeBriefItems(brief.items)
    .map((item, index) => {
      const title =
        (typeof item.title === "string" && item.title.trim()) ||
        `Signal ${index + 1}`;
      return title;
    })
    .filter(Boolean);
  const signal = brief.signal_level?.trim() || null;
  const href = `/briefs/${brief.brief_date}`;
  const dateLabel = formatBriefDate(brief.brief_date);

  return (
    <section
      aria-labelledby="news-brief-strip-heading"
      className="mb-10 overflow-hidden rounded-2xl border border-zinc-700/80 bg-zinc-900/70 sm:mb-12"
    >
      <div aria-hidden className="h-0.5 w-full bg-blue-600" />
      <div className="px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Latest brief
            </p>
            <h2
              id="news-brief-strip-heading"
              className="mt-1 text-lg font-semibold tracking-tight text-white sm:text-xl"
            >
              <Link
                href={href}
                className="hover:text-zinc-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
              >
                {dateLabel}
              </Link>
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {signal && (
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${briefSignalPillClass(signal)}`}
              >
                {signal}
              </span>
            )}
            <Link
              href={href}
              className="rounded-full border border-zinc-600 px-3 py-1 text-xs font-medium text-zinc-200 transition hover:border-zinc-400 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
            >
              Open brief
            </Link>
          </div>
        </div>

        {items.length > 0 && (
          <ol className="mt-4 space-y-1.5 border-t border-zinc-800 pt-4">
            {items.map((title, index) => (
              <li
                key={`${title}-${index}`}
                className="flex items-start gap-3 text-sm text-zinc-300 sm:text-base"
              >
                <span className="w-5 shrink-0 pt-0.5 font-mono text-xs text-zinc-500">
                  {index + 1}
                </span>
                <span className="min-w-0">{title}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
