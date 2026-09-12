import { db } from "@/lib/db";

export async function GET() {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://example.com").replace(/\/$/, "");
  const since = new Date(Date.now() - 48 * 60 * 60 * 1000);
  const news = await db.news.findMany({ where: { status: "PUBLISHED", publishedAt: { gte: since } }, select: { slug: true, publishedAt: true, title: true }, orderBy: { publishedAt: "desc" }, take: 1000 });
  const body = news.map(item => `<url><loc>${base}/news/${item.slug}</loc><news:news><news:publication><news:name>Hindi News</news:name><news:language>hi</news:language></news:publication><news:publication_date>${(item.publishedAt || new Date()).toISOString()}</news:publication_date><news:title>${escapeXml(item.title)}</news:title></news:news></url>`).join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">${body}</urlset>`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600" } });
}
function escapeXml(value: string) { return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;"); }
