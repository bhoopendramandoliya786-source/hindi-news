import { db } from "@/lib/db";
import { fetchAllHindiNews } from "@/lib/news-fetcher";
import { processNews } from "@/lib/news-processor";
import { buildStudentIdentity } from "@/lib/student-context";

type ExistingNews = {
  id: string;
  externalId?: string;
  title: string;
  description: string | null;
  content: string | null;
  imageUrl: string | null;
  sourceUrl: string | null;
  categoryId: string;
};

const CATEGORY_MAP: Record<string, string> = {
  jobs: "सरकारी नौकरी",
  exams: "परीक्षा",
  "admit-card": "एडमिट कार्ड",
  "answer-key": "आंसर की",
  results: "रिजल्ट",
  scholarship: "स्कॉलरशिप",
  admission: "एडमिशन",
  documents: "डॉक्यूमेंट",
  schemes: "सरकारी योजनाएं",
  "citizen-services": "नागरिक सेवाएं",
  education: "शिक्षा",
  "current-affairs": "करंट अफेयर्स",
  "student-updates": "राजस्थान छात्र अपडेट",
};

function normalizeTitle(value: string) {
  return value.toLowerCase().replace(/<[^>]*>/g, " ").replace(/https?:\/\/\S+/g, " ").replace(/[^\p{L}\p{N}]+/gu, " ").replace(/\s+/g, " ").trim();
}

function titleTokens(value: string) { return new Set(normalizeTitle(value).split(" ").filter((token) => token.length >= 2)); }

function titleSimilarity(a: string, b: string) {
  const left = titleTokens(a), right = titleTokens(b);
  if (!left.size || !right.size) return 0;
  let common = 0;
  for (const token of left) if (right.has(token)) common++;
  return common / Math.max(left.size, right.size);
}

function addWhatIsThisContext(description: string | null, title: string, categorySlug: string) {
  const clean = (description || "").trim();
  const context = buildStudentIdentity(categorySlug, title);
  if (!clean) return context;
  const question = context.slice(0, context.indexOf(title.trim()) >= 0 ? context.indexOf(title.trim()) : 0).trim();
  if (question && clean.includes(question)) return clean;
  return `${context}\n\n${clean}`;
}

export async function saveIndiaNews() {
  const articles = await fetchAllHindiNews();
  let saved = 0, skipped = 0, updated = 0;
  const categoryCache: Record<string, string> = {};

  for (const [slug, name] of Object.entries(CATEGORY_MAP)) {
    try {
      const cat = await db.category.upsert({ where: { slug }, update: { name }, create: { name, slug, description: `${name} से जुड़ी छात्र और नागरिक उपयोगी जानकारी` } });
      categoryCache[slug] = cat.id;
    } catch (e) { console.error("Category cache error:", e); }
  }

  const recentTitles: ExistingNews[] = await db.news.findMany({
    where: { status: "PUBLISHED" }, orderBy: { publishedAt: "desc" }, take: 1000,
    select: { id: true, title: true, description: true, content: true, imageUrl: true, sourceUrl: true, categoryId: true },
  });

  const externalIds = [...new Set(articles.map((article) => article.externalId))];
  const existingByExternal: ExistingNews[] = externalIds.length ? await db.news.findMany({
    where: { externalId: { in: externalIds } },
    select: { id: true, externalId: true, title: true, description: true, content: true, imageUrl: true, sourceUrl: true, categoryId: true },
  }) : [];
  const existingMap = new Map(existingByExternal.map((item) => [item.externalId, item]));

  for (const article of articles) {
    try {
      const categoryId = categoryCache[article.categorySlug];
      if (!categoryId) continue;
      const normalized = normalizeTitle(article.title);
      let existing: ExistingNews | undefined = existingMap.get(article.externalId);
      if (!existing) existing = recentTitles.find((item) => item.title === article.title);

      if (existing) {
        const currentNormalized = normalizeTitle(existing.title || "");
        const contextualDescription = addWhatIsThisContext(existing.description || article.description, article.title, article.categorySlug);
        const categoryChanged = existing.categoryId !== categoryId;
        const shouldRefresh = categoryChanged || contextualDescription !== (existing.description || "") || (!existing.imageUrl && !!article.imageUrl) || (!existing.content && !!article.description) || (!currentNormalized && !!normalized) || (!existing.sourceUrl && !!article.sourceUrl);
        if (shouldRefresh) {
          const processed = processNews(article, existing.id);
          await db.news.update({ where: { id: existing.id }, data: { categoryId, description: contextualDescription || processed.description, content: processed.content, imageUrl: processed.imageUrl || existing.imageUrl, sourceUrl: processed.sourceUrl || existing.sourceUrl, sourceName: processed.sourceName || undefined } });
          existing.categoryId = categoryId;
          existing.description = contextualDescription || processed.description;
          updated++;
        } else skipped++;
        continue;
      }

      if (recentTitles.some((item) => titleSimilarity(article.title, item.title) >= 0.88)) { skipped++; continue; }

      const processed = processNews(article, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
      const contextualDescription = addWhatIsThisContext(processed.description, processed.title, article.categorySlug);
      try {
        const created = await db.news.create({ data: { title: processed.title, slug: processed.slug, description: contextualDescription, content: processed.content, imageUrl: processed.imageUrl, sourceName: processed.sourceName, sourceUrl: processed.sourceUrl, externalId: processed.externalId, language: "HI", status: "PUBLISHED", categoryId, publishedAt: processed.publishedAt || new Date() } });
        recentTitles.unshift({ id: created.id, title: processed.title, description: contextualDescription, content: processed.content, imageUrl: processed.imageUrl, sourceUrl: processed.sourceUrl, categoryId });
        existingMap.set(processed.externalId, { id: created.id, externalId: processed.externalId, title: processed.title, description: contextualDescription, content: processed.content, imageUrl: processed.imageUrl, sourceUrl: processed.sourceUrl, categoryId });
        if (recentTitles.length > 1000) recentTitles.pop();
        saved++;
      } catch (error: any) {
        const message = String(error?.message || error || "");
        if (error?.code === "P2002" || message.includes("Unique constraint failed")) skipped++; else throw error;
      }
    } catch (error) { console.error(`Unable to save: ${article.title}`, error); }
  }

  // Central/official monitoring is intentionally orchestrated by
  // scripts/fetch-news.ts. Keeping it here as well caused every scheduled run
  // to fetch and process the central sources twice, increasing database load
  // and duplicate-write contention.
  return { fetched: articles.length, saved, skipped, updated };
}
