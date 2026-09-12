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

type FeedConfig = {
  feeds: Array<{ url: string; source: string }>;
};

// RSS reliability layer: every category has a primary feed and a fallback feed.
// We only use headlines/available summaries and always keep source attribution.
const FEEDS: Record<string, FeedConfig> = {
  india: {
    feeds: [
      { url: "https://feeds.feedburner.com/ndtvnews-india-news", source: "NDTV" },
      { url: "https://feeds.feedburner.com/ndtvkhabar-latest", source: "NDTV हिंदी" },
    ],
  },
  sports: {
    feeds: [
      { url: "https://feeds.feedburner.com/ndtvsports-latest", source: "NDTV Sports" },
      { url: "https://feeds.feedburner.com/ndtvkhabar-sports", source: "NDTV हिंदी" },
    ],
  },
  entertainment: {
    feeds: [
      { url: "https://feeds.feedburner.com/ndtvmovies-latest", source: "NDTV Movies" },
      { url: "https://feeds.feedburner.com/ndtvkhabar-entertainment", source: "NDTV हिंदी" },
    ],
  },
  business: {
    feeds: [
      { url: "https://feeds.feedburner.com/ndtvprofit-latest", source: "NDTV Profit" },
      { url: "https://feeds.feedburner.com/ndtvkhabar-business", source: "NDTV हिंदी" },
    ],
  },
  technology: {
    feeds: [
      { url: "https://feeds.feedburner.com/gadgets360-latest", source: "Gadgets 360" },
      { url: "https://feeds.feedburner.com/ndtvkhabar-gadgets", source: "NDTV हिंदी" },
    ],
  },
  world: {
    feeds: [
      { url: "https://feeds.feedburner.com/ndtvnews-world-news", source: "NDTV" },
      { url: "https://feeds.feedburner.com/ndtvkhabar-world", source: "NDTV हिंदी" },
    ],
  },
  rajasthan: {
    feeds: [
      { url: "https://www.amarujala.com/rss/rajasthan.xml", source: "अमर उजाला" },
      { url: "https://feed.bhaskar.com/rss/1154", source: "दैनिक भास्कर" },
    ],
  },
};

function decodeEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&quot;/gi, '"')
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)));
}

function cleanHtml(raw: string): string {
  if (!raw) return "";
  return decodeEntities(raw)
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, "$1")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/https?:\/\/\S+/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTag(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? cleanHtml(match[1]) : "";
}

function extractFirstTag(xml: string, tags: string[]): string {
  for (const tag of tags) {
    const value = extractTag(xml, tag);
    if (value) return value;
  }
  return "";
}

function extractLink(xml: string): string {
  const linkMatch = xml.match(/<link(?:\\s[^>]*)?>([\\s\\S]*?)<\/link>/i);
  if (linkMatch?.[1]) return cleanHtml(linkMatch[1]);
  const hrefMatch = xml.match(/<link[^>]+href=["']([^"']+)["'][^>]*\/?\s*>/i);
  return hrefMatch?.[1] || "";
}

function extractImageUrl(xml: string): string | null {
  const patterns = [
    /<media:content[^>]*url=["']([^"']+)["']/i,
    /<media:thumbnail[^>]*url=["']([^"']+)["']/i,
    /<enclosure[^>]*url=["']([^"']+)["']/i,
    /<img[^>]*src=["']([^"']+)["']/i,
  ];
  for (const pattern of patterns) {
    const match = xml.match(pattern);
    if (match?.[1]?.startsWith("http")) return match[1];
  }
  return null;
}

function makeSummary(title: string, rawDescription: string): string {
  let text = cleanHtml(rawDescription);
  if (!text || text.length < 25 || text.toLowerCase() === title.toLowerCase()) return title;
  text = text.replace(/\s*\|\s*(NDTV|NDTV हिंदी|अमर उजाला|दैनिक भास्कर).*$/i, "").trim();
  if (text.length > 600) text = `${text.slice(0, 597).replace(/\s+\S*$/, "")}...`;
  return text || title;
}

function stableExternalId(link: string, title: string, publishedAt: string, categorySlug: string): string {
  const value = (link || `${categorySlug}|${title}|${publishedAt}`).trim().toLowerCase();
  return value.slice(0, 900);
}

function parseFeed(xmlText: string, config: { source: string }, categorySlug: string): NormalizedNews[] {
  const itemMatches = xmlText.match(/<item(?:\\s[^>]*)?>[\\s\\S]*?<\/item>/gi) || [];
  const atomMatches = xmlText.match(/<entry(?:\\s[^>]*)?>[\\s\\S]*?<\/entry>/gi) || [];
  const blocks = itemMatches.length ? itemMatches : atomMatches;
  const articles: NormalizedNews[] = [];

  for (const itemXml of blocks) {
    const title = extractTag(itemXml, "title");
    if (!title) continue;
    const link = extractLink(itemXml);
    const pubDateStr = extractFirstTag(itemXml, ["pubDate", "dc:date", "published", "updated"]);
    const parsedDate = pubDateStr ? new Date(pubDateStr) : new Date();
    const safePublishedAt = Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
    const rawDescription = extractFirstTag(itemXml, ["content:encoded", "description", "summary"]);

    articles.push({
      title,
      description: makeSummary(title, rawDescription),
      imageUrl: extractImageUrl(itemXml),
      sourceName: config.source,
      sourceUrl: link,
      publishedAt: safePublishedAt,
      externalId: stableExternalId(link, title, pubDateStr, categorySlug),
      categorySlug,
    });
  }

  return articles;
}

async function fetchFeed(url: string, source: string, categorySlug: string): Promise<NormalizedNews[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, {
      cache: "no-store",
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; HindiNewsBot/1.0; +https://hindi-news-omega.vercel.app)",
        Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xmlText = await res.text();
    if (!xmlText.includes("<item") && !xmlText.includes("<entry")) {
      throw new Error("Invalid RSS/Atom response");
    }
    return parseFeed(xmlText, { source }, categorySlug);
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function fetchCategoryNews(categorySlug: string): Promise<NormalizedNews[]> {
  const config = FEEDS[categorySlug];
  if (!config) return [];

  const results = await Promise.allSettled(
    config.feeds.map((feed) => fetchFeed(feed.url, feed.source, categorySlug))
  );

  const merged: NormalizedNews[] = [];
  const seen = new Set<string>();

  for (const result of results) {
    if (result.status !== "fulfilled") continue;
    for (const article of result.value) {
      const key = article.sourceUrl || article.title.trim().toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(article);
    }
  }

  merged.sort((a, b) => (b.publishedAt?.getTime() || 0) - (a.publishedAt?.getTime() || 0));
  return merged.slice(0, 10);
}

export async function fetchAllHindiNews(): Promise<NormalizedNews[]> {
  const categories = Object.keys(FEEDS);
  const results = await Promise.allSettled(categories.map((cat) => fetchCategoryNews(cat)));
  const allNews: NormalizedNews[] = [];
  for (const r of results) if (r.status === "fulfilled") allNews.push(...r.value);
  return allNews;
}
