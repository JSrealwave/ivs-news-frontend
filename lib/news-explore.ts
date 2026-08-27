import type { Article } from "./articles";
import {
  canonicalNewsUrl,
  filterAlsoNotedArticles,
  formatArticlePublishedDate,
  newsHostname,
} from "./articles";
import {
  briefItemSourceUrl,
  formatBriefedBadge,
} from "./brief-sources";
import {
  formatBriefDate,
  normalizeBriefItems,
  type IvsBriefRow,
} from "./briefs";
import { classifyNewsTopic, type NewsTopic } from "./news-topics";

export type NewsExploreItem = {
  id: string;
  title: string;
  url: string;
  canonicalUrl: string;
  domain: string;
  /** Sortable ISO timestamp; never created_at. */
  dateIso: string;
  dateLabel: string;
  topic: NewsTopic;
  briefedBadge: string | null;
  briefed: boolean;
  /** Search-only; not rendered on the card. */
  searchText: string;
};

function briefDateIso(briefDate: string): string {
  return `${briefDate}T12:00:00.000Z`;
}

function itemSearchText(
  title: string,
  domain: string,
  extra: (string | null | undefined)[],
): string {
  return [title, domain, ...extra]
    .filter((part): part is string => typeof part === "string" && part.trim().length > 0)
    .join(" ")
    .toLowerCase();
}

export function buildNewsExploreItems(
  briefs: IvsBriefRow[],
  articles: Article[],
): NewsExploreItem[] {
  const sortedBriefs = [...briefs].sort((a, b) =>
    b.brief_date.localeCompare(a.brief_date),
  );
  const seen = new Set<string>();
  const items: NewsExploreItem[] = [];

  for (const brief of sortedBriefs) {
    const rawItems = normalizeBriefItems(brief.items);
    rawItems.forEach((item, index) => {
      const url = briefItemSourceUrl(item);
      if (!url) return;
      const canonicalUrl = canonicalNewsUrl(url) || url;
      if (seen.has(canonicalUrl)) return;
      seen.add(canonicalUrl);

      const title =
        (typeof item.title === "string" && item.title.trim()) ||
        `Signal ${index + 1}`;
      const domain = newsHostname(url) || "source";
      const storedSummary =
        (typeof item.summary === "string" && item.summary) ||
        (typeof item.key_point === "string" && item.key_point) ||
        "";
      const topic = classifyNewsTopic(title, domain);
      items.push({
        id: `brief:${canonicalUrl}`,
        title,
        url,
        canonicalUrl,
        domain,
        dateIso: briefDateIso(brief.brief_date),
        dateLabel: formatBriefDate(brief.brief_date),
        topic,
        briefedBadge: formatBriefedBadge(brief.brief_date),
        briefed: true,
        searchText: itemSearchText(title, domain, [storedSummary]),
      });
    });
  }

  const alsoNoted = filterAlsoNotedArticles(articles, seen);
  for (const article of alsoNoted) {
    const canonicalUrl = canonicalNewsUrl(article.url) || article.url;
    if (seen.has(canonicalUrl)) continue;
    if (!article.published_at) continue;
    seen.add(canonicalUrl);
    const domain = newsHostname(article.url) || "source";
    const dateLabel = formatArticlePublishedDate(article.published_at);
    if (!dateLabel) continue;
    const topic = classifyNewsTopic(article.title, domain);
    items.push({
      id: article.id,
      title: article.title,
      url: article.url,
      canonicalUrl,
      domain,
      dateIso: article.published_at,
      dateLabel,
      topic,
      briefedBadge: null,
      briefed: false,
      searchText: itemSearchText(article.title, domain, [
        article.summary,
        ...(article.entities ?? []),
      ]),
    });
  }

  items.sort((a, b) => {
    const byDate = Date.parse(b.dateIso) - Date.parse(a.dateIso);
    if (byDate !== 0) return byDate;
    return a.title.localeCompare(b.title);
  });

  return items;
}

export function countNewsTopics(
  items: NewsExploreItem[],
): Record<"All" | NewsTopic, number> {
  const counts: Record<"All" | NewsTopic, number> = {
    All: items.length,
    LPR: 0,
    VMS: 0,
    Edge: 0,
    Policy: 0,
    Other: 0,
  };
  for (const item of items) {
    counts[item.topic] += 1;
  }
  return counts;
}
