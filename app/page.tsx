import type { Metadata } from "next";

import HomeHubClient from "../components/HomeHubClient";
import { getLatestBrief } from "../lib/briefs";
import { SITE_DESCRIPTION, SITE_NAME } from "../lib/site";

export const metadata: Metadata = {
  title: { absolute: `${SITE_NAME} — Weekday brief on AI and edge video` },
  description: SITE_DESCRIPTION,
};

export const revalidate = 3600;

export default async function Home() {
  const { brief: latestBrief, error } = await getLatestBrief();

  return <HomeHubClient latestBrief={latestBrief} loadError={error} />;
}
