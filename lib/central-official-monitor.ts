import { db } from "@/lib/db";
import { buildEntityKey } from "@/lib/entity-key";
import { seedCategories } from "@/lib/category-seeder";

type Source = { url: string; name: string; keywords: string[]; fallback: string };

const SOURCES: Source[] = [
  { url: "https://ssc.gov.in/", name: "SSC", fallback: "jobs", keywords: ["notice", "examination", "result", "admit", "answer key", "selection", "marks", "je", "cgl", "chsl", "mts", "constable", "sub-inspector"] },
  { url: "https://www.upsc.gov.in/", name: "UPSC", fallback: "exams", keywords: ["examination", "notification", "result", "admit", "answer key", "written result", "final result", "interview", "calendar", "recruitment"] },
  { url: "https://www.ibps.in/", name: "IBPS", fallback: "jobs", keywords: ["recruitment", "apply online", "result", "call letter", "score", "provisional allotment", "crp", "bank", "officer", "clerk"] },
];

function clean(value: string) {
  return value.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/\s+/g, " ").trim();
}

function absolute(base: string, href: string) {
  try { return new URL(href, base).toString(); } catch { return ""; }
}

function categoryFor(text: string, fallback: string) {
  const v = text.toLowerCase();
  if (/admit|call letter|hall ticket/.test(v)) return "admit-card";
  if (/answer key|model answer|objection/.test(v)) return "answer-key";
  if (/result|marks|score|provisional allotment|final result|written result/.test(v)) return "results";
  if (/exam|examination|calendar|schedule|syllabus/.test(v)) return "exams";
  if (/recruitment|vacancy|apply online|notification|crp|officer|clerk|je|cgl|chsl|mts|constable|sub-inspector/.test(v)) return "jobs";
  return fallback;
}

function guide(category: string, source: string, title: string, url: string) {
  const action = category === "results" ? "सबसे पहले official result/marks page पर अपना परिणाम या score देखें और आगे की प्रक्रिया उसी notice के अनुसार करें." : category === "admit-card" ? "Official page से admit card/call letter डाउनलोड करके नाम, रोल नंबर, परीक्षा केंद्र और instructions जांचें." : category === "answer-key" ? "Official answer key/response sheet मिलाएं और objection window हो तो उसी official प्रक्रिया से आपत्ति करें." : category === "exams" ? "Official exam notice में date, syllabus, pattern और instructions जांचकर अपनी तैयारी/अगला चरण तय करें." : "Official notification में eligibility, dates, fee, documents और application rules जांचकर पात्र होने पर अगला चरण official portal से करें.";
  return `${source} के official page से मिला student-useful update: “${title}”. यह पेज केवल समझने और सही जगह पहुंचने के लिए है; अंतिम नियम official notice में ही मानें। ${action} Official source: ${url}`;
}

export async function monitorCentralOfficialSources() {
  await seedCategories();
  const categories = await db.category.findMany({ select: { id: true, slug: true } });
  const categoryId = new Map(categories.map((c) => [c.slug, c.id]));
  let discovered = 0;
  let saved = 0;
  let updated = 0;

  for (const source of SOURCES) {
    try {
      const response = await fetch(source.url, { cache: "no-store", headers: { "user-agent": "StudentUpdateOfficialMonitor/1.0" } });
      if (!response.ok) continue;
      const html = await response.text();
      const anchors = [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];
      const seen = new Set<string>();
      const candidates = anchors.map((m) => ({ href: absolute(source.url, m[1]), text: clean(m[2]) })).filter((x) => x.href && x.text.length >= 14 && x.text.length <= 220 && !seen.has(x.href) && source.keywords.some((k) => x.text.toLowerCase().includes(k.toLowerCase()))).slice(0, 30);
      for (const item of candidates) {
        seen.add(item.href);
        discovered += 1;
        const categorySlug = categoryFor(item.text, source.fallback);
        const cid = categoryId.get(categorySlug) || categoryId.get(source.fallback);
        if (!cid) continue;
        const externalId = `central:${source.name}:${item.href}`.slice(0, 900);
        const existing = await db.news.findUnique({ where: { externalId }, select: { id: true, title: true } });
        const description = guide(categorySlug, source.name, item.text, item.href);
        const entityKey = buildEntityKey(item.text, source.name);
        if (existing) {
          if (existing.title !== item.text) {
            await db.news.update({ where: { id: existing.id }, data: { title: item.text, description, sourceName: source.name, sourceUrl: item.href, entityKey, categoryId: cid } });
            updated += 1;
          }
          continue;
        }
        const slugBase = item.text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "").slice(0, 90) || `official-update-${Date.now()}`;
        const slug = `${slugBase}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
        await db.news.create({ data: { title: item.text, slug, entityKey, description, content: description, sourceName: source.name, sourceUrl: item.href, externalId, categoryId: cid, language: "HI", status: "PUBLISHED", isOriginal: true, publishedAt: new Date() } });
        saved += 1;
      }
    } catch (error) {
      console.error(`Central official monitor failed for ${source.name}:`, error);
    }
  }
  return { discovered, saved, updated };
}
