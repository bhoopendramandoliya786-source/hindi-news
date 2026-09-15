import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { getStudentEntityKey } from "@/lib/student-entity";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://hindi-news-omega.vercel.app").replace(/\/$/, "");
  let categories: any[] = [];
  let news: any[] = [];

  try {
    [categories, news] = await Promise.all([
      db.category.findMany({ select: { slug: true, updatedAt: true } }),
      db.news.findMany({
        where: { status: "PUBLISHED" },
        select: { slug: true, title: true, category: { select: { slug: true } }, updatedAt: true, publishedAt: true },
        orderBy: { publishedAt: "desc" },
        take: 20000,
      }),
    ]);
  } catch (error) {
    console.error("Sitemap database read failed:", error);
  }

  const entityMap = new Map<string, Date>();
  for (const item of news) {
    const key = getStudentEntityKey(item.title, item.category.slug);
    const previous = entityMap.get(key);
    const modified = item.updatedAt || item.publishedAt || new Date();
    if (!previous || modified > previous) entityMap.set(key, modified);
  }

  return [
    { url: base, changeFrequency: "hourly", priority: 1 },
    { url: `${base}/latest`, changeFrequency: "hourly", priority: 0.95 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/advertise`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/affiliate-disclosure`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/disclaimer`, changeFrequency: "yearly", priority: 0.2 },
    ...categories.map((c) => ({ url: `${base}/category/${c.slug}`, lastModified: c.updatedAt, changeFrequency: "hourly" as const, priority: 0.8 })),
    ...[...entityMap.entries()].map(([key, lastModified]) => ({ url: `${base}/student-work/${key}`, lastModified, changeFrequency: "hourly" as const, priority: 0.75 })),
    ...news.map((n) => ({ url: `${base}/news/${n.slug}`, lastModified: n.updatedAt, changeFrequency: "daily" as const, priority: 0.7 })),
  ];
}
