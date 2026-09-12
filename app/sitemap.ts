import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://example.com").replace(/\/$/, "");
  const [categories, news] = await Promise.all([
    db.category.findMany({ select: { slug: true, updatedAt: true } }),
    db.news.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true, publishedAt: true, content: true }, orderBy: { publishedAt: "desc" }, take: 20000 }),
  ]);
  const indexableNews = news.filter((item) => (item.content || "").trim().length >= 300);
  return [
    { url: base, changeFrequency: "hourly", priority: 1 },
    { url: `${base}/search`, changeFrequency: "daily", priority: 0.5 },
    { url: `${base}/jobs`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/advertise`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/affiliate-disclosure`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/disclaimer`, changeFrequency: "yearly", priority: 0.2 },
    ...categories.map((c) => ({ url: `${base}/category/${c.slug}`, lastModified: c.updatedAt, changeFrequency: "hourly" as const, priority: 0.8 })),
    ...indexableNews.map((n) => ({ url: `${base}/news/${n.slug}`, lastModified: n.updatedAt, changeFrequency: "daily" as const, priority: 0.7 })),
  ];
}
