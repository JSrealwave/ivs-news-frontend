import Link from "next/link";

import type { BriefContinueModel } from "../lib/brief-continue";

function Chip({
  href,
  children,
}: {
  href: string;
  children: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-full border border-zinc-700 bg-zinc-950 px-2.5 py-1 text-xs font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
    >
      {children}
    </Link>
  );
}

export default function BriefContinueRow({
  model,
}: {
  model: BriefContinueModel;
}) {
  if (model.explore.length === 0) return null;

  return (
    <section
      aria-labelledby="brief-continue-heading"
      className="mt-6 border-t border-zinc-800 pt-5"
    >
      <h2
        id="brief-continue-heading"
        className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
      >
        Continue
      </h2>
      <div className="mt-3 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <p className="w-16 shrink-0 text-xs text-zinc-500">Explore</p>
          {model.explore.map((chip) => (
            <Chip key={chip.href} href={chip.href}>
              {chip.label}
            </Chip>
          ))}
        </div>
        {model.directory.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            <p className="w-16 shrink-0 text-xs text-zinc-500">Directory</p>
            {model.directory.map((chip) => (
              <Chip key={chip.href} href={chip.href}>
                {chip.label}
              </Chip>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
