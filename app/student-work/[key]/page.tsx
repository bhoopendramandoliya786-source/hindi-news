import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { cache } from "react";
import { db } from "@/lib/db";
import { AdsterraBanner, AdsterraNative } from "@/components/AdsterraAds";
import { getStudentContext } from "@/lib/student-context";
import { getStudentEntityKey, getStudentEntityName } from "@/lib/student-entity";

interface Props { params: Promise<{ key: string }> }
export const revalidate = 60;
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://hindi-news-omega.vercel.app").replace(/\/$/, "");

const getAllCategories = cache(async () => db.category.findMany({
  select: { id: true, name: true, slug: true, news: {
    where: { status: "PUBLISHED" }, orderBy: { publishedAt: "desc" }, take: 100,
    select: { id: true, slug: true, title: true, description: true, imageUrl: true, sourceName: true, sourceUrl: true, publishedAt: true, createdAt: true }
  } }
}));

const LIFECYCLE = [
  { label: "Notification / भर्ती", slugs: ["jobs", "exams"] },
  { label: "Application / Form", slugs: ["jobs", "admission", "scholarship", "documents"] },
  { label: "Admit Card / Exam", slugs: ["admit-card", "exams"] },
  { label: "Answer Key / Objection", slugs: ["answer-key"] },
  { label: "Result / Merit / Selection", slugs: ["results"] },
  { label: "Counselling / Admission", slugs: ["admission"] },
  { label: "Scholarship / Status", slugs: ["scholarship"] },
  { label: "Scheme / Service", slugs: ["schemes", "citizen-services", "education"] },
] as const;

function dateValue(value: Date | string | null | undefined) {
  return value ? new Date(value).getTime() : 0;
}

export default async function StudentWorkPage({ params }: Props) {
  const { key } = await params;
  const categories = await getAllCategories();
  const matches = categories.flatMap(category => category.news.filter(item => getStudentEntityKey(item.title, category.slug) === key).map(item => ({ ...item, categoryName: category.name, categorySlug: category.slug })));
  if (!matches.length) notFound();

  matches.sort((a, b) => dateValue(b.publishedAt || b.createdAt) - dateValue(a.publishedAt || a.createdAt));
  const first = matches[0];
  const entityName = getStudentEntityName(first.title);
  const context = getStudentContext(first.categorySlug, entityName);
  const category = categories.find(c => c.slug === first.categorySlug);
  const latest = matches.slice(0, 30);

  const lifecycle = LIFECYCLE.map((stage, index) => {
    const items = matches.filter(item => stage.slugs.some(slug => slug === item.categorySlug)).sort((a, b) => dateValue(b.publishedAt || b.createdAt) - dateValue(a.publishedAt || a.createdAt));
    return { ...stage, index: index + 1, items, latest: items[0] || null };
  });

  const activeStages = lifecycle.filter(stage => stage.latest);
  const nextStage = activeStages[activeStages.length - 1] || null;
  const nextItem = nextStage?.latest || first;
  const nextAction = nextStage?.label || context.actionLabel || "नया official update देखें";

  const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "होम", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: category?.name || "Student Work", item: `${SITE_URL}/category/${first.categorySlug}` },
    { "@type": "ListItem", position: 3, name: entityName, item: `${SITE_URL}/student-work/${key}` }
  ] };

  return <main className="container mx-auto max-w-6xl px-4 py-6">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
    <Link href={`/category/${first.categorySlug}`} className="text-sm font-bold text-red-600">← {category?.name || "वापस"}</Link>

    <section className="mt-3 rounded-3xl bg-gradient-to-br from-red-700 to-red-500 p-6 text-white shadow-lg sm:p-8">
      <p className="text-xs font-black uppercase tracking-wider text-red-100">Student Master Update</p>
      <h1 className="mt-2 text-3xl font-black sm:text-4xl">{entityName}</h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-red-50 sm:text-base">यह एक ही भर्ती, परीक्षा, admission, scholarship या student काम के सभी published stages को जोड़ने वाला master page है। किसी नए official update के साथ यही page अपने आप नई स्थिति दिखाएगा।</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        <div className="rounded-2xl bg-white/10 p-4"><p className="text-xs font-bold text-red-100">किसका update?</p><p className="mt-1 font-black">{entityName}</p></div>
        <div className="rounded-2xl bg-white/10 p-4"><p className="text-xs font-bold text-red-100">जुड़े updates</p><p className="mt-1 text-2xl font-black">{matches.length}</p></div>
        <div className="rounded-2xl bg-white/10 p-4"><p className="text-xs font-bold text-red-100">मिले stages</p><p className="mt-1 text-2xl font-black">{activeStages.length}/{lifecycle.length}</p></div>
        <div className="rounded-2xl bg-white/10 p-4"><p className="text-xs font-bold text-red-100">अभी क्या करें?</p><p className="mt-1 font-black">{nextAction}</p></div>
      </div>
    </section>

    <section className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-5">
      <p className="text-xs font-black uppercase tracking-wider text-red-600">अभी क्या करें?</p>
      <h2 className="mt-1 text-xl font-black">{nextAction}</h2>
      <p className="mt-2 text-sm leading-6 text-gray-700">सबसे नया verified published stage नीचे से खोलें। अंतिम आवेदन, डाउनलोड, objection, result या status हमेशा उसी official source पर verify करें।</p>
      <Link href={`/news/${nextItem.slug}`} className="mt-4 inline-flex rounded-xl bg-red-600 px-5 py-3 text-sm font-black text-white">सबसे नया update खोलें →</Link>
    </section>

    <AdsterraNative />

    <section className="mt-7 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-black">पूरा live workflow</h2>
      <p className="mt-1 text-sm text-gray-500">जिस stage का official update मिला है वह हरा है; बाकी stages को अनुमान से live नहीं दिखाया गया है।</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {lifecycle.map((stage) => <div key={stage.label} className={`rounded-2xl border p-4 ${stage.latest ? "border-green-100 bg-green-50" : "border-dashed border-gray-200 bg-gray-50"}`}>
          <div className="flex items-start justify-between gap-2"><span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-black ${stage.latest ? "bg-green-600 text-white" : "bg-gray-200 text-gray-500"}`}>{stage.index}</span><span className={`rounded-full px-2 py-1 text-[10px] font-black ${stage.latest ? "bg-white text-green-700" : "bg-white text-gray-400"}`}>{stage.latest ? "Update मिला" : "अभी नहीं"}</span></div>
          <p className="mt-3 text-sm font-black text-gray-950">{stage.label}</p>
          {stage.latest ? <><p className="mt-2 line-clamp-2 text-xs leading-5 text-gray-600">{stage.latest.title}</p><Link href={`/news/${stage.latest.slug}`} className="mt-3 inline-block rounded-lg bg-gray-950 px-3 py-2 text-xs font-bold text-white">यह stage खोलें →</Link></> : <p className="mt-2 text-xs leading-5 text-gray-500">इस entity के लिए verified published update अभी नहीं मिला।</p>}
        </div>)}
      </div>
    </section>

    <section className="mt-7">
      <div className="mb-4"><p className="text-xs font-black uppercase tracking-wider text-red-600">Latest linked updates</p><h2 className="text-2xl font-black">{entityName} के सभी जरूरी updates</h2></div>
      <div className="grid gap-5 md:grid-cols-2">
        {latest.map((item, index) => { const itemContext = getStudentContext(item.categorySlug, item.title); return <article key={item.id} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          {item.imageUrl && <Link href={`/news/${item.slug}`} className="block"><div className="relative h-44 w-full bg-gray-100"><Image src={item.imageUrl} alt={item.title} fill sizes="(max-width: 768px) 100vw, 50vw" priority={index < 2} className="object-cover" /></div></Link>}
          <div className="p-5"><div className="flex items-center justify-between gap-3 text-xs"><span className="font-bold text-red-600">{itemContext.label}</span><span className="text-gray-400">{new Date(item.publishedAt || item.createdAt).toLocaleDateString("hi-IN", { day: "numeric", month: "short", year: "numeric" })}</span></div><Link href={`/news/${item.slug}`}><h3 className="mt-2 text-lg font-black leading-snug hover:text-red-600">{item.title}</h3></Link><p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600">{item.description || "Official source पर आधारित student action information."}</p><div className="mt-4 flex items-center justify-between gap-3 border-t border-gray-100 pt-4"><span className="truncate text-xs text-gray-500">Official: {item.sourceName || "Source"}</span><Link href={`/news/${item.slug}`} className="shrink-0 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white">पूरा समझें →</Link></div></div>
        </article> })}
      </div>
    </section>

    <AdsterraBanner />
    <section className="mt-7 rounded-2xl border border-gray-200 bg-white p-5">
      <h2 className="text-lg font-black">Official काम से पहले 5 checks</h2>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">{["सही संस्था/विभाग", "सही परीक्षा/भर्ती/योजना", "सही year/session", "अपनी eligibility और documents", "Official website और latest notice"].map(x => <div key={x} className="rounded-xl bg-gray-50 p-3 text-sm font-bold">✓ {x}</div>)}</div>
      <p className="mt-4 text-xs leading-5 text-gray-500">हम explanation को आसान बनाते हैं; अंतिम तारीख, fee, vacancy, eligibility और application rules का अंतिम भरोसा official source पर ही रखें।</p>
    </section>
  </main>;
}
