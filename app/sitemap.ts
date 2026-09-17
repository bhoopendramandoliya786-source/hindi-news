import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { getStudentEntityKey } from "@/lib/student-entity";

export const revalidate = 3600;
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://hindi-news-omega.vercel.app").replace(/\/$/, "");
  let categories: any[] = [];
  let news: any[] = [];

  try {
    [categories, news] = await Promise.all([
      db.category.findMany({ select: { slug: true, updatedAt: true } }),
      // Keep the sitemap bounded so a large database can never make Google's
      // sitemap request expensive enough to produce an intermittent 5xx.
      db.news.findMany({
        where: { status: "PUBLISHED" },
        select: { slug: true, title: true, category: { select: { slug: true } }, updatedAt: true, publishedAt: true },
        orderBy: { publishedAt: "desc" },
        take: 5000,
      }),
    ]);
  } catch (error) {
    console.error("Sitemap database read failed:", error);
  }

  // Only expose master pages that have more than one linked update. This keeps
  // thin one-off entity pages out of the crawl map while preserving the useful
  // recruitment/exam lifecycle pages.
  const entityMap = new Map<string, { lastModified: Date; count: number }>();
  for (const item of news) {
    const key = getStudentEntityKey(item.title, item.category.slug);
    const modified = item.updatedAt || item.publishedAt || new Date();
    const previous = entityMap.get(key);
    if (!previous) entityMap.set(key, { lastModified: modified, count: 1 });
    else {
      previous.count += 1;
      if (modified > previous.lastModified) previous.lastModified = modified;
    }
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
    ...[...entityMap.entries()]
      .filter(([, value]) => value.count >= 2)
      .map(([key, value]) => ({ url: `${base}/student-work/${key}`, lastModified: value.lastModified, changeFrequency: "hourly" as const, priority: 0.75 })),
    ...news.map((n) => ({ url: `${base}/news/${n.slug}`, lastModified: n.updatedAt, changeFrequency: "daily" as const, priority: 0.7 })),
  ];
}
