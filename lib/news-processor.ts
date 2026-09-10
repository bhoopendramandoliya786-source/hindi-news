import { createSlug } from "./slug";
import type { NormalizedNews } from "./news-fetcher";

export type ProcessedNews = NormalizedNews & {
  slug: string;
};

export function processNews(
  article: NormalizedNews,
  uniqueSuffix: string
): ProcessedNews {
  return {
    ...article,
    slug: createSlug(article.title, uniqueSuffix)
  };
}
