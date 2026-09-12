import Link from "next/link";
import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import AdSlot from "@/components/AdSense";

interface Props { params: Promise<{ id: string }> }
const WHATSAPP_LINK = "https://whatsapp.com/channel/0029Vb8rO9c7DAWvQtwE3o3n";
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://hindi-news-omega.vercel.app").replace(/\/$/, "");

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

async function getNews(idOrSlug: string) {
  return db.news.findFirst({ where: { status: "PUBLISHED", OR: [{ id: idOrSlug }, { slug: idOrSlug }] }, include: { category: true } });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const item = await getNews(id);
  if (!item) return { title: "खबर नहीं मिली", robots: { index: false, follow: true } };
  const description = (item.description || item.title).slice(0, 160);
  const isThin = (item.content || "").trim().length < 300;
  return {
    title: item.title,
    description,
    robots: { index: !isThin, follow: true },
    alternates: { canonical: `${SITE_URL}/news/${item.slug}` },
    openGraph: { type: "article", title: item.title, description, url: `${SITE_URL}/news/${item.slug}`, publishedTime: item.publishedAt?.toISOString(), modifiedTime: item.updatedAt.toISOString(), images: item.imageUrl ? [{ url: item.imageUrl, alt: item.title }] : undefined },
    twitter: { card: "summary_large_image", title: item.title, description, images: item.imageUrl ? [item.imageUrl] : undefined },
  };
}

export default async function NewsDetailPage({ params }: Props) {
  const { id } = await params;
  const newsItem = await getNews(id);
  if (!newsItem) notFound();
  if (id !== newsItem.slug) redirect(`/news/${newsItem.slug}`);

  await db.news.update({ where: { id: newsItem.id }, data: { viewCount: { increment: 1 } } }).catch(() => null);

  const relatedNews = await db.news.findMany({ where: { status: "PUBLISHED", id: { not: newsItem.id }, categoryId: newsItem.categoryId }, orderBy: { publishedAt: "desc" }, take: 6, include: { category: true } });
  const fallback = relatedNews.length < 4 ? await db.news.findMany({ where: { status: "PUBLISHED", id: { not: newsItem.id } }, orderBy: { publishedAt: "desc" }, take: 6, include: { category: true } }) : relatedNews;
  const articleUrl = `${SITE_URL}/news/${newsItem.slug}`;
  const isThin = (newsItem.content || "").trim().length < 300;
  const schema = {
    "@context": "https://schema.org",
    "@type": newsItem.isSponsored ? "Article" : "NewsArticle",
    headline: newsItem.title,
    description: newsItem.description || newsItem.title,
    datePublished: newsItem.publishedAt?.toISOString(),
    dateModified: newsItem.updatedAt.toISOString(),
    mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl },
    image: newsItem.imageUrl ? [newsItem.imageUrl] : [],
    author: { "@type": "Person", name: newsItem.authorName || "Hindi News Desk" },
    publisher: { "@type": "Organization", name: "Hindi News", url: SITE_URL },
  };

  return (
    <main className="min-h-screen bg-gray-50 py-6 md:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-5 flex flex-wrap items-center gap-2 text-xs font-bold text-gray-500"><Link href="/" className="hover:text-red-600">होम</Link><span>/</span><Link href={`/category/${newsItem.category.slug}`} className="text-red-600 hover:underline">{newsItem.category.name}</Link></div>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-red-50 px-3 py-1 font-black text-red-600">{newsItem.category.name}</span>
              {newsItem.isBreaking && <span className="rounded-full bg-red-600 px-3 py-1 font-black text-white">ब्रेकिंग न्यूज़</span>}
              {newsItem.isOriginal && <span className="rounded-full bg-blue-50 px-3 py-1 font-black text-blue-700">विशेष रिपोर्ट</span>}
              {newsItem.isSponsored && <span className="rounded-full bg-amber-50 px-3 py-1 font-black text-amber-700">प्रायोजित</span>}
              <time className="text-gray-400">{new Date(newsItem.publishedAt || newsItem.createdAt).toLocaleString("hi-IN", { dateStyle: "long", timeStyle: "short" })}</time>
            </div>
            <h1 className="mt-4 text-2xl font-black leading-tight text-gray-950 sm:text-3xl md:text-4xl">{newsItem.title}</h1>
            <p className="mt-4 text-sm font-semibold leading-7 text-gray-600 sm:text-base">{newsItem.description}</p>
            <div className="mt-3 flex flex-wrap gap-4 text-xs font-semibold text-gray-400"><span>👁️ {newsItem.viewCount.toLocaleString("hi-IN")} views</span>{newsItem.authorName && <span>✍️ {newsItem.authorName}</span>}</div>
            {newsItem.isSponsored && <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><strong>प्रायोजित सामग्री:</strong> {newsItem.sponsorName || "यह सामग्री एक विज्ञापनदाता द्वारा प्रायोजित है।"}{newsItem.sponsorUrl && <> · <a href={newsItem.sponsorUrl} target="_blank" rel="noopener noreferrer" className="font-bold underline">विज्ञापनदाता की वेबसाइट</a></>}</div>}
            {newsItem.imageUrl && <div className="mt-6 overflow-hidden rounded-2xl bg-gray-100"><img src={newsItem.imageUrl} alt={newsItem.title} className="max-h-[520px] w-full object-cover" /></div>}
            <AdSlot className="my-5" />
            <div className="my-6 flex flex-wrap gap-3"><a href={`https://wa.me/?text=${encodeURIComponent(newsItem.title + " " + articleUrl)}`} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-green-600 px-4 py-2 text-xs font-black text-white">WhatsApp पर शेयर करें</a><a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-black text-white">Facebook पर शेयर करें</a></div>
            <div className="my-6 rounded-2xl border border-green-200 bg-green-50 p-5"><p className="text-sm font-black text-gray-900">📲 जरूरी खबरों और सरकारी नौकरी के अपडेट WhatsApp पर पाएं</p><a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block rounded-xl bg-green-600 px-5 py-2 text-xs font-black text-white">चैनल से जुड़ें →</a></div>
            {isThin && <div className="mb-5 rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm leading-6 text-orange-900"><strong>संक्षिप्त अपडेट:</strong> यह खबर उपलब्ध स्रोत से मिले संक्षिप्त विवरण पर आधारित है। विस्तृत जानकारी के लिए मूल स्रोत देखें।</div>}
            <div className="article-body">{renderFormattedContent(newsItem.content || newsItem.description || newsItem.title)}</div>
            <AdSlot className="my-5" />
            {newsItem.sourceName && <div className="mt-8 border-t pt-5 text-xs text-gray-500">स्रोत: <span className="font-bold">{newsItem.sourceName}</span>{newsItem.sourceUrl && <> · <a href={newsItem.sourceUrl} target="_blank" rel="noopener noreferrer" className="font-bold text-blue-700 hover:underline">मूल स्रोत देखें ↗</a></>}</div>}
          </article>
          <aside className="space-y-6">
            <AdSlot className="my-0" />
            <div className="rounded-2xl bg-white p-5 shadow-sm"><div className="mb-4 flex items-center justify-between border-b-2 border-red-600 pb-2"><h2 className="font-black">🔥 इससे जुड़ी खबरें</h2><Link href={`/category/${newsItem.category.slug}`} className="text-xs font-black text-red-600">सभी →</Link></div><div className="space-y-4">{fallback.map(rel => <Link key={rel.id} href={`/news/${rel.slug}`} className="group flex gap-3 border-b border-gray-100 pb-4 last:border-0"><div className="h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">{rel.imageUrl ? <img src={rel.imageUrl} alt={rel.title} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xs text-red-600">न्यूज़</div>}</div><h3 className="line-clamp-3 text-sm font-bold leading-5 text-gray-900 group-hover:text-red-600">{rel.title}</h3></Link>)}</div></div>
            <div className="rounded-2xl bg-gray-950 p-5 text-white"><h2 className="font-black">📲 WhatsApp</h2><p className="mt-2 text-xs leading-5 text-gray-300">ताज़ा खबरों के अपडेट के लिए चैनल से जुड़ें।</p><a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block rounded-lg bg-green-500 px-4 py-2 text-xs font-black">जुड़ें →</a></div>
          </aside>
        </div>
      </div>
    </main>
  );
}
