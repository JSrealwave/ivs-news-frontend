import { getPublishedBriefs, briefItemKeyPoint, normalizeBriefItems } from "../../lib/briefs";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "../../lib/site";

export const revalidate = 3600;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const { briefs } = await getPublishedBriefs();
  const items = briefs.slice(0, 30);

  const rssItems = items
    .map((brief) => {
      const url = `${SITE_URL}/briefs/${brief.brief_date}`;
      const points = normalizeBriefItems(brief.items)
        .map((item, index) => {
          const title =
            (typeof item.title === "string" && item.title.trim()) ||
            `Signal ${index + 1}`;
          const keyPoint = briefItemKeyPoint(item);
          return keyPoint ? `${title}: ${keyPoint}` : title;
        })
        .slice(0, 6)
        .join(" ");

      const description = points || brief.title;
      const pubDate = new Date(`${brief.brief_date}T16:00:00Z`).toUTCString();

      return `    <item>
      <title>${escapeXml(brief.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(description)}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en-us</language>
${rssItems}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
