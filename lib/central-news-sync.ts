import { db } from "@/lib/db";
import { processNews } from "@/lib/news-processor";

type Source = { url: string; source: string; fallback: string; keywords: string[] };

// India-wide official monitoring layer. Rajasthan sources are handled by
// lib/news-fetcher.ts; this layer covers major national student/job/exam authorities.
const SOURCES: Source[] = [
  { url: "https://ssc.gov.in/", source: "SSC", fallback: "jobs", keywords: ["notice", "examination", "recruitment", "result", "admit", "answer", "calendar", "selection"] },
  { url: "https://upsc.gov.in/", source: "UPSC", fallback: "jobs", keywords: ["recruitment", "examination", "notice", "result", "interview", "admit", "vacancy"] },
  { url: "https://nta.ac.in/", source: "National Testing Agency", fallback: "exams", keywords: ["public notice", "admit", "result", "answer key", "examination", "city", "score"] },
  { url: "https://exams.nta.ac.in/", source: "NTA Exams", fallback: "exams", keywords: ["notice", "admit", "result", "answer", "city", "examination", "score"] },
  { url: "https://ibps.in/", source: "IBPS", fallback: "jobs", keywords: ["recruitment", "notification", "vacancy", "result", "admit", "crp", "apply"] },
  { url: "https://sbi.co.in/web/careers", source: "SBI Careers", fallback: "jobs", keywords: ["career", "recruitment", "probationary officer", "clerk", "circle based", "result", "admit", "apply"] },
  { url: "https://www.rrbcdg.gov.in/", source: "Railway Recruitment Board", fallback: "jobs", keywords: ["recruitment", "notice", "result", "admit", "answer", "exam", "application", "ntpc", "group d", "alp"] },
  { url: "https://indianrailways.gov.in/", source: "Indian Railways", fallback: "jobs", keywords: ["recruitment", "vacancy", "result", "notice", "railway"] },
  { url: "https://joinindianarmy.nic.in/", source: "Join Indian Army", fallback: "jobs", keywords: ["recruitment", "agniveer", "result", "admit", "exam", "notification", "rally"] },
  { url: "https://joinindiannavy.gov.in/", source: "Join Indian Navy", fallback: "jobs", keywords: ["recruitment", "agniveer", "result", "admit", "exam", "notification"] },
  { url: "https://indiapostgdsonline.gov.in/", source: "India Post GDS", fallback: "jobs", keywords: ["gds", "recruitment", "result", "merit", "application", "notification"] },
  { url: "https://drdo.gov.in/", source: "DRDO", fallback: "jobs", keywords: ["recruitment", "vacancy", "result", "admit", "notice", "career"] },
  { url: "https://www.isro.gov.in/Careers.html", source: "ISRO Careers", fallback: "jobs", keywords: ["career", "recruitment", "vacancy", "result", "scientist", "technical", "application"] },
  { url: "https://www.hal-india.co.in/careers", source: "HAL Careers", fallback: "jobs", keywords: ["career", "recruitment", "vacancy", "apprentice", "result", "application"] },
  { url: "https://www.bhel.com/careers", source: "BHEL Careers", fallback: "jobs", keywords: ["career", "recruitment", "vacancy", "apprentice", "result", "application"] },
  { url: "https://www.coalindia.in/career-cil/", source: "Coal India Careers", fallback: "jobs", keywords: ["career", "recruitment", "vacancy", "management trainee", "result", "application"] },
  { url: "https://www.licindia.in/careers", source: "LIC Careers", fallback: "jobs", keywords: ["career", "recruitment", "apprentice", "assistant", "officer", "result", "application"] },
  { url: "https://ctet.nic.in/", source: "CTET", fallback: "exams", keywords: ["ctet", "notification", "admit", "result", "answer", "exam"] },
  { url: "https://ugcnet.nta.ac.in/", source: "UGC NET", fallback: "exams", keywords: ["ugc-net", "notice", "admit", "result", "answer", "exam"] },
  { url: "https://neet.nta.nic.in/", source: "NEET", fallback: "exams", keywords: ["neet", "notice", "admit", "result", "answer", "counselling", "exam"] },
  { url: "https://jeemain.nta.nic.in/", source: "JEE Main", fallback: "exams", keywords: ["jee", "notice", "admit", "result", "answer", "city", "session"] },
  { url: "https://cuet.nta.nic.in/", source: "CUET", fallback: "exams", keywords: ["cuet", "notice", "admit", "result", "answer", "city", "exam"] },
  { url: "https://ugc.gov.in/", source: "UGC", fallback: "education", keywords: ["notice", "fellowship", "scholarship", "university", "education", "regulation"] },
  { url: "https://www.cbse.gov.in/", source: "CBSE", fallback: "education", keywords: ["result", "exam", "admission", "notice", "circular", "scholarship", "certificate"] },
  { url: "https://nios.ac.in/", source: "NIOS", fallback: "education", keywords: ["admission", "exam", "result", "hall ticket", "notice", "registration"] },
  { url: "https://ignou.ac.in/", source: "IGNOU", fallback: "admission", keywords: ["admission", "exam", "result", "hall ticket", "registration", "assignment", "notice"] },
  { url: "https://www.epfindia.gov.in/", source: "EPFO", fallback: "jobs", keywords: ["recruitment", "vacancy", "exam", "result", "notice", "application"] },
];

const CATEGORY_MAP: Record<string, string> = {
  jobs: "सरकारी नौकरी", exams: "परीक्षा", "admit-card": "एडमिट कार्ड", "answer-key": "आंसर की", results: "रिजल्ट",
  scholarship: "स्कॉलरशिप", admission: "एडमिशन", documents: "डॉक्यूमेंट", schemes: "सरकारी योजनाएं", education: "शिक्षा", "student-updates": "छात्र अपडेट", "citizen-services": "नागरिक सेवाएं"
};

function clean(value: string) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function absolute(base: string, href: string) { try { return new URL(href, base).toString(); } catch { return ""; } }

function classify(text: string, fallback: string) {
  const v = text.toLowerCase();
  if (/admit|प्रवेश पत्र|प्रवेशपत्र/.test(v)) return "admit-card";
  if (/answer key|model answer|उत्तर कुंजी|आंसर|objection/.test(v)) return "answer-key";
  if (/result|परिणाम|रिजल्ट|merit|cut.?off/.test(v)) return "results";
  if (/scholarship|छात्रवृत्ति|fellowship/.test(v)) return "scholarship";
  if (/admission|counselling|counseling|प्रवेश|registration/.test(v)) return "admission";
  if (/exam|examination|परीक्षा|syllabus|calendar|schedule|timetable/.test(v)) return "exams";
  if (/recruit|vacancy|career|apply|application|भर्ती|नियुक्ति|apprentice/.test(v)) return "jobs";
  if (/education|university|college|school|board|शिक्षा|विश्वविद्यालय|महाविद्यालय|विद्यालय/.test(v)) return "education";
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
    if (!title || title.length < 16 || title.length > 220 || !url || /javascript:|mailto:|#/.test(url)) continue;
    const hay = `${title} ${url}`.toLowerCase();
    if (!source.keywords.some(k => hay.includes(k))) continue;
    if (/^(home|contact|login|logout|sitemap|privacy|terms|feedback|help|faq)$/i.test(title)) continue;
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
  const successfulSources = results.filter(r => r.status === "fulfilled").length;
  if (successfulSources === 0) throw new Error("All national official sources failed during sync");

  let saved = 0, updated = 0, skipped = 0;

  for (const article of articles) {
    const externalId = `central:${article.url}`.slice(0, 900);
    const category = await db.category.findUnique({ where: { slug: article.categorySlug }, select: { id: true } });
    if (!category) continue;

    const processed = processNews(
      {
        title: article.title,
        description: `Official update from ${article.source}. Open the source before taking action.`,
        imageUrl: null,
        sourceName: article.source,
        sourceUrl: article.url,
        publishedAt: new Date(),
        externalId,
        categorySlug: article.categorySlug
      },
      `central-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    );

    const existing = await db.news.findUnique({ where: { externalId }, select: { id: true, title: true, description: true, content: true, categoryId: true } });

    if (existing) {
      const changed = existing.title !== processed.title || existing.description !== processed.description || existing.content !== processed.content || existing.categoryId !== category.id;
      if (!changed) { skipped++; continue; }
      await db.news.update({ where: { id: existing.id }, data: { title: processed.title, slug: processed.slug, description: processed.description, content: processed.content, imageUrl: processed.imageUrl, sourceName: processed.sourceName, sourceUrl: processed.sourceUrl, categoryId: category.id, status: "PUBLISHED", publishedAt: processed.publishedAt || new Date() } });
      updated++;
      continue;
    }

    try {
      await db.news.create({ data: { title: processed.title, slug: processed.slug, description: processed.description, content: processed.content, imageUrl: processed.imageUrl, sourceName: processed.sourceName, sourceUrl: processed.sourceUrl, externalId, language: "HI", status: "PUBLISHED", categoryId: category.id, publishedAt: processed.publishedAt || new Date() } });
      saved++;
    } catch (error: any) {
      if (error?.code === "P2002") skipped++; else throw error;
    }
  }
  return { sources: SOURCES.length, successfulSources, fetched: articles.length, saved, updated, skipped };
}
