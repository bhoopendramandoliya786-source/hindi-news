import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { cache } from "react";
import AdSlot from "@/components/AdSense";
import { AdsterraNative, AdsterraBanner } from "@/components/AdsterraAds";

interface Props { params: Promise<{ id: string }> }
const WHATSAPP_LINK = "https://whatsapp.com/channel/0029Vb8rO9c7DAWvQtwE3o3n";
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://hindi-news-omega.vercel.app").replace(/\/$/, "");
export const revalidate = 60;

const categoryHelp: Record<string, { title: string; action: string; note: string; links: { label: string; slug: string }[] }> = {
  jobs: { title: "सरकारी नौकरी का अगला कदम", action: "आधिकारिक भर्ती पोर्टल पर नोटिफिकेशन, पात्रता और आवेदन स्थिति जांचें।", note: "आवेदन करने से पहले मूल विज्ञापन में योग्यता, शुल्क, तारीख और जरूरी दस्तावेज जरूर मिलाएं।", links: [{ label: "सरकारी नौकरी", slug: "jobs" }, { label: "एडमिट कार्ड", slug: "admit-card" }, { label: "रिजल्ट", slug: "results" }] },
  exams: { title: "परीक्षा के लिए क्या करें", action: "परीक्षा की आधिकारिक सूचना, पाठ्यक्रम और तारीख को मूल विभागीय स्रोत से मिलाएं।", note: "सोशल मीडिया पोस्ट को अंतिम सूचना न मानें; परीक्षा से जुड़ी तारीख आधिकारिक नोटिस से ही लें।", links: [{ label: "परीक्षा", slug: "exams" }, { label: "एडमिट कार्ड", slug: "admit-card" }, { label: "आंसर की", slug: "answer-key" }] },
  "admit-card": { title: "एडमिट कार्ड के लिए अगला कदम", action: "आधिकारिक पोर्टल खोलकर अपनी परीक्षा/भर्ती का एडमिट कार्ड और परीक्षा निर्देश देखें।", note: "नाम, रोल नंबर, परीक्षा केंद्र और निर्देश डाउनलोड करने के बाद तुरंत जांचें।", links: [{ label: "परीक्षा", slug: "exams" }, { label: "रिजल्ट", slug: "results" }] },
  "answer-key": { title: "आंसर की के बाद क्या करें", action: "आधिकारिक आंसर की देखें और यदि आपत्ति विंडो खुली हो तो केवल आधिकारिक प्रक्रिया से आपत्ति दर्ज करें।", note: "आपत्ति की अंतिम तारीख और शुल्क तभी लिखें जब मूल आधिकारिक नोटिस में स्पष्ट हो।", links: [{ label: "आंसर की", slug: "answer-key" }, { label: "रिजल्ट", slug: "results" }] },
  results: { title: "रिजल्ट देखने का अगला कदम", action: "आधिकारिक परिणाम पोर्टल पर अपना परिणाम/मेरिट स्थिति जांचें और उपलब्ध होने पर परिणाम डाउनलोड करें।", note: "रिजल्ट से जुड़ी कटऑफ, मेरिट या आगे की प्रक्रिया को आधिकारिक दस्तावेज से ही सत्यापित करें।", links: [{ label: "रिजल्ट", slug: "results" }, { label: "सरकारी नौकरी", slug: "jobs" }] },
  scholarship: { title: "स्कॉलरशिप के लिए क्या करें", action: "आधिकारिक Scholarship Portal पर आवेदन, स्थिति, जरूरी दस्तावेज और नवीनतम आदेश जांचें।", note: "स्कॉलरशिप में संस्था, दस्तावेज, OTR और तारीख से जुड़े नियम बदल सकते हैं; आवेदन से पहले ताजा सरकारी आदेश देखें।", links: [{ label: "स्कॉलरशिप", slug: "scholarship" }, { label: "डॉक्यूमेंट", slug: "documents" }, { label: "सरकारी योजनाएं", slug: "schemes" }] },
  admission: { title: "एडमिशन का अगला कदम", action: "संबंधित बोर्ड/विश्वविद्यालय/विभाग के आधिकारिक पोर्टल पर प्रवेश सूचना और आवेदन प्रक्रिया देखें।", note: "सीट, शुल्क, योग्यता और अंतिम तारीख को मूल admission notice से मिलाए बिना आवेदन न करें।", links: [{ label: "एडमिशन", slug: "admission" }, { label: "डॉक्यूमेंट", slug: "documents" }] },
  documents: { title: "डॉक्यूमेंट का अगला कदम", action: "जिस सरकारी काम के लिए दस्तावेज चाहिए, उसके आधिकारिक निर्देश के अनुसार दस्तावेज तैयार और सत्यापित करें।", note: "किसी भी दस्तावेज की वैधता या अनिवार्यता को संबंधित विभाग के मूल निर्देश से मिलाएं।", links: [{ label: "डॉक्यूमेंट", slug: "documents" }, { label: "सरकारी योजनाएं", slug: "schemes" }] },
  schemes: { title: "सरकारी योजना में अगला कदम", action: "योजना की आधिकारिक वेबसाइट पर पात्रता, आवेदन माध्यम, दस्तावेज और आवेदन/स्थिति लिंक जांचें।", note: "योजना की राशि या पात्रता जैसी जानकारी तभी मानें जब वह वर्तमान आधिकारिक स्रोत में दी गई हो।", links: [{ label: "सरकारी योजनाएं", slug: "schemes" }, { label: "डॉक्यूमेंट", slug: "documents" }] },
  "current-affairs": { title: "करंट अफेयर्स को कैसे उपयोग करें", action: "घटना के लिए संबंधित सरकारी/आधिकारिक स्रोत देखें और परीक्षा के लिए तथ्य नोट करें।", note: "करंट अफेयर्स में तारीख, पद और सरकारी निर्णय जैसे तथ्यों को आधिकारिक स्रोत से मिलाना बेहतर है।", links: [{ label: "करंट अफेयर्स", slug: "current-affairs" }, { label: "परीक्षा", slug: "exams" }] },
  "student-updates": { title: "छात्र के लिए अगला कदम", action: "इस अपडेट के मूल सरकारी स्रोत को खोलें और देखें कि आपके लिए आवेदन, डाउनलोड, सत्यापन या अगली प्रक्रिया उपलब्ध है या नहीं।", note: "यह पेज समझाने के लिए है; अंतिम निर्णय हमेशा संबंधित विभाग के आधिकारिक आदेश के आधार पर लें।", links: [{ label: "छात्र अपडेट", slug: "student-updates" }, { label: "डॉक्यूमेंट", slug: "documents" }] },
};

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

function buildReadableContent(title: string, description: string | null, content: string | null) {
  const original = (content || "").trim();
  if (original) return original;
  const summary = (description || "").trim();
  if (!summary || summary === title.trim()) return `## उपलब्ध जानकारी\n\n${title}`;
  return `## उपलब्ध आधिकारिक जानकारी\n\n${summary}`;
}

const getNews = cache(async (idOrSlug: string) => {
  let raw = "";
  try { raw = decodeURIComponent(idOrSlug || "").trim().replace(/^\/+|\/+$/g, ""); } catch { raw = String(idOrSlug || "").trim().replace(/^\/+|\/+$/g, ""); }
  if (!raw) return null;
  try {
    const byId = await db.news.findFirst({ where: { status: "PUBLISHED", id: raw }, include: { category: true } });
    if (byId) return byId;
    return await db.news.findFirst({ where: { status: "PUBLISHED", slug: raw }, include: { category: true } });
  } catch { return null; }
});

async function getRelatedNews(categoryId: string | null, excludeId: string) {
  if (!categoryId) return [];
  try { return await db.news.findMany({ where: { status: "PUBLISHED", categoryId, id: { not: excludeId } }, orderBy: { publishedAt: "desc" }, take: 6, select: { id: true, slug: true, title: true, publishedAt: true, createdAt: true } }); } catch { return []; }
}

function safeIso(value: Date | null | undefined) { return value ? new Date(value).toISOString() : undefined; }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params;
    const item = await getNews(id);
    if (!item) return { title: "जानकारी नहीं मिली", robots: { index: false, follow: true } };
    const description = (item.description || item.title).slice(0, 160);
    return { title: `${item.title} | Student Update`, description, robots: { index: true, follow: true }, alternates: { canonical: `${SITE_URL}/news/${item.slug}` }, openGraph: { type: "article", title: item.title, description, url: `${SITE_URL}/news/${item.slug}`, publishedTime: safeIso(item.publishedAt), modifiedTime: safeIso(item.updatedAt), images: item.imageUrl ? [{ url: item.imageUrl, alt: item.title }] : undefined }, twitter: { card: "summary_large_image", title: item.title, description, images: item.imageUrl ? [item.imageUrl] : undefined } };
  } catch { return { title: "Student Update", robots: { index: false, follow: true } }; }
}

export default async function NewsDetailPage({ params }: Props) {
  const { id } = await params;
  const newsItem = await getNews(id);
  if (!newsItem) notFound();
  const category = newsItem.category || { slug: "student-updates", name: "राजस्थान छात्र अपडेट" };
  const help = categoryHelp[category.slug] || categoryHelp["student-updates"];
  const relatedNews = await getRelatedNews(newsItem.categoryId, newsItem.id);
  void db.news.update({ where: { id: newsItem.id }, data: { viewCount: { increment: 1 } } }).catch((error) => console.error("[student-detail] view update failed", error));
  const articleUrl = `${SITE_URL}/news/${newsItem.slug}`;
  const bodyText = buildReadableContent(newsItem.title, newsItem.description, newsItem.content);
  const schema = { "@context": "https://schema.org", "@type": "Article", headline: newsItem.title, description: newsItem.description || newsItem.title, datePublished: safeIso(newsItem.publishedAt), dateModified: safeIso(newsItem.updatedAt), inLanguage: "hi-IN", articleSection: category.name, mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl }, image: newsItem.imageUrl ? [newsItem.imageUrl] : [], author: { "@type": "Organization", name: "Student Update" }, publisher: { "@type": "Organization", name: "Student Update", url: SITE_URL } };
  const breadcrumbSchema = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "होम", item: SITE_URL }, { "@type": "ListItem", position: 2, name: category.name, item: `${SITE_URL}/category/${category.slug}` }, { "@type": "ListItem", position: 3, name: newsItem.title, item: articleUrl }] };

  return (
    <main className="min-h-screen bg-gray-50 py-6 md:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-5 flex flex-wrap items-center gap-2 text-xs font-bold text-gray-500"><Link href="/">होम</Link><span>/</span><Link href={`/category/${category.slug}`} className="text-red-600 hover:underline">{category.name}</Link></div>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-center gap-2 text-xs"><span className="rounded-full bg-blue-50 px-3 py-1 font-black text-blue-700">{category.name}</span><span className="rounded-full bg-green-50 px-3 py-1 font-black text-green-700">Official-source guide</span><time className="text-gray-400">{new Date(newsItem.publishedAt || newsItem.createdAt).toLocaleString("hi-IN", { dateStyle: "long", timeStyle: "short" })}</time></div>
            <h1 className="mt-4 text-2xl font-black leading-tight text-gray-950 sm:text-3xl md:text-4xl">{newsItem.title}</h1>
            <p className="mt-4 text-sm font-semibold leading-7 text-gray-600 sm:text-base">{newsItem.description || "इस अपडेट से जुड़े सत्यापित तथ्यों के आधार पर आगे की प्रक्रिया समझें।"}</p>
            {newsItem.imageUrl && <div className="relative mt-6 h-[260px] overflow-hidden rounded-2xl bg-gray-100 sm:h-[400px]"><Image src={newsItem.imageUrl} alt={newsItem.title} fill priority sizes="(max-width: 1024px) 100vw, 800px" className="object-cover" /></div>}

            <section className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5" aria-label="अभी क्या करें">
              <p className="text-xs font-black uppercase tracking-wide text-blue-700">अभी क्या करें</p>
              <h2 className="mt-1 text-xl font-black text-gray-950">{help.title}</h2>
              <p className="mt-2 text-sm leading-7 text-gray-700">{help.action}</p>
              {newsItem.sourceUrl ? <a href={newsItem.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex rounded-xl bg-blue-700 px-5 py-3 text-sm font-black text-white hover:bg-blue-800">आधिकारिक स्रोत खोलें ↗</a> : <div className="mt-4 rounded-xl bg-white p-3 text-xs font-bold text-gray-600">आधिकारिक लिंक उपलब्ध होने पर यहां दिखाया जाएगा।</div>}
            </section>

            <section className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5"><h2 className="text-base font-black text-gray-950">⚠️ जरूरी सावधानी</h2><p className="mt-2 text-sm leading-7 text-gray-700">{help.note}</p></section>

            <AdSlot className="my-5" />

            <section className="mt-6" aria-label="सत्यापित जानकारी"><h2 className="mb-3 text-xl font-black text-gray-950">सत्यापित जानकारी और पूरा तरीका</h2><div className="article-body">{renderFormattedContent(bodyText)}</div></section>

            <AdsterraNative />

            <section className="mt-7 border-t pt-6"><h2 className="text-xl font-black text-gray-950">इस काम से जुड़े अगले चरण</h2><div className="mt-4 grid gap-3 sm:grid-cols-3">{help.links.map((link) => <Link key={link.slug} href={`/category/${link.slug}`} className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm font-black text-gray-800 hover:border-red-300 hover:bg-red-50 hover:text-red-700">{link.label} →</Link>)}</div></section>

            {newsItem.sourceName && <div className="mt-7 rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs text-gray-600">आधिकारिक स्रोत: <span className="font-black">{newsItem.sourceName}</span>{newsItem.sourceUrl && <> · <a href={newsItem.sourceUrl} target="_blank" rel="noopener noreferrer" className="font-bold text-red-600 hover:underline">मूल पेज देखें ↗</a></>}</div>}

            <div className="my-6 flex flex-wrap gap-3"><a href={`https://wa.me/?text=${encodeURIComponent(newsItem.title + " " + articleUrl)}`} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-green-600 px-4 py-2 text-xs font-black text-white">WhatsApp पर शेयर करें</a><a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-green-50 px-4 py-2 text-xs font-black text-green-700">Student Update चैनल →</a></div>
            <AdSlot className="my-5" />
          </article>

          <aside className="space-y-6">
            <AdsterraBanner />
            <AdSlot className="my-0" />
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"><h2 className="mb-4 border-b-2 border-red-600 pb-2 font-black">📌 छात्र के काम के अगले पेज</h2><div className="grid gap-2">{[{label:"सरकारी नौकरी",slug:"jobs"},{label:"परीक्षा",slug:"exams"},{label:"एडमिट कार्ड",slug:"admit-card"},{label:"आंसर की",slug:"answer-key"},{label:"रिजल्ट",slug:"results"},{label:"स्कॉलरशिप",slug:"scholarship"},{label:"एडमिशन",slug:"admission"},{label:"डॉक्यूमेंट",slug:"documents"},{label:"सरकारी योजनाएं",slug:"schemes"}].map((x) => <Link key={x.slug} href={`/category/${x.slug}`} className="rounded-lg px-3 py-2 text-sm font-bold text-gray-700 hover:bg-red-50 hover:text-red-700">{x.label} →</Link>)}</div></div>
            <div className="rounded-2xl bg-gray-950 p-5 text-white"><h2 className="font-black">🎓 Student Update</h2><p className="mt-2 text-xs leading-6 text-gray-300">यहां खबर को सिर्फ पढ़ाया नहीं जाता—सरकारी काम की अगली प्रक्रिया समझाई जाती है।</p><Link href="/" className="mt-4 inline-block rounded-lg bg-white px-4 py-2 text-xs font-black text-gray-950">छात्र होम खोलें →</Link></div>
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"><h2 className="mb-4 border-b-2 border-red-600 pb-2 font-black">🔗 इसी विषय की जानकारी</h2>{relatedNews.length ? <div className="space-y-4">{relatedNews.map((item) => <Link key={item.id} href={`/news/${item.id}`} className="group block"><p className="line-clamp-2 text-sm font-bold leading-6 text-gray-800 group-hover:text-red-600">{item.title}</p><time className="text-[11px] text-gray-400">{new Date(item.publishedAt || item.createdAt).toLocaleDateString("hi-IN")}</time></Link>)}</div> : <p className="text-sm leading-7 text-gray-600">इस विषय की नई जानकारी उपलब्ध होने पर यहां दिखाई जाएगी।</p>}</div>
          </aside>
        </div>
      </div>
    </main>
  );
}