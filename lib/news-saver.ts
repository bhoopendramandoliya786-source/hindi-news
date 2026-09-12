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

function titleTokens(value: string) {
  return new Set(normalizeTitle(value).split(" ").filter((token) => token.length >= 2));
}

function titleSimilarity(a: string, b: string) {
  const left = titleTokens(a);
  const right = titleTokens(b);
  if (!left.size || !right.size) return 0;
  let common = 0;
  for (const token of left) if (right.has(token)) common++;
  return common / Math.max(left.size, right.size);
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

  // Load a bounded recent window once so punctuation/word-order variations
  // cannot create obvious duplicate stories without making one DB query per item.
  const recentTitles = await (db as any).news.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 500,
    select: { id: true, title: true, description: true, content: true, imageUrl: true, sourceUrl: true },
  });

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

      const duplicate = recentTitles.find((item: any) => titleSimilarity(article.title, item.title) >= 0.88);
      if (duplicate) {
        skipped++;
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
        recentTitles.unshift({
          id: "new",
          title: processed.title,
          description: processed.description,
          content: processed.content,
          imageUrl: processed.imageUrl,
          sourceUrl: processed.sourceUrl,
        });
        if (recentTitles.length > 500) recentTitles.pop();
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
