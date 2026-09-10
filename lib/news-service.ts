import { db } from "@/lib/db";

export async function getLatestNews(limit = 20) {
  return db.news.findMany({
    where: {
      status: "PUBLISHED"
    },
    orderBy: {
      publishedAt: "desc"
    },
    take: limit,
    include: {
      category: true
    }
  });
}
