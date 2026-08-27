import { newsHostname } from "./articles";
import { briefItemSourceUrl } from "./brief-sources";
import { normalizeBriefItems, type IvsBriefRow } from "./briefs";
import {
  DIRECTORY_CATEGORIES,
  type DirectoryCategoryFilter,
} from "./directory";
import {
  classifyNewsTopic,
  newsTopicQueryValue,
  type NewsTopic,
} from "./news-topics";

const EXPLORE_TOPIC_ORDER: Exclude<NewsTopic, "Other">[] = [
  "LPR",
  "VMS",
  "Edge",
  "Policy",
];

const NEWS_TO_DIRECTORY: Partial<
  Record<Exclude<NewsTopic, "Other">, DirectoryCategoryFilter>
> = {
  LPR: "LPR/OCR",
  VMS: "VMS",
  Edge: "Edge AI Hardware",
};

const MAX_EXPLORE_CHIPS = 3;
const MAX_DIRECTORY_CHIPS = 2;

export type ContinueExploreChip = {
  label: string;
  href: string;
};

export type ContinueDirectoryChip = {
  label: DirectoryCategoryFilter;
  href: string;
};

export type BriefContinueModel = {
  explore: ContinueExploreChip[];
  directory: ContinueDirectoryChip[];
};

function directoryFilterExists(
  filter: DirectoryCategoryFilter,
): boolean {
  return (DIRECTORY_CATEGORIES as readonly string[]).includes(filter);
}

export function topicsPresentInBrief(
  brief: IvsBriefRow,
): Exclude<NewsTopic, "Other">[] {
  const present = new Set<Exclude<NewsTopic, "Other">>();
  for (const item of normalizeBriefItems(brief.items)) {
    const title = typeof item.title === "string" ? item.title : "";
    const url = briefItemSourceUrl(item);
    const domain = url ? newsHostname(url) : "";
    const topic = classifyNewsTopic(title, domain);
    if (topic !== "Other") present.add(topic);
  }
  return EXPLORE_TOPIC_ORDER.filter((topic) => present.has(topic));
}

export function buildBriefContinue(brief: IvsBriefRow): BriefContinueModel | null {
  const topics = topicsPresentInBrief(brief);
  if (topics.length === 0) return null;

  const explore: ContinueExploreChip[] = topics
    .slice(0, MAX_EXPLORE_CHIPS)
    .map((topic) => ({
      label: topic,
      href: `/news?topic=${newsTopicQueryValue(topic)}`,
    }));

  const directory: ContinueDirectoryChip[] = [];
  for (const topic of topics) {
    if (directory.length >= MAX_DIRECTORY_CHIPS) break;
    const filter = NEWS_TO_DIRECTORY[topic];
    if (!filter || !directoryFilterExists(filter)) continue;
    if (directory.some((chip) => chip.label === filter)) continue;
    directory.push({
      label: filter,
      href: `/directory?category=${encodeURIComponent(filter)}`,
    });
  }

  return { explore, directory };
}
