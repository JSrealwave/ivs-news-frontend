import type { MetadataRoute } from "next";

import { getPublishedBriefs } from "../lib/briefs";
import { SITE_URL } from "../lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { briefs } = await getPublishedBriefs();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/briefs`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/news`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/directory`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const briefRoutes: MetadataRoute.Sitemap = briefs.map((brief) => ({
    url: `${SITE_URL}/briefs/${brief.brief_date}`,
    lastModified: brief.updated_at ? new Date(brief.updated_at) : brief.brief_date,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...briefRoutes];
}
