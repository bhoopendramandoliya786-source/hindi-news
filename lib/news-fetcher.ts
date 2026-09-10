import { getTopHeadlines, NewsApiArticle } from "./news-api";

export type NormalizedNews = {
  title: string;
  description: string | null;
  imageUrl: string | null;
  sourceName: string | null;
  sourceUrl: string;
  publishedAt: Date | null;
  externalId: string;
};

function createExternalId(article: NewsApiArticle) {
  if (article.url) {
    return article.url;
  }

  return [
    article.source?.name ?? "unknown",
    article.title ?? "untitled",
    article.publishedAt ?? ""
  ].join("|");
}

function normalizeArticle(
  article: NewsApiArticle
): NormalizedNews | null {
  if (!article.title || !article.url) {
    return null;
  }

  if (article.title === "[Removed]") {
    return null;
  }

  return {
    title: article.title.trim(),
    description: article.description?.trim() || null,
    imageUrl: article.urlToImage || null,
    sourceName: article.source?.name || null,
    sourceUrl: article.url,
    publishedAt: article.publishedAt
      ? new Date(article.publishedAt)
      : null,
    externalId: createExternalId(article)
  };
}

export async function fetchIndiaNews() {
  const articles = await getTopHeadlines({
    country: "in",
    pageSize: 20
  });

  const normalized = articles
    .map(normalizeArticle)
    .filter((article): article is NormalizedNews => article !== null);

  return normalized;
}
