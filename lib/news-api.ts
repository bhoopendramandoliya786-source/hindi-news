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
  totalResults?: number;
  articles?: NewsApiArticle[];
  code?: string;
  message?: string;
};

const NEWS_API_BASE_URL = "https://newsapi.org/v2";

function getApiKey() {
  const key = process.env.NEWS_API_KEY;

  if (!key) {
    throw new Error("NEWS_API_KEY is not configured.");
  }

  return key;
}

export async function getTopHeadlines() {
  const params = new URLSearchParams({
    q: "India OR Rajasthan OR Jaipur",
    language: "en",
    sortBy: "publishedAt",
    pageSize: "20",
    apiKey: getApiKey()
  });

  const response = await fetch(
    `${NEWS_API_BASE_URL}/everything?${params.toString()}`,
    {
      cache: "no-store"
    }
  );

  const data = (await response.json()) as NewsApiResponse;

  if (!response.ok) {
    throw new Error(
      data.message || `News API request failed: ${response.status}`
    );
  }

  if (data.status !== "ok") {
    throw new Error(data.message || "News API returned an error.");
  }

  console.log(
    "NewsAPI results:",
    data.totalResults,
    "articles:",
    data.articles?.length ?? 0
  );

  return data.articles ?? [];
}
