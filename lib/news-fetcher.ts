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

// भरोसेमंद हिंदी न्यूज़ फ़ीड्स। साइट पर headline/उपलब्ध सारांश से
// अपनी प्रस्तुति बनाई जाती है; पूरा मूल लेख कॉपी नहीं किया जाता।
const FEEDS: Record<string, { url: string; source: string }> = {
  india: { url: "https://feeds.feedburner.com/ndtvkhabar-latest", source: "NDTV" },
  sports: { url: "https://feeds.feedburner.com/ndtvkhabar-sports", source: "NDTV" },
  entertainment: { url: "https://feeds.feedburner.com/ndtvkhabar-entertainment", source: "NDTV" },
  business: { url: "https://feeds.feedburner.com/ndtvkhabar-business", source: "NDTV" },
  technology: { url: "https://feeds.feedburner.com/ndtvkhabar-gadgets", source: "NDTV" },
  world: { url: "https://feeds.feedburner.com/ndtvkhabar-world", source: "NDTV" },
  rajasthan: { url: "https://feed.bhaskar.com/rss/1154", source: "दैनिक भास्कर" },
};

function cleanHtml(raw: string): string {
  if (!raw) return "";
  return raw
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, "$1")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&quot;/gi, '"')
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/https?:\/\/\S+/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTag(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? cleanHtml(match[1]) : "";
}

function extractImageUrl(xml: string): string | null {
  const mediaMatch = xml.match(/<media:content[^>]*url=["']([^"']+)["']/i);
  if (mediaMatch?.[1]?.startsWith("http")) return mediaMatch[1];
  const encMatch = xml.match(/<enclosure[^>]*url=["']([^"']+)["']/i);
  if (encMatch?.[1]?.startsWith("http")) return encMatch[1];
  const imgMatch = xml.match(/<img[^>]*src=["']([^"']+)["']/i);
  if (imgMatch?.[1]?.startsWith("http")) return imgMatch[1];
  return null;
}

function makeSummary(title: string, rawDescription: string): string {
  let text = cleanHtml(rawDescription);
  if (!text || text.length < 25 || text.toLowerCase() === title.toLowerCase()) return title;
  text = text.replace(/\s*\|\s*(NDTV|दैनिक भास्कर).*$/i, "").trim();
  if (text.length > 600) text = `${text.slice(0, 597).replace(/\s+\S*$/, "")}...`;
  return text || title;
}

function stableExternalId(link: string, title: string, publishedAt: string, categorySlug: string): string {
  const value = (link || `${categorySlug}|${title}|${publishedAt}`).trim().toLowerCase();
  return value.slice(0, 900);
}

export async function fetchCategoryNews(categorySlug: string): Promise<NormalizedNews[]> {
  const config = FEEDS[categorySlug];
  if (!config) return [];
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);
  try {
    const res = await fetch(config.url, {
      cache: "no-store",
      signal: controller.signal,
      headers: { "User-Agent": "HindiNewsBot/1.0 (+https://hindi-news-omega.vercel.app)" },
    });
    if (!res.ok) return [];
    const xmlText = await res.text();
    const items = xmlText.split("<item>");
    items.shift();
    const articles: NormalizedNews[] = [];
    for (const itemXml of items) {
      const title = extractTag(itemXml, "title");
      if (!title) continue;
      const linkMatch = itemXml.match(/<link[^>]*>([\s\S]*?)<\/link>/i);
      const link = linkMatch ? cleanHtml(linkMatch[1]) : "";
      const pubDateStr = extractTag(itemXml, "pubDate");
      const publishedAt = pubDateStr ? new Date(pubDateStr) : new Date();
      const safePublishedAt = Number.isNaN(publishedAt.getTime()) ? new Date() : publishedAt;
      const description = makeSummary(title, extractTag(itemXml, "description"));
      articles.push({
        title,
        description,
        imageUrl: extractImageUrl(itemXml),
        sourceName: config.source,
        sourceUrl: link,
        publishedAt: safePublishedAt,
        externalId: stableExternalId(link, title, pubDateStr, categorySlug),
        categorySlug,
      });
      if (articles.length >= 5) break;
    }
    return articles;
  } catch (err) {
    console.error(`Fetch failed for ${categorySlug}:`, err);
    return [];
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function fetchAllHindiNews(): Promise<NormalizedNews[]> {
  const categories = Object.keys(FEEDS);
  const results = await Promise.allSettled(categories.map((cat) => fetchCategoryNews(cat)));
  const allNews: NormalizedNews[] = [];
  for (const r of results) if (r.status === "fulfilled") allNews.push(...r.value);
  return allNews;
}
