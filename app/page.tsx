import HomeHubClient from "../components/HomeHubClient";
import { getLatestBrief } from "../lib/briefs";

export const revalidate = 3600;

export default async function Home() {
  const { brief: latestBrief, error } = await getLatestBrief();

  return <HomeHubClient latestBrief={latestBrief} loadError={error} />;
}
