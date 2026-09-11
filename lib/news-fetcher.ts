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

// दैनिक भास्कर और अमर उजाला के फ़ीड्स (साफ़ टेक्स्ट + असली इमेज के साथ)
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
    url: "https://feed.bhaskar.com/rss/1154", // दैनिक भास्कर राजस्थान
    source: "दैनिक भास्कर",
  },
};

// HTML टैग्स और कचरा हटाने के लिए
function cleanHtml(raw: string): string {
  if (!raw) return "";
  return raw
    .replace(/<!\[CDATA\[(.*?)\]\]>/gis, "$1")
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

function extractImageUrl(xml: string): string | null {
  // 1. Check <enclosure url="..." />
  const encMatch = xml.match(/<enclosure[^>]*url=["']([^"']+)["']/i);
  if (encMatch && encMatch[1]) return encMatch[1];

  // 2. Check <media:content url="..." />
  const mediaMatch = xml.match(/<media:content[^>]*url=["']([^"']+)["']/i);
  if (mediaMatch && mediaMatch[1]) return mediaMatch[1];

  // 3. Check <img src="..." /> inside description/content
  const imgMatch = xml.match(/<img[^>]*src=["']([^"']+)["']/i);
  if (imgMatch && imgMatch[1]) return imgMatch[1];

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

      const linkMatch = itemXml.match(/<link[^>]*>([\\s\\S]*?)<\/link>/i);
      const link = linkMatch ? cleanHtml(linkMatch[1]) : "";

      const pubDateStr = extractTag(itemXml, "pubDate");
      let description = extractTag(itemXml, "description") || title;

      // अगर विवरण में फिर भी लिंक या बहुत छोटा टेक्स्ट रह जाए तो टाइटल रखें
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

      if (articles.length >= 4) break;
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
