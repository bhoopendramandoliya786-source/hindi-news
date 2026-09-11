export type NormalizedNews = {
  title: string;
  description: string | null;
  imageUrl: string | null;
  sourceName: string | null;
  sourceUrl: string;
  publishedAt: Date | null;
  externalId: string;
  categorySlug: string;
};

const FEEDS: Record<string, string> = {
  india: "https://news.google.com/rss/headlines/section/topic/NATION?hl=hi&gl=IN&ceid=IN:hi",
  sports: "https://news.google.com/rss/headlines/section/topic/SPORTS?hl=hi&gl=IN&ceid=IN:hi",
  business: "https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=hi&gl=IN&ceid=IN:hi",
  technology: "https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=hi&gl=IN&ceid=IN:hi",
  entertainment: "https://news.google.com/rss/headlines/section/topic/ENTERTAINMENT?hl=hi&gl=IN&ceid=IN:hi",
  world: "https://news.google.com/rss/headlines/section/topic/WORLD?hl=hi&gl=IN&ceid=IN:hi",
  rajasthan: "https://news.google.com/rss/search?q=%E0%A4%B0%E0%A4%BE%E0%A4%9C%E0%A4%B8%E0%A5%8D%E0%A4%A5%E0%A4%BE%E0%A4%A8&hl=hi&gl=IN&ceid=IN:hi",
};

function cleanHtml(text: string): string {
  return text
    .replace(/<!\[CDATA\[(.*?)\]\]>/gi, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

function extractTag(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? cleanHtml(match[1]) : "";
}

export async function fetchCategoryNews(categorySlug: string): Promise<NormalizedNews[]> {
  const feedUrl = FEEDS[categorySlug];
  if (!feedUrl) return [];

  try {
    const res = await fetch(feedUrl, { cache: "no-store" });
    if (!res.ok) return [];

    const xmlText = await res.text();
    const items = xmlText.split("<item>");
    items.shift(); // remove header before first item

    const articles: NormalizedNews[] = [];

    for (const itemXml of items) {
      const fullTitle = extractTag(itemXml, "title");
      if (!fullTitle) continue;

      const parts = fullTitle.split(" - ");
      const sourceName = parts.length > 1 ? parts.pop()?.trim() || "Google News" : "Google News";
      const title = parts.join(" - ").trim() || fullTitle;

      const link = extractTag(itemXml, "link") || "";
      const pubDateStr = extractTag(itemXml, "pubDate");
      const description = extractTag(itemXml, "description") || title;

      articles.push({
        title,
        description,
        imageUrl: null,
        sourceName,
        sourceUrl: link,
        publishedAt: pubDateStr ? new Date(pubDateStr) : new Date(),
        externalId: link || `${title}-${Date.now()}`,
        categorySlug,
      });

      if (articles.length >= 6) break; // हर कैटेगरी से 6 ताज़ा खबरें
    }

    return articles;
  } catch (err) {
    console.error(`Fetch failed for ${categorySlug}:`, err);
    return [];
  }
}

export async function fetchAllHindiNews(): Promise<NormalizedNews[]> {
  const categories = Object.keys(FEEDS);
  const allNews: NormalizedNews[] = [];

  for (const cat of categories) {
    const news = await fetchCategoryNews(cat);
    allNews.push(...news);
  }

  return allNews;
}
