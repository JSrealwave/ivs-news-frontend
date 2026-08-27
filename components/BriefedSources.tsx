import { ExternalLink } from "lucide-react";
import Link from "next/link";

import type { BriefedSourceGroup } from "../lib/brief-sources";

export default function BriefedSources({
  groups,
}: {
  groups: BriefedSourceGroup[];
}) {
  return (
    <section aria-labelledby="in-the-briefs-heading" className="mb-14">
      <h2
        id="in-the-briefs-heading"
        className="text-xl font-semibold tracking-tight text-white sm:text-2xl"
      >
        In the briefs
      </h2>
      {groups.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-400">
          No source links in the last 60 days of briefs.
        </p>
      ) : (
        <div className="mt-6 space-y-10">
          {groups.map((group) => (
            <div key={group.briefDate}>
              <h3 className="text-sm font-semibold tracking-tight text-zinc-200 sm:text-base">
                <Link
                  href={group.href}
                  className="hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
                >
                  {group.heading}
                </Link>
              </h3>
              <ul className="mt-3 divide-y divide-zinc-800 border-t border-zinc-800">
                {group.items.map((item) => (
                  <li key={item.canonicalUrl} className="py-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-ivs-entity="article"
                        className="min-w-0 text-base font-medium text-zinc-100 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
                      >
                        <span className="inline-flex items-start gap-2">
                          <span>{item.title}</span>
                          <ExternalLink
                            className="mt-1 size-3.5 shrink-0 text-zinc-500"
                            aria-hidden
                          />
                        </span>
                      </a>
                      <div className="flex shrink-0 flex-wrap items-center gap-2 text-xs text-zinc-500">
                        <span className="font-mono text-zinc-400">{item.domain}</span>
                        <span className="rounded-full border border-zinc-700 bg-zinc-900 px-2.5 py-0.5 text-zinc-300">
                          {item.badge}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
