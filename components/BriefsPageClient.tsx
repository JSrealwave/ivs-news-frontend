"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";

import BriefContinueRow from "./BriefContinueRow";
import {
  briefItemKeyPoint,
  briefItemSourceLabel,
  briefSignalPillClass,
  formatBriefDate,
  normalizeBriefItems,
  parseAssessmentMd,
  splitNumberedAssessmentPoints,
  type IvsBriefRow,
} from "../lib/briefs";
import { buildBriefContinue } from "../lib/brief-continue";
import { PageContainer } from "./PageContainer";

export type BriefSidebarItem = {
  id: string;
  brief_date: string;
  title: string;
  signal_level: string | null;
};

function formatBriefDateShort(briefDate: string): string {
  const date = new Date(`${briefDate}T12:00:00`);
  if (Number.isNaN(date.getTime())) return briefDate;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function AssessmentBlock({
  label,
  body,
}: {
  label: string;
  body: string;
}) {
  const isSignalLevel = label.toLowerCase().includes("signal");
  const points = isSignalLevel ? [body] : splitNumberedAssessmentPoints(body);
  const asList = !isSignalLevel && points.length >= 2;

  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
        {label}
      </h3>
      {asList ? (
        <ol className="mt-2 list-decimal space-y-2 pl-5 text-base leading-relaxed text-zinc-300">
          {points.map((point, index) => (
            <li key={`${label}-${index}`}>{point}</li>
          ))}
        </ol>
      ) : (
        <p className="mt-1.5 text-base leading-relaxed text-zinc-300">{body}</p>
      )}
    </div>
  );
}

function BriefDetail({
  brief,
  showContinue = false,
}: {
  brief: IvsBriefRow;
  showContinue?: boolean;
}) {
  const items = normalizeBriefItems(brief.items).filter((item) => {
    const title = typeof item.title === "string" ? item.title.trim() : "";
    return Boolean(title || briefItemKeyPoint(item));
  });
  const signal = brief.signal_level?.trim() || null;
  const assessmentRaw = brief.assessment_md?.trim() || "";
  const assessment = assessmentRaw ? parseAssessmentMd(assessmentRaw) : null;

  const assessmentSections: { label: string; body: string }[] = [];
  if (assessment?.signalLevel) {
    assessmentSections.push({
      label: "Signal level",
      body: assessment.signalLevel,
    });
  }
  if (assessment?.notableTrends) {
    assessmentSections.push({
      label: "Notable trends",
      body: assessment.notableTrends,
    });
  }
  if (assessment?.gaps) {
    assessmentSections.push({ label: "Gaps", body: assessment.gaps });
  }
  if (assessment) {
    for (const row of assessment.other) {
      assessmentSections.push(row);
    }
    if (assessmentSections.length === 0 && assessment.plainFallback) {
      assessmentSections.push({
        label: "Assessment",
        body: assessment.plainFallback,
      });
    }
  }

  const continueModel = showContinue ? buildBriefContinue(brief) : null;

  return (
    <article className="overflow-hidden rounded-2xl border border-zinc-700/80 bg-zinc-900/70">
      <div aria-hidden className="h-0.5 w-full bg-blue-600" />

      <div className="px-5 py-6 sm:px-7 sm:py-8">
        <header>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            IVS Briefs
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <time
              dateTime={brief.brief_date}
              className="rounded-full border border-zinc-700 bg-zinc-950/60 px-3 py-1 font-mono text-xs text-zinc-300 sm:text-sm"
            >
              {formatBriefDate(brief.brief_date)}
            </time>
            {signal && (
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide sm:text-sm ${briefSignalPillClass(signal)}`}
              >
                {signal}
              </span>
            )}
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {brief.title}
          </h1>
        </header>

        {assessmentSections.length > 0 && (
          <section className="mt-6 border-t border-zinc-800 pt-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Overall assessment
            </h2>
            <div className="mt-4 space-y-4">
              {assessmentSections.map((section) => (
                <AssessmentBlock
                  key={section.label}
                  label={section.label}
                  body={section.body}
                />
              ))}
            </div>
          </section>
        )}

        <section className="mt-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Signals ({items.length})
          </h2>

          {items.length === 0 ? (
            <p className="mt-4 text-base text-zinc-400">
              No structured items for this brief.
            </p>
          ) : (
            <ol className="mt-2 divide-y divide-zinc-800 border-t border-zinc-800">
              {items.map((item, index) => {
                const title =
                  (typeof item.title === "string" && item.title.trim()) ||
                  `Signal ${index + 1}`;
                const keyPoint = briefItemKeyPoint(item);
                const why =
                  typeof item.why_it_matters === "string"
                    ? item.why_it_matters.trim()
                    : "";
                const url =
                  typeof item.url === "string" && item.url.trim()
                    ? item.url.trim()
                    : null;
                const sourceLabel = briefItemSourceLabel(item);

                return (
                  <li key={`${title}-${index}`} className="py-5 first:pt-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <span className="w-6 shrink-0 pt-0.5 font-mono text-sm text-zinc-500">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-lg font-semibold tracking-tight text-white sm:text-xl">
                            {title}
                          </h3>
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
                              <ExternalLink
                                className="size-4"
                                aria-hidden
                              />
                            </a>
                          )}
                        </div>

                        {keyPoint && (
                          <div className="mt-3">
                            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                              Key point
                            </p>
                            <p className="mt-1.5 text-base leading-relaxed text-zinc-300">
                              {keyPoint}
                            </p>
                          </div>
                        )}

                        {why && (
                          <div className="mt-3">
                            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                              Why it matters
                            </p>
                            <p className="mt-1.5 text-base leading-relaxed text-zinc-300">
                              {why}
                            </p>
                          </div>
                        )}

                        {(url || sourceLabel) && (
                          <div className="mt-4">
                            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                              Source
                            </p>
                            {url ? (
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                data-ivs-entity="brief"
                                data-ivs-id={brief.id}
                                className="mt-2 inline-flex max-w-full items-center gap-2 text-sm font-medium text-zinc-300 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
                              >
                                <ExternalLink
                                  className="size-4 shrink-0"
                                  aria-hidden
                                />
                                <span className="truncate">
                                  {sourceLabel ?? "View source"}
                                </span>
                              </a>
                            ) : (
                              <p className="mt-2 text-sm text-zinc-400">
                                {sourceLabel}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </section>

        {continueModel ? <BriefContinueRow model={continueModel} /> : null}
      </div>
    </article>
  );
}

export default function BriefsPageClient({
  briefs,
  selectedBrief,
  loadError = null,
  showContinue = false,
}: {
  briefs: BriefSidebarItem[];
  selectedBrief: IvsBriefRow | null;
  loadError?: string | null;
  showContinue?: boolean;
}) {
  const selectedDate = selectedBrief?.brief_date ?? null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200">
      <PageContainer className="pb-16">
        {loadError && (
          <p className="mb-6 text-sm text-red-400">
            Failed to load briefs: {loadError}
          </p>
        )}

        {!loadError && briefs.length === 0 && (
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              IVS Briefs
            </h1>
            <p className="mt-3 text-base text-zinc-400 sm:text-lg">
              No briefs published yet.
            </p>
          </div>
        )}

        {briefs.length > 0 && (
          <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
            <aside className="lg:w-64 lg:shrink-0" aria-label="Brief archive">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Archive
              </h2>
              <nav
                aria-label="Prior briefs"
                className="flex flex-wrap gap-2 lg:flex-col lg:gap-1"
              >
                {briefs.map((brief) => {
                  const selected = brief.brief_date === selectedDate;
                  return (
                    <Link
                      key={brief.id}
                      href={`/briefs/${brief.brief_date}`}
                      aria-current={selected ? "page" : undefined}
                      className={[
                        "rounded-lg px-3 py-2 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400",
                        selected
                          ? "bg-white text-zinc-950"
                          : "text-zinc-300 hover:bg-zinc-800 hover:text-white",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "block font-mono text-xs",
                          selected ? "text-zinc-600" : "text-zinc-500",
                        ].join(" ")}
                      >
                        {formatBriefDateShort(brief.brief_date)}
                      </span>
                      <span className="mt-0.5 block truncate text-sm font-medium">
                        {brief.title}
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </aside>

            <main className="min-w-0 flex-1">
              {selectedBrief ? (
                <BriefDetail
                  brief={selectedBrief}
                  showContinue={showContinue}
                />
              ) : (
                <p className="text-base text-zinc-400">
                  Select a brief from the archive.
                </p>
              )}
            </main>
          </div>
        )}
      </PageContainer>
    </div>
  );
}
