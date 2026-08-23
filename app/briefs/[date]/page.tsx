import type { Metadata } from "next";
import { notFound } from "next/navigation";

import BriefsPageClient from "../../../components/BriefsPageClient";
import {
  formatBriefDate,
  getBriefByDate,
  getPublishedBriefs,
} from "../../../lib/briefs";

export const revalidate = 3600;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

type BriefPageProps = {
  params: Promise<{ date: string }>;
};

export async function generateMetadata({
  params,
}: BriefPageProps): Promise<Metadata> {
  const { date } = await params;
  if (!DATE_RE.test(date)) {
    return { title: "Brief not found | IVS News" };
  }

  const { brief } = await getBriefByDate(date);
  if (!brief) {
    return { title: "Brief not found | IVS News" };
  }

  const pageTitle = `${formatBriefDate(date)} brief`;
  const url = `/briefs/${date}`;

  return {
    title: pageTitle,
    description: brief.title,
    alternates: { canonical: url },
    openGraph: {
      title: `${pageTitle} | IVS News`,
      description: brief.title,
      url,
      type: "article",
    },
  };
}

export default async function BriefDetailPage({ params }: BriefPageProps) {
  const { date } = await params;
  if (!DATE_RE.test(date)) {
    notFound();
  }

  const [{ briefs, error }, { brief }] = await Promise.all([
    getPublishedBriefs(),
    getBriefByDate(date),
  ]);

  if (!brief) {
    notFound();
  }

  return (
    <BriefsPageClient
      briefs={briefs.map((row) => ({
        id: row.id,
        brief_date: row.brief_date,
        title: row.title,
        signal_level: row.signal_level,
      }))}
      selectedBrief={brief}
      loadError={error}
    />
  );
}
