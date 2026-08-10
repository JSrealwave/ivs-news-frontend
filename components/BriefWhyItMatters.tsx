"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

import { parseAssessmentMd } from "../lib/briefs";

function AssessmentBlock({
  label,
  body,
}: {
  label: string;
  body: string;
}) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
        {label}
      </h3>
      <p className="mt-1.5 text-sm leading-relaxed text-zinc-300 sm:text-base">
        {body}
      </p>
    </div>
  );
}

export default function BriefWhyItMatters({
  assessmentMd,
}: {
  assessmentMd: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const assessment = parseAssessmentMd(assessmentMd);

  const sections: { label: string; body: string }[] = [];
  if (assessment.signalLevel) {
    sections.push({ label: "Signal level", body: assessment.signalLevel });
  }
  if (assessment.notableTrends) {
    sections.push({ label: "Notable trends", body: assessment.notableTrends });
  }
  if (assessment.gaps) {
    sections.push({ label: "Gaps", body: assessment.gaps });
  }
  for (const row of assessment.other) {
    sections.push(row);
  }
  if (sections.length === 0 && assessment.plainFallback) {
    sections.push({ label: "Assessment", body: assessment.plainFallback });
  }

  if (sections.length === 0) return null;

  const previewSource = sections[0]?.body ?? "";
  const preview =
    previewSource.length > 160
      ? `${previewSource.slice(0, 160).trimEnd()}…`
      : previewSource;

  return (
    <div className="mt-4 border-t border-zinc-800 pt-4">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
        className="flex w-full items-center justify-between gap-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400 transition hover:text-zinc-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
      >
        <span>Why it matters</span>
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {expanded ? (
        <div className="mt-3 space-y-4">
          {sections.map((section) => (
            <AssessmentBlock
              key={section.label}
              label={section.label}
              body={section.body}
            />
          ))}
        </div>
      ) : (
        <p className="mt-2 text-sm leading-relaxed text-zinc-300 sm:text-base">
          <span className="font-medium text-zinc-400">
            {sections[0]?.label}:{" "}
          </span>
          {preview}
        </p>
      )}
    </div>
  );
}
