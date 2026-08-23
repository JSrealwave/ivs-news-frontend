import type { Metadata } from "next";

import BriefsPageClient from "../../components/BriefsPageClient";
import { getPublishedBriefs } from "../../lib/briefs";

export const metadata: Metadata = {
  title: "Briefs",
  description:
    "Archive of weekday IVS / edge AI research briefs covering products, regulation, and market signals.",
};

export const revalidate = 3600;

export default async function BriefsIndexPage() {
  const { briefs, error } = await getPublishedBriefs();
  const selectedBrief = briefs[0] ?? null;

  return (
    <BriefsPageClient
      briefs={briefs.map((brief) => ({
        id: brief.id,
        brief_date: brief.brief_date,
        title: brief.title,
        signal_level: brief.signal_level,
      }))}
      selectedBrief={selectedBrief}
      loadError={error}
    />
  );
}
