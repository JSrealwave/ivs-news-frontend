export interface Article {
  id: string;
  title: string;
  summary: string | null;
  url: string;
  image: string | null;
  entities?: string[] | null;
  category: string;
  score_relevance: number;
  score_technical: number;
  score_compelling: number;
  created_at: string;
}

export const ARTICLE_SELECT_FIELDS =
  "id,title,summary,url,image,entities,category,score_relevance,score_technical,score_compelling,created_at";
