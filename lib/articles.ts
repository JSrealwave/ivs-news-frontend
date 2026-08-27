export interface Article {
  id: string;
  title: string;
  summary: string | null;
  url: string;
  image: string | null;
  published_at: string | null;
  entities?: string[] | null;
  category: string;
  score_relevance: number;
  score_technical: number;
  score_compelling: number;
  created_at: string;
  source?: string | null;
}

export const ARTICLE_SELECT_FIELDS =
  "id,title,summary,url,image,published_at,entities,category,score_relevance,score_technical,score_compelling,created_at,source";

export const ARTICLE_FEED_LIMIT = 80;
export const ARTICLE_MAX_AGE_DAYS = 60;
export const HIDDEN_ARTICLE_SOURCE = "hidden";
export const FORASOFT_VISIBLE_CAP = 2;

const JUNK_TITLE_EXACT = new Set([
  "introduction",
  "abstract",
  "introduction — vss",
  "introduction - vss",
  "introduction – vss",
]);

const CFP_TITLE_RE =
  /premier conference for innovators|call for papers|call for proposals|call-proposals/i;

const ICON_IMAGE_RE =
  /apple-touch-icon|favicon|msapplication|mstile|android-chrome|safari-pinned-tab|apple-icon/i;

const PATH_SIZE_RE = /(?:^|[^\d])(\d{2,3})x(\d{2,3})(?:[^\d]|$)/i;

export function newsFeedCutoffIso(days = ARTICLE_MAX_AGE_DAYS): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString();
}

/** UTC calendar date (YYYY-MM-DD) for the same 60-day window as the article feed. */
export function newsFeedCutoffDate(days = ARTICLE_MAX_AGE_DAYS): string {
  return newsFeedCutoffIso(days).slice(0, 10);
}

export function canonicalNewsUrl(url: string | null | undefined): string {
  if (!url?.trim()) return "";
  try {
    const parsed = new URL(url.trim());
    let host = parsed.hostname.toLowerCase();
    if (host.startsWith("www.")) host = host.slice(4);
    parsed.hostname = host;
    parsed.hash = "";
    const path = parsed.pathname.replace(/\/+$/, "") || "/";
    parsed.pathname = path;
    const arxiv = host.match(/(?:^|\.)arxiv\.org$/);
    if (arxiv) {
      const idMatch = parsed.pathname.match(
        /\/(?:abs|pdf|html)\/(\d{4}\.\d{4,5}|[a-z-]+\/\d{7})(?:v\d+)?/i,
      );
      if (idMatch?.[1]) {
        return `https://arxiv.org/abs/${idMatch[1]}`;
      }
    }
    for (const key of [...parsed.searchParams.keys()]) {
      if (key.toLowerCase().startsWith("utm_")) {
        parsed.searchParams.delete(key);
      }
    }
    parsed.protocol = "https:";
    return parsed.toString().replace(/\/+$/, "") || `https://${host}`;
  } catch {
    return url.trim();
  }
}

export function newsHostname(url: string | null | undefined): string {
  try {
    if (!url) return "";
    return new URL(canonicalNewsUrl(url) || url).hostname.replace(/^www\./i, "");
  } catch {
    return "";
  }
}

export function isDisplayableNewsTitle(title: string): boolean {
  const trimmed = title.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("#")) return false;
  const normalized = trimmed
    .toLowerCase()
    .replace(/[—–]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
  if (JUNK_TITLE_EXACT.has(normalized)) return false;
  if (
    normalized === "introduction" ||
    normalized.startsWith("introduction |") ||
    normalized.startsWith("introduction -") ||
    normalized.startsWith("introduction to ")
  ) {
    return false;
  }
  if (normalized === "abstract" || normalized.startsWith("abstract -")) {
    return false;
  }
  if (CFP_TITLE_RE.test(trimmed)) return false;
  return true;
}

export function isUsableNewsThumbnail(
  src: string | null | undefined,
): src is string {
  const value = src?.trim();
  if (!value) return false;
  if (value.startsWith("data:") || value.startsWith("javascript:")) return false;
  if (ICON_IMAGE_RE.test(value)) return false;
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;
    const path = parsed.pathname.toLowerCase();
    if (path.endsWith(".ico")) return false;
    if (
      path.includes("/logo/") ||
      path.includes("/logos/") ||
      path.replace(/\/+$/, "").endsWith("/logo")
    ) {
      return false;
    }
    if (/(^|\/)logo[-_.]/.test(path)) return false;
    const size = path.match(PATH_SIZE_RE);
    if (size) {
      const width = Number(size[1]);
      const height = Number(size[2]);
      if (width <= 180 && height <= 180) return false;
    }
  } catch {
    return false;
  }
  return true;
}

function publishedStamp(article: Article): number {
  if (!article.published_at) return Number.NaN;
  return Date.parse(article.published_at);
}

export function filterNewsArticles(articles: Article[]): Article[] {
  const cutoff = Date.parse(newsFeedCutoffIso());
  const dated: Article[] = [];

  for (const article of articles) {
    if ((article.source ?? "").toLowerCase() === HIDDEN_ARTICLE_SOURCE) continue;
    if (!isDisplayableNewsTitle(article.title)) continue;
    const stamp = publishedStamp(article);
    if (Number.isNaN(stamp)) continue;
    if (stamp < cutoff) continue;
    dated.push({
      ...article,
      image: isUsableNewsThumbnail(article.image) ? article.image : null,
    });
  }

  dated.sort((a, b) => publishedStamp(b) - publishedStamp(a));

  const seenCanonical = new Set<string>();
  const deduped: Article[] = [];
  for (const article of dated) {
    const key = canonicalNewsUrl(article.url) || article.id;
    if (seenCanonical.has(key)) continue;
    seenCanonical.add(key);
    deduped.push(article);
  }

  let foraKept = 0;
  const capped: Article[] = [];
  for (const article of deduped) {
    if (newsHostname(article.url) === "forasoft.com") {
      if (foraKept >= FORASOFT_VISIBLE_CAP) continue;
      foraKept += 1;
    }
    capped.push(article);
  }

  return capped;
}

/** Pass 1 visible cards minus URLs already shown in "In the briefs". */
export function filterAlsoNotedArticles(
  articles: Article[],
  briefedCanonicalUrls: Iterable<string>,
): Article[] {
  const keys = new Set(
    [...briefedCanonicalUrls].map((url) => canonicalNewsUrl(url)).filter(Boolean),
  );
  return filterNewsArticles(articles).filter((article) => {
    const key = canonicalNewsUrl(article.url);
    return Boolean(key) && !keys.has(key);
  });
}

export function formatArticlePublishedDate(
  publishedAt: string | null | undefined,
): string | null {
  if (!publishedAt) return null;
  const date = new Date(publishedAt);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
