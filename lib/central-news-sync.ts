import { db } from "@/lib/db";
import { processNews } from "@/lib/news-processor";

type Source = { url: string; source: string; fallback: string; keywords: string[] };

const SOURCES: Source[] = [
  { url: "https://ssc.gov.in/", source: "SSC", fallback: "jobs", keywords: ["notice", "examination", "recruitment", "result", "admit", "answer", "calendar", "selection"] },
  { url: "https://upsc.gov.in/", source: "UPSC", fallback: "jobs", keywords: ["recruitment", "examination", "notice", "result", "interview", "admit", "vacancy"] },
  { url: "https://nta.ac.in/", source: "National Testing Agency", fallback: "exams", keywords: ["public notice", "admit", "result", "answer key", "examination", "city", "score"] },
  { url: "https://ibps.in/", source: "IBPS", fallback: "jobs", keywords: ["recruitment", "notification", "vacancy", "result", "admit", "crp", "apply"] },
  { url: "https://www.rrbcdg.gov.in/", source: "Railway Recruitment Board", fallback: "jobs", keywords: ["recruitment", "notice", "result", "admit", "answer", "exam", "application"] },
  { url: "https://indianrailways.gov.in/", source: "Indian Railways", fallback: "jobs", keywords: ["recruitment", "vacancy", "result", "notice", "railway"] },
  { url: "https://joinindianarmy.nic.in/", source: "Join Indian Army", fallback: "jobs", keywords: ["recruitment", "agniveer", "result", "admit", "exam", "notification"] },
  { url: "https://joinindiannavy.gov.in/", source: "Join Indian Navy", fallback: "jobs", keywords: ["recruitment", "agniveer", "result", "admit", "exam", "notification"] },
  { url: "https://indiapostgdsonline.gov.in/", source: "India Post GDS", fallback: "jobs", keywords: ["gds", "recruitment", "result", "merit", "application", "notification"] },
  { url: "https://drdo.gov.in/", source: "DRDO", fallback: "jobs", keywords: ["recruitment", "vacancy", "result", "admit", "notice", "career"] },
  { url: "https://ctet.nic.in/", source: "CTET", fallback: "exams", keywords: ["ctet", "notification", "admit", "result", "answer", "exam"] },
  { url: "https://ugcnet.nta.ac.in/", source: "UGC NET", fallback: "exams", keywords: ["ugc-net", "notice", "admit", "result", "answer", "exam"] },
];

const CATEGORY_MAP: Record<string, string> = {
  jobs: "सरकारी नौकरी", exams: "परीक्षा", "admit-card": "एडमिट कार्ड", "answer-key": "आंसर की", results: "रिजल्ट",
  scholarship: "स्कॉलरशिप", admission: "एडमिशन", documents: "डॉक्यूमेंट", schemes: "सरकारी योजनाएं", education: "शिक्षा", "student-updates": "छात्र अपडेट"
};

function clean(value: string) { return value.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/\s+/g, " ").trim(); }
function absolute(base: string, href: string) { try { return new URL(href, base).toString(); } catch { return ""; } }
function classify(text: string, fallback: string) {
  const v = text.toLowerCase();
  if (/admit|प्रवेश पत्र|प्रवेशपत्र/.test(v)) return "admit-card";
  if (/answer key|model answer|उत्तर कुंजी|आंसर|objection/.test(v)) return "answer-key";
  if (/result|परिणाम|रिजल्ट|merit|cut.?off/.test(v)) return "results";
  if (/scholarship|छात्रवृत्ति/.test(v)) return "scholarship";
  if (/admission|counselling|counseling|प्रवेश/.test(v)) return "admission";
  if (/exam|examination|परीक्षा|syllabus|calendar|schedule/.test(v)) return "exams";
  if (/recruit|vacancy|career|apply|application|भर्ती|नियुक्ति/.test(v)) return "jobs";
  return fallback;
}

async function fetchSource(source: Source) {
  const response = await fetch(source.url, { cache: "no-store", signal: AbortSignal.timeout(12000), headers: { "User-Agent": "Mozilla/5.0 (compatible; StudentUpdateBot/1.0; +https://hindi-news-omega.vercel.app)", Accept: "text/html,application/xhtml+xml" } });
  if (!response.ok) throw new Error(`${source.source}: HTTP ${response.status}`);
  const html = await response.text();
  const items: Array<{ title: string; url: string; categorySlug: string; source: string }> = [];
  const seen = new Set<string>();
  for (const match of html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    const title = clean(match[2]);
    const url = absolute(source.url, match[1]);
    if (!title || title.length < 12 || title.length > 220 || !url || /javascript:|mailto:|#/.test(url)) continue;
    const hay = `${title} ${url}`.toLowerCase();
    if (!source.keywords.some(k => hay.includes(k))) continue;
    if (seen.has(url)) continue;
    seen.add(url);
    items.push({ title, url, categorySlug: classify(title, source.fallback), source: source.source });
    if (items.length >= 25) break;
  }
  return items;
}

export async function syncCentralOfficialNews() {
  for (const [slug, name] of Object.entries(CATEGORY_MAP)) {
    await db.category.upsert({ where: { slug }, update: { name }, create: { slug, name, description: `${name} से जुड़ी छात्र उपयोगी जानकारी` } });
  }
  const results = await Promise.allSettled(SOURCES.map(fetchSource));
  const articles = results.flatMap(r => r.status === "fulfilled" ? r.value : []);
  let saved = 0, skipped = 0;
  for (const article of articles) {
    const externalId = `central:${article.url}`.slice(0, 900);
    const existing = await db.news.findUnique({ where: { externalId }, select: { id: true } });
    if (existing) { skipped++; continue; }
    const category = await db.category.findUnique({ where: { slug: article.categorySlug }, select: { id: true } });
    if (!category) continue;
    const processed = processNews({ title: article.title, description: `Official update from ${article.source}. Open the source before taking action.`, imageUrl: null, sourceName: article.source, sourceUrl: article.url, publishedAt: new Date(), externalId, categorySlug: article.categorySlug }, `central-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
    try {
      await db.news.create({ data: { title: processed.title, slug: processed.slug, description: processed.description, content: processed.content, imageUrl: processed.imageUrl, sourceName: processed.sourceName, sourceUrl: processed.sourceUrl, externalId, language: "HI", status: "PUBLISHED", categoryId: category.id, publishedAt: processed.publishedAt || new Date() } });
      saved++;
    } catch (error: any) {
      if (error?.code === "P2002") skipped++; else throw error;
    }
  }
  return { fetched: articles.length, saved, skipped };
}
