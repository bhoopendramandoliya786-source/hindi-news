import { db } from "@/lib/db";
import { fetchIndiaNews } from "@/lib/news-fetcher";
import { processNews } from "@/lib/news-processor";

export async function saveIndiaNews() {
  const articles = await fetchIndiaNews();

  const category = await db.category.upsert({
    where: {
      slug: "india"
    },
    update: {},
    create: {
      name: "भारत",
      slug: "india",
      description: "भारत की ताज़ा खबरें"
    }
  });

  let saved = 0;
  let skipped = 0;

  for (const article of articles) {
    try {
      const existing = await db.news.findUnique({
        where: {
          externalId: article.externalId
        }
      });

      if (existing) {
        skipped++;
        continue;
      }

      const processed = processNews(
        article,
        Date.now().toString()
      );

      await db.news.create({
        data: {
          title: processed.title,
          slug: processed.slug,
          description: processed.description,
          imageUrl: processed.imageUrl,
          sourceName: processed.sourceName,
          sourceUrl: processed.sourceUrl,
          externalId: processed.externalId,
          language: "EN",
          status: "PUBLISHED",
          categoryId: category.id,
          publishedAt: processed.publishedAt
        }
      });

      saved++;
    } catch (error) {
      console.error(
        `Unable to save article: ${article.title}`,
        error
      );
    }
  }

  return {
    fetched: articles.length,
    saved,
    skipped
  };
          }
