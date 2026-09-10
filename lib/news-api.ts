export type NewsApiArticle = {
  source?: {
    id?: string | null;
    name?: string | null;
  };
  author?: string | null;
  title?: string | null;
  description?: string | null;
  url?: string | null;
  urlToImage?: string | null;
  publishedAt?: string | null;
  content?: string | null;
};

type NewsApiResponse = {
  status: string;
  totalResults: number;
  articles: NewsApiArticle[];
};

const NEWS_API_BASE_URL = "https://newsapi.org/v2";

function getApiKey() {
  const key = process.env.NEWS_API_KEY;

  if (!key) {
    throw new Error("NEWS_API_KEY is not configured.");
  }

  return key;
}

export async function getTopHeadlines(options?: {
  country?: string;
  category?: string;
  pageSize?: number;
}) {
  const country = options?.country ?? "in";
  const category = options?.category;
  const pageSize = Math.min(options?.pageSize ?? 20, 100);

  const params = new URLSearchParams({
    country,
    pageSize: String(pageSize),
    apiKey: getApiKey()
  });

  if (category) {
    params.set("category", category);
  }

  const response = await fetch(
    `${NEWS_API_BASE_URL}/top-headlines?${params.toString()}`,
    {
      cache: "no-store"
    }
  );

  if (!response.ok) {
    throw new Error(`News API request failed: ${response.status}`);
  }

  const data = (await response.json()) as NewsApiResponse;

  if (data.status !== "ok") {
    throw new Error("News API returned an error.");
  }

  return data.articles;
}
