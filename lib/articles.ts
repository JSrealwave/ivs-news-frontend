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

export const ARTICLE_FEED_LIMIT = 30;

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
