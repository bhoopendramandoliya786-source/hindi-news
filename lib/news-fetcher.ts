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

const FEEDS: Record<string, { url: string; source: string }> = {
  india: {
    url: "https://www.amarujala.com/rss/national-news.xml",
    source: "अमर उजाला",
  },
  sports: {
    url: "https://www.amarujala.com/rss/sports-news.xml",
    source: "अमर उजाला",
  },
  business: {
    url: "https://www.amarujala.com/rss/business-news.xml",
    source: "अमर उजाला",
  },
  technology: {
    url: "https://www.amarujala.com/rss/technology-news.xml",
    source: "अमर उजाला",
  },
  entertainment: {
    url: "https://www.amarujala.com/rss/entertainment-news.xml",
    source: "अमर उजाला",
  },
  world: {
    url: "https://www.amarujala.com/rss/world-news.xml",
    source: "अमर उजाला",
  },
  rajasthan: {
    url: "https://feed.bhaskar.com/rss/1154",
    source: "दैनिक भास्कर",
  },
};

function cleanHtml(raw: string): string {
  if (!raw) return "";
  return raw
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&quot;/gi, '"')
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTag(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? cleanHtml(match[1]) : "";
}

// इमेज ढूँढने का मजबूत फ़ंक्शन
function extractImageUrl(xml: string): string | null {
  // 1. enclosure टैग (अमर उजाला और भास्कर का मुख्य इमेज टैग)
  const encMatch = xml.match(/<enclosure[^>]*url=["']([^"']+)["']/i);
  if (encMatch && encMatch[1] && encMatch[1].startsWith("http")) return encMatch[1];

  // 2. media:content टैग
  const mediaMatch = xml.match(/<media:content[^>]*url=["']([^"']+)["']/i);
  if (mediaMatch && mediaMatch[1] && mediaMatch[1].startsWith("http")) return mediaMatch[1];

  // 3. description या content के अंदर <img src="...">
  const imgMatch = xml.match(/<img[^>]*src=["']([^"']+)["']/i);
  if (imgMatch && imgMatch[1] && imgMatch[1].startsWith("http")) return imgMatch[1];

  return null;
}

export async function fetchCategoryNews(categorySlug: string): Promise<NormalizedNews[]> {
  const config = FEEDS[categorySlug];
  if (!config) return [];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(config.url, {
      cache: "no-store",
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
    });
    clearTimeout(timeoutId);

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
      let description = extractTag(itemXml, "description") || title;

      if (description.includes("http") || description.length < 15) {
        description = title;
      }

      const imageUrl = extractImageUrl(itemXml);

      articles.push({
        title,
        description,
        imageUrl,
        sourceName: config.source,
        sourceUrl: link,
        publishedAt: pubDateStr ? new Date(pubDateStr) : new Date(),
        externalId: link || `${title}-${Date.now()}`,
        categorySlug,
      });

      if (articles.length >= 5) break;
    }

    return articles;
  } catch (err) {
    console.error(`Fetch failed for ${categorySlug}:`, err);
    return [];
  }
}

export async function fetchAllHindiNews(): Promise<NormalizedNews[]> {
  const categories = Object.keys(FEEDS);

  const results = await Promise.allSettled(
    categories.map((cat) => fetchCategoryNews(cat))
  );

  const allNews: NormalizedNews[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") {
      allNews.push(...r.value);
    }
  }

  return allNews;
      }
