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
}

export const ARTICLE_SELECT_FIELDS =
  "id,title,summary,url,image,published_at,entities,category,score_relevance,score_technical,score_compelling,created_at";

export const ARTICLE_FEED_LIMIT = 80;
export const ARTICLE_MAX_AGE_DAYS = 60;

export function newsFeedCutoffIso(days = ARTICLE_MAX_AGE_DAYS): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString();
}

export function isDisplayableNewsTitle(title: string): boolean {
  const trimmed = title.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("#")) return false;
  return true;
}

export function filterNewsArticles(articles: Article[]): Article[] {
  const cutoff = Date.parse(newsFeedCutoffIso());
  return articles.filter((article) => {
    if (!isDisplayableNewsTitle(article.title)) return false;
    const stamp = Date.parse(article.published_at ?? article.created_at);
    if (Number.isNaN(stamp)) return false;
    return stamp >= cutoff;
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
