import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { cache } from "react";
import AdSlot from "@/components/AdSense";

interface Props { params: Promise<{ id: string }> }
const WHATSAPP_LINK = "https://whatsapp.com/channel/0029Vb8rO9c7DAWvQtwE3o3n";
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://hindi-news-omega.vercel.app").replace(/\/$/, "");

export const revalidate = 60;

function parseInlineLinks(text: string) {
  const urlRegex = /(https?:\/\/[^\s]+|[a-zA-Z0-9.-]+\.(?:gov\.in|nic\.in|com|in|org|edu)[^\s]*)/gi;
  return text.split(urlRegex).map((part, i) => part?.match(urlRegex) ? <a key={i} href={part.startsWith("http") ? part : `https://${part}`} target="_blank" rel="noopener noreferrer" className="font-bold text-blue-700 hover:underline break-all">{part} ↗</a> : part || null);
}

function renderFormattedContent(text: string) {
  if (!text) return null;
  const lines = text.split(/\r?\n/);
  const elements: React.ReactNode[] = [];
  let list: React.ReactNode[] = [];
  const flush = () => { if (list.length) { elements.push(<ul key={`ul-${elements.length}`} className="my-5 list-disc space-y-2 pl-6 text-base leading-8 text-gray-800">{list}</ul>); list = []; } };
  lines.forEach((line, i) => {
    const l = line.trim();
    if (!l) { flush(); return; }
    if (/^#{2,3}\s/.test(l)) { flush(); elements.push(<h2 key={`h-${i}`} className="mt-8 mb-3 text-xl font-black text-gray-950">{parseInlineLinks(l.replace(/^#{2,3}\s*/, ""))}</h2>); return; }
    if (l === "---") { flush(); elements.push(<hr key={`hr-${i}`} className="my-7 border-gray-200" />); return; }
    if (/^[-*•]\s+/.test(l)) { list.push(<li key={`li-${i}`}>{parseInlineLinks(l.replace(/^[-*•]\s+/, ""))}</li>); return; }
    flush(); elements.push(<p key={`p-${i}`} className="my-4 text-base leading-8 text-gray-800 sm:text-lg">{parseInlineLinks(l)}</p>);
  });
  flush();
  return elements;
}

const getNews = cache(async (idOrSlug: string) => {
  let raw = "";
  try { raw = decodeURIComponent(idOrSlug || "").trim().replace(/^\/+|\/+$/g, ""); } catch { raw = String(idOrSlug || "").trim().replace(/^\/+|\/+$/g, ""); }
  if (!raw) return null;
  try {
    const byId = await db.news.findFirst({ where: { status: "PUBLISHED", id: raw }, include: { category: true } });
    if (byId) return byId;
    return await db.news.findFirst({ where: { status: "PUBLISHED", slug: raw }, include: { category: true } });
  } catch (error) {
    console.error("[news-detail] database read failed", error);
    return null;
  }
});

function safeIso(value: Date | null | undefined) {
  try { return value instanceof Date && !Number.isNaN(value.getTime()) ? value.toISOString() : undefined; } catch { return undefined; }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params;
    const item = await getNews(id);
    if (!item) return { title: "खबर नहीं मिली", robots: { index: false, follow: true } };
    const description = (item.description || item.title).slice(0, 160);
    const publishedTime = safeIso(item.publishedAt);
    const modifiedTime = safeIso(item.updatedAt);
    return {
      title: item.title,
      description,
      robots: { index: true, follow: true },
      alternates: { canonical: `${SITE_URL}/news/${item.slug}` },
      openGraph: { type: "article", title: item.title, description, url: `${SITE_URL}/news/${item.slug}`, publishedTime, modifiedTime, images: item.imageUrl ? [{ url: item.imageUrl, alt: item.title }] : undefined },
      twitter: { card: "summary_large_image", title: item.title, description, images: item.imageUrl ? [item.imageUrl] : undefined },
    };
  } catch (error) {
    console.error("[news-detail] metadata failed", error);
    return { title: "Hindi News", robots: { index: false, follow: true } };
  }
}

export default async function NewsDetailPage({ params }: Props) {
  const { id } = await params;
  const newsItem = await getNews(id);
  if (!newsItem) notFound();

  const category = newsItem.category || { slug: "", name: "न्यूज़" };
  const relatedNews = await db.news.findMany({
    where: { status: "PUBLISHED", categoryId: newsItem.categoryId, id: { not: newsItem.id } },
    orderBy: [{ publishedAt: "desc" }],
    take: 5,
    select: { id: true, title: true, imageUrl: true, publishedAt: true },
  }).catch(() => []);

  void db.news.update({ where: { id: newsItem.id }, data: { viewCount: { increment: 1 } } }).catch((error) => console.error("[news-detail] view update failed", error));

  const articleUrl = `${SITE_URL}/news/${newsItem.slug}`;
  const bodyText = newsItem.content?.trim() || newsItem.description?.trim() || newsItem.title;
  const schema = {
    "@context": "https://schema.org",
    "@type": newsItem.isSponsored ? "Article" : "NewsArticle",
    headline: newsItem.title,
    description: newsItem.description || newsItem.title,
    datePublished: safeIso(newsItem.publishedAt),
    dateModified: safeIso(newsItem.updatedAt),
    mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl },
    image: newsItem.imageUrl ? [newsItem.imageUrl] : [],
    author: { "@type": "Person", name: newsItem.authorName || "Hindi News Desk" },
    publisher: { "@type": "Organization", name: "Hindi News", url: SITE_URL },
  };

  return (
    <main className="min-h-screen bg-gray-50 py-6 md:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-5 flex flex-wrap items-center gap-2 text-xs font-bold text-gray-500"><Link href="/">होम</Link><span>/</span>{category.slug ? <Link href={`/category/${category.slug}`} className="text-red-600 hover:underline">{category.name}</Link> : <span>न्यूज़</span>}</div>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-red-50 px-3 py-1 font-black text-red-600">{category.name}</span>
              {newsItem.isBreaking && <span className="rounded-full bg-red-600 px-3 py-1 font-black text-white">ब्रेकिंग न्यूज़</span>}
              {newsItem.isOriginal && <span className="rounded-full bg-blue-50 px-3 py-1 font-black text-blue-700">विशेष रिपोर्ट</span>}
              {newsItem.isSponsored && <span className="rounded-full bg-amber-50 px-3 py-1 font-black text-amber-700">प्रायोजित</span>}
              <time className="text-gray-400">{new Date(newsItem.publishedAt || newsItem.createdAt).toLocaleString("hi-IN", { dateStyle: "long", timeStyle: "short" })}</time>
            </div>
            <h1 className="mt-4 text-2xl font-black leading-tight text-gray-950 sm:text-3xl md:text-4xl">{newsItem.title}</h1>
            <p className="mt-4 text-sm font-semibold leading-7 text-gray-600 sm:text-base">{newsItem.description || newsItem.title}</p>
            <div className="mt-3 flex flex-wrap gap-4 text-xs font-semibold text-gray-400"><span>👁️ {Number(newsItem.viewCount || 0).toLocaleString("hi-IN")} views</span>{newsItem.authorName && <span>✍️ {newsItem.authorName}</span>}</div>
            {newsItem.isSponsored && <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><strong>प्रायोजित सामग्री:</strong> {newsItem.sponsorName || "यह सामग्री एक विज्ञापनदाता द्वारा प्रायोजित है।"}{newsItem.sponsorUrl && <> · <a href={newsItem.sponsorUrl} target="_blank" rel="noopener noreferrer" className="font-bold underline">विज्ञापनदाता की वेबसाइट</a></>}</div>}
            {newsItem.imageUrl && <div className="relative mt-6 h-[280px] overflow-hidden rounded-2xl bg-gray-100 sm:h-[420px] md:h-[520px]"><Image src={newsItem.imageUrl} alt={newsItem.title} fill priority sizes="(max-width: 1024px) 100vw, 800px" className="object-cover" /></div>}
            <AdSlot className="my-5" />
            <div className="my-6 flex flex-wrap gap-3"><a href={`https://wa.me/?text=${encodeURIComponent(newsItem.title + " " + articleUrl)}`} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-green-600 px-4 py-2 text-xs font-black text-white">WhatsApp पर शेयर करें</a><a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-black text-white">Facebook पर शेयर करें</a></div>
            <div className="my-6 rounded-2xl border border-green-200 bg-green-50 p-5"><p className="text-sm font-black text-gray-900">📲 जरूरी खबरों और सरकारी नौकरी के अपडेट WhatsApp पर पाएं</p><a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block rounded-xl bg-green-600 px-5 py-2 text-xs font-black text-white">चैनल से जुड़ें →</a></div>
            <section aria-label="खबर की पूरी जानकारी" className="mt-8 border-t border-gray-100 pt-6">
              <h2 className="mb-4 text-xl font-black text-gray-950">विस्तृत जानकारी</h2>
              <div className="article-body">{renderFormattedContent(bodyText)}</div>
            </section>
            <AdSlot className="my-5" />
            {newsItem.sourceName && <div className="mt-8 border-t pt-5 text-xs text-gray-500">स्रोत: <span className="font-bold">समाचार फ़ीड</span></div>}
          </article>
          <aside className="space-y-6">
            <AdSlot className="my-0" />
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center justify-between border-b-2 border-red-600 pb-2"><h2 className="font-black">🔥 इसी श्रेणी की ताज़ा खबरें</h2><Link href={category.slug ? `/category/${category.slug}` : "/"} className="text-xs font-black text-red-600">सभी →</Link></div>{relatedNews.length ? <div className="space-y-4">{relatedNews.map((item) => <Link key={item.id} href={`/news/${item.id}`} className="group flex gap-3"><div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">{item.imageUrl ? <Image src={item.imageUrl} alt="" fill sizes="80px" className="object-cover" /> : null}</div><div className="min-w-0"><p className="line-clamp-2 text-sm font-bold leading-5 text-gray-800 group-hover:text-red-600">{item.title}</p><time className="mt-1 block text-[10px] text-gray-400">{new Date(item.publishedAt).toLocaleDateString("hi-IN")}</time></div></Link>)}</div> : <p className="text-sm leading-7 text-gray-600">इस श्रेणी में अभी और खबरें उपलब्ध नहीं हैं।</p>}</div>
            <div className="rounded-2xl bg-gray-950 p-5 text-white"><h2 className="font-black">📲 WhatsApp</h2><p className="mt-2 text-xs leading-5 text-gray-300">ताज़ा खबरों के अपडेट के लिए चैनल से जुड़ें।</p><a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block rounded-lg bg-green-500 px-4 py-2 text-xs font-black">जुड़ें →</a></div>
          </aside>
        </div>
      </div>
    </main>
  );
}
