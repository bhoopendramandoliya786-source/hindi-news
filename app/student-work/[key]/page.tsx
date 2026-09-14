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

export default async function StudentWorkPage({ params }: Props) {
  const { key } = await params;
  const categories = await getAllCategories();
  const matches = categories.flatMap(category => category.news.filter(item => getStudentEntityKey(item.title, category.slug) === key).map(item => ({ ...item, categoryName: category.name, categorySlug: category.slug })));
  if (!matches.length) notFound();
  matches.sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime());
  const first = matches[0];
  const entityName = getStudentEntityName(first.title);
  const context = getStudentContext(first.categorySlug, entityName);
  const category = categories.find(c => c.slug === first.categorySlug);
  const latest = matches.slice(0, 30);
  const lifecycle = [
    { label: "Notification / जानकारी", slugs: ["jobs", "exams", "admission", "scholarship"] },
    { label: "Application / Form", slugs: ["jobs", "admission", "scholarship", "documents"] },
    { label: "Admit Card / Exam", slugs: ["admit-card", "exams"] },
    { label: "Answer Key / Objection", slugs: ["answer-key"] },
    { label: "Result / Merit / Selection", slugs: ["results"] },
  ];
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
      <p className="mt-3 max-w-3xl text-sm leading-7 text-red-50 sm:text-base">यह एक ही भर्ती, परीक्षा, admission, scholarship या student काम से जुड़े updates को एक जगह समझने का पेज है। सबसे ऊपर नया update देखें और उसी के हिसाब से अगला official काम करें।</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-white/10 p-4"><p className="text-xs font-bold text-red-100">किसका update?</p><p className="mt-1 font-black">{entityName}</p></div>
        <div className="rounded-2xl bg-white/10 p-4"><p className="text-xs font-bold text-red-100">कुल जुड़े updates</p><p className="mt-1 font-black">{matches.length}</p></div>
        <div className="rounded-2xl bg-white/10 p-4"><p className="text-xs font-bold text-red-100">अभी क्या करें?</p><p className="mt-1 font-black">नया update सबसे पहले देखें</p></div>
      </div>
    </section>

    <section className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-5">
      <p className="text-xs font-black uppercase tracking-wider text-red-600">पहले यह समझें</p>
      <h2 className="mt-1 text-xl font-black">{context.question}</h2>
      <p className="mt-2 text-sm leading-6 text-gray-700">हर card इसी exact काम/entity से जुड़ा है। कोई दूसरी भर्ती या परीक्षा मिलाने के बजाय title, संस्था और year/session को official source से verify करें।</p>
    </section>

    <AdsterraNative />

    <section className="mt-7 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-black">इसका पूरा रास्ता</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-5">
        {lifecycle.map((stage, i) => <div key={stage.label} className="rounded-xl bg-gray-50 p-4"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-sm font-black text-white">{i + 1}</span><p className="mt-3 text-sm font-black">{stage.label}</p><p className="mt-1 text-xs leading-5 text-gray-500">जब इस stage का official update आए, उसी card से आगे बढ़ें।</p></div>)}
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
