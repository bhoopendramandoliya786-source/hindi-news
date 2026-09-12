import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots { const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://example.com").replace(/\/$/, ""); return { rules: [{ userAgent: "*", allow: "/", disallow: ["/admin/", "/api/admin/"] }], sitemap: [`${base}/sitemap.xml`, `${base}/news-sitemap.xml`] }; }
