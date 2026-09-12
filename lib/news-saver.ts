import { db } from "@/lib/db";
import { fetchAllHindiNews } from "@/lib/news-fetcher";
import { processNews } from "@/lib/news-processor";

const CATEGORY_MAP: Record<string, string> = {
  india: "भारत",
  rajasthan: "राजस्थान",
  world: "दुनिया",
  business: "बिज़नेस",
  technology: "टेक्नोलॉजी",
  sports: "खेल",
  entertainment: "मनोरंजन",
  jobs: "सरकारी नौकरी",
};

export async function saveIndiaNews() {
  const articles = await fetchAllHindiNews();
  let saved = 0;
  let skipped = 0;
  const categoryCache: Record<string, string> = {};
  for (const [slug, name] of Object.entries(CATEGORY_MAP)) {
    try {
      const cat = await (db as any).category.upsert({ where: { slug }, update: {}, create: { name, slug, description: `${name} की ताज़ा खबरें` } });
      categoryCache[slug] = cat.id;
    } catch (e) { console.error("Category cache error:", e); }
  }
  for (const article of articles) {
    try {
      const categoryId = categoryCache[article.categorySlug];
      if (!categoryId) continue;
      const existing = await (db as any).news.findFirst({ where: { OR: [{ externalId: article.externalId }, { title: article.title }] }, select: { id: true } });
      if (existing) { skipped++; continue; }
      const processed = processNews(article as any, Date.now().toString());
      await (db as any).news.create({ data: { title: processed.title, slug: processed.slug, description: processed.description, content: processed.description, imageUrl: processed.imageUrl, sourceName: processed.sourceName, sourceUrl: processed.sourceUrl, externalId: processed.externalId, language: "HI", status: "PUBLISHED", categoryId: categoryId, publishedAt: processed.publishedAt || new Date() } });
      saved++;
    } catch (error) { console.error(`Unable to save: ${article.title}`); }
  }
  return { fetched: articles.length, saved, skipped };
}
