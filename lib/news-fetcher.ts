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

type FeedConfig = { feeds: Array<{ url: string; source: string }> };
const googleNews = (query: string) => `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=hi&gl=IN&ceid=IN:hi`;

const FEEDS: Record<string, FeedConfig> = {
  india: { feeds: [{ url: "https://feeds.feedburner.com/ndtvnews-india-news", source: "NDTV" }, { url: "https://feeds.feedburner.com/ndtvkhabar-latest", source: "NDTV हिंदी" }] },
  sports: { feeds: [{ url: "https://feeds.feedburner.com/ndtvsports-latest", source: "NDTV Sports" }, { url: "https://feeds.feedburner.com/ndtvkhabar-sports", source: "NDTV हिंदी" }] },
  entertainment: { feeds: [{ url: "https://feeds.feedburner.com/ndtvmovies-latest", source: "NDTV Movies" }, { url: "https://feeds.feedburner.com/ndtvkhabar-entertainment", source: "NDTV हिंदी" }] },
  business: { feeds: [{ url: "https://feeds.feedburner.com/ndtvprofit-latest", source: "NDTV Profit" }, { url: "https://feeds.feedburner.com/ndtvkhabar-business", source: "NDTV हिंदी" }] },
  technology: { feeds: [{ url: "https://feeds.feedburner.com/gadgets360-latest", source: "Gadgets 360" }, { url: "https://feeds.feedburner.com/ndtvkhabar-gadgets", source: "NDTV हिंदी" }] },
  world: { feeds: [{ url: "https://feeds.feedburner.com/ndtvnews-world-news", source: "NDTV" }, { url: "https://feeds.feedburner.com/ndtvkhabar-world", source: "NDTV हिंदी" }] },
  rajasthan: { feeds: [{ url: "https://www.amarujala.com/rss/rajasthan.xml", source: "अमर उजाला" }, { url: "https://feed.bhaskar.com/rss/1154", source: "दैनिक भास्कर" }] },
  jobs: { feeds: [{ url: googleNews("सरकारी नौकरी भर्ती India RPSC RSSB SSC UPSC Railway"), source: "Google News" }, { url: googleNews("सरकारी नौकरी Rajasthan भर्ती RPSC RSSB"), source: "Google News" }] },
  exams: { feeds: [{ url: googleNews("परीक्षा notification admit card exam India RPSC RSSB SSC UPSC"), source: "Google News" }, { url: googleNews("Rajasthan exam RPSC RSSB परीक्षा"), source: "Google News" }] },
  results: { feeds: [{ url: googleNews("result 2026 India RPSC RSSB SSC UPSC"), source: "Google News" }, { url: googleNews("Rajasthan result 2026 परीक्षा परिणाम"), source: "Google News" }] },
  "admit-card": { feeds: [{ url: googleNews("admit card प्रवेश पत्र 2026 India RPSC RSSB SSC UPSC"), source: "Google News" }, { url: googleNews("Rajasthan admit card 2026"), source: "Google News" }] },
  "current-affairs": { feeds: [{ url: googleNews("current affairs today India हिंदी"), source: "Google News" }, { url: googleNews("आज का करंट अफेयर्स हिंदी"), source: "Google News" }] },
};

function decodeEntities(value: string): string {
  return value.replace(/&nbsp;/gi, " ").replace(/&quot;/gi, '"').replace(/&amp;/gi, "&").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&#39;|&apos;/gi, "'").replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code))).replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)));
}
function cleanHtml(raw: string): string {
  if (!raw) return "";
  return decodeEntities(raw).replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, "$1").replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/https?:\/\/\S+/gi, "").replace(/\s+/g, " ").trim();
}
function extractTag(xml: string, tag: string): string { const match = xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i")); return match ? cleanHtml(match[1]) : ""; }
function extractFirstTag(xml: string, tags: string[]): string { for (const tag of tags) { const value = extractTag(xml, tag); if (value) return value; } return ""; }
function extractLink(xml: string): string {
  const linkMatch = xml.match(/<link(?:\s[^>]*)?>([\s\S]*?)<\/link>/i);
  if (linkMatch?.[1]) return cleanHtml(linkMatch[1]);
  const hrefMatch = xml.match(/<link[^>]+href=["']([^"']+)["'][^>]*\/?\s*>/i);
  return hrefMatch?.[1] || "";
}
function extractImageUrl(xml: string): string | null {
  const patterns = [/ <media:content[^>]*url=["']([^"']+)["']/i, /<media:thumbnail[^>]*url=["']([^"']+)["']/i, /<enclosure[^>]*url=["']([^"']+)["']/i, /<img[^>]*src=["']([^"']+)["']/i];
  for (const pattern of patterns) { const match = xml.match(pattern); if (match?.[1]?.startsWith("http")) return match[1]; }
  return null;
}
function makeSummary(title: string, rawDescription: string): string {
  let text = cleanHtml(rawDescription);
  if (!text || text.length < 25 || text.toLowerCase() === title.toLowerCase()) return title;
  if (text.length > 600) text = `${text.slice(0, 597).replace(/\s+\S*$/, "")}...`;
  return text || title;
}
function stableExternalId(link: string, title: string, publishedAt: string, categorySlug: string): string { return (link || `${categorySlug}|${title}|${publishedAt}`).trim().toLowerCase().slice(0, 900); }

function parseFeed(xmlText: string, config: { source: string }, categorySlug: string): NormalizedNews[] {
  const itemMatches = xmlText.match(/<item(?:\s[^>]*)?>[\s\S]*?<\/item>/gi) || [];
  const atomMatches = xmlText.match(/<entry(?:\s[^>]*)?>[\s\S]*?<\/entry>/gi) || [];
  const blocks = itemMatches.length ? itemMatches : atomMatches;
  return blocks.flatMap((itemXml) => {
    const title = extractTag(itemXml, "title");
    if (!title) return [];
    const link = extractLink(itemXml);
    const pubDateStr = extractFirstTag(itemXml, ["pubDate", "dc:date", "published", "updated"]);
    const parsedDate = pubDateStr ? new Date(pubDateStr) : new Date();
    const publishedAt = Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
    const rawDescription = extractFirstTag(itemXml, ["content:encoded", "description", "summary"]);
    return [{ title, description: makeSummary(title, rawDescription), imageUrl: extractImageUrl(itemXml), sourceName: extractTag(itemXml, "source") || config.source, sourceUrl: link, publishedAt, externalId: stableExternalId(link, title, pubDateStr, categorySlug), categorySlug }];
  });
}

async function fetchFeed(url: string, source: string, categorySlug: string): Promise<NormalizedNews[]> {
  let lastError: unknown = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    const controller = new AbortController(); const timeoutId = setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch(url, { cache: "no-store", signal: controller.signal, headers: { "User-Agent": "Mozilla/5.0 (compatible; HindiNewsBot/1.0; +https://hindi-news-omega.vercel.app)", Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8" } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const xmlText = await res.text();
      if (!xmlText.includes("<item") && !xmlText.includes("<entry")) throw new Error("Invalid RSS/Atom response");
      return parseFeed(xmlText, { source }, categorySlug);
    } catch (error) { lastError = error; if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, 500)); }
    finally { clearTimeout(timeoutId); }
  }
  throw lastError instanceof Error ? lastError : new Error("RSS fetch failed");
}

export async function fetchCategoryNews(categorySlug: string): Promise<NormalizedNews[]> {
  const config = FEEDS[categorySlug]; if (!config) return [];
  const results = await Promise.allSettled(config.feeds.map((feed) => fetchFeed(feed.url, feed.source, categorySlug)));
  const merged: NormalizedNews[] = []; const seen = new Set<string>();
  for (const result of results) if (result.status === "fulfilled") for (const article of result.value) {
    const key = article.sourceUrl || article.title.trim().toLowerCase(); if (seen.has(key)) continue; seen.add(key); merged.push(article);
  }
  merged.sort((a, b) => (b.publishedAt?.getTime() || 0) - (a.publishedAt?.getTime() || 0));
  return merged.slice(0, 12);
}

export async function fetchAllHindiNews(): Promise<NormalizedNews[]> {
  const results = await Promise.allSettled(Object.keys(FEEDS).map((cat) => fetchCategoryNews(cat)));
  return results.flatMap((result) => result.status === "fulfilled" ? result.value : []);
}
