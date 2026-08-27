import {
  canonicalNewsUrl,
  newsHostname,
} from "./articles";
import {
  formatBriefDate,
  normalizeBriefItems,
  type IvsBriefItem,
  type IvsBriefRow,
} from "./briefs";

export type BriefedSource = {
  title: string;
  url: string;
  canonicalUrl: string;
  domain: string;
  briefDate: string;
  badge: string;
};

export type BriefedSourceGroup = {
  briefDate: string;
  heading: string;
  href: string;
  items: BriefedSource[];
};

export function formatBriefedBadge(briefDate: string): string {
  const date = new Date(`${briefDate}T12:00:00`);
  if (Number.isNaN(date.getTime())) return `Briefed ${briefDate}`;
  const label = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  return `Briefed ${label}`;
}

export function briefItemSourceUrl(item: IvsBriefItem): string | null {
  if (typeof item.url === "string" && item.url.trim()) {
    return item.url.trim();
  }
  return null;
}

export function collectBriefedSources(briefs: IvsBriefRow[]): {
  groups: BriefedSourceGroup[];
  canonicalUrls: string[];
} {
  const sorted = [...briefs].sort((a, b) =>
    b.brief_date.localeCompare(a.brief_date),
  );
  const seen = new Set<string>();
  const groups: BriefedSourceGroup[] = [];

  for (const brief of sorted) {
    const items: BriefedSource[] = [];
    const rawItems = normalizeBriefItems(brief.items);
    rawItems.forEach((item, index) => {
      const url = briefItemSourceUrl(item);
      if (!url) return;
      const canonicalUrl = canonicalNewsUrl(url);
      const key = canonicalUrl || url;
      if (seen.has(key)) return;
      seen.add(key);
      const title =
        (typeof item.title === "string" && item.title.trim()) ||
        `Signal ${index + 1}`;
      items.push({
        title,
        url,
        canonicalUrl: key,
        domain: newsHostname(url) || "source",
        briefDate: brief.brief_date,
        badge: formatBriefedBadge(brief.brief_date),
      });
    });
    if (items.length === 0) continue;
    groups.push({
      briefDate: brief.brief_date,
      heading: formatBriefDate(brief.brief_date),
      href: `/briefs/${brief.brief_date}`,
      items,
    });
  }

  return {
    groups,
    canonicalUrls: [...seen],
  };
}
