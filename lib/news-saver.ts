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

function normalizeTitle(value: string) {
  return value
    .toLowerCase()
    .replace(/<[^>]*>/g, " ")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function saveIndiaNews() {
  const articles = await fetchAllHindiNews();
  let saved = 0;
  let skipped = 0;
  let updated = 0;
  const categoryCache: Record<string, string> = {};

  for (const [slug, name] of Object.entries(CATEGORY_MAP)) {
    try {
      const cat = await (db as any).category.upsert({
        where: { slug },
        update: {},
        create: { name, slug, description: `${name} की ताज़ा खबरें` },
      });
      categoryCache[slug] = cat.id;
    } catch (e) {
      console.error("Category cache error:", e);
    }
  }

  for (const article of articles) {
    try {
      const categoryId = categoryCache[article.categorySlug];
      if (!categoryId) continue;

      const normalized = normalizeTitle(article.title);
      const existing = await (db as any).news.findFirst({
        where: {
          OR: [
            { externalId: article.externalId },
            { title: article.title },
          ],
        },
        select: { id: true, title: true, description: true, content: true, imageUrl: true, sourceUrl: true },
      });

      if (existing) {
        // Enrich an existing item when the feed later provides a better
        // description/image, while keeping the article URL stable.
        const currentNormalized = normalizeTitle(existing.title || "");
        const shouldRefresh =
          (!existing.description && !!article.description) ||
          (!existing.imageUrl && !!article.imageUrl) ||
          (!existing.content && !!article.description) ||
          (!currentNormalized && !!normalized);

        if (shouldRefresh) {
          const processed = processNews(article, existing.id);
          await (db as any).news.update({
            where: { id: existing.id },
            data: {
              description: processed.description,
              content: processed.content,
              imageUrl: processed.imageUrl || existing.imageUrl,
              sourceUrl: processed.sourceUrl || existing.sourceUrl,
            },
          });
          updated++;
        } else {
          skipped++;
        }
        continue;
      }

      const processed = processNews(article, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);

      try {
        await (db as any).news.create({
          data: {
            title: processed.title,
            slug: processed.slug,
            description: processed.description,
            content: processed.content,
            imageUrl: processed.imageUrl,
            sourceName: processed.sourceName,
            sourceUrl: processed.sourceUrl,
            externalId: processed.externalId,
            language: "HI",
            status: "PUBLISHED",
            categoryId,
            publishedAt: processed.publishedAt || new Date(),
          },
        });
        saved++;
      } catch (error: any) {
        const message = String(error?.message || error || "");
        if (error?.code === "P2002" || message.includes("Unique constraint failed")) {
          skipped++;
          continue;
        }
        throw error;
      }
    } catch (error) {
      console.error(`Unable to save: ${article.title}`, error);
    }
  }

  return { fetched: articles.length, saved, skipped, updated };
}
