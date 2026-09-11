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
};

export async function saveIndiaNews() {
  const articles = await fetchAllHindiNews();

  let saved = 0;
  let skipped = 0;

  for (const article of articles) {
    try {
      const catName = CATEGORY_MAP[article.categorySlug] || "भारत";

      const category = await (db as any).category.upsert({
        where: { slug: article.categorySlug },
        update: {},
        create: {
          name: catName,
          slug: article.categorySlug,
          description: `${catName} की ताज़ा खबरें`,
        },
      });

      const existing = await (db as any).news.findFirst({
        where: {
          OR: [
            { externalId: article.externalId },
            { title: article.title },
          ],
        },
      });

      if (existing) {
        skipped++;
        continue;
      }

      const processed = processNews(article as any, Date.now().toString());

      await (db as any).news.create({
        data: {
          title: processed.title,
          slug: processed.slug,
          description: processed.description,
          content: processed.description,
          imageUrl: processed.imageUrl,
          sourceName: processed.sourceName,
          sourceUrl: processed.sourceUrl,
          externalId: processed.externalId,
          language: "HI",
          status: "PUBLISHED",
          categoryId: category.id,
          publishedAt: processed.publishedAt || new Date(),
        },
      });

      saved++;
    } catch (error) {
      console.error(`Unable to save article: ${article.title}`, error);
    }
  }

  return {
    fetched: articles.length,
    saved,
    skipped,
  };
    }
