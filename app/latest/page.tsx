import Link from "next/link";
import { db } from "@/lib/db";
import { AdsterraNative } from "@/components/AdsterraAds";
import { getStudentContext } from "@/lib/student-context";
import { getStudentEntityKey, getStudentEntityName } from "@/lib/student-entity";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Latest Updates | नौकरी, रिजल्ट, Admit Card, Answer Key, Scholarship",
  description: "भारत और राजस्थान की latest सरकारी नौकरी, परीक्षा, Admit Card, Answer Key, Result, Scholarship, Admission और शिक्षा updates एक जगह।",
  alternates: { canonical: "https://hindi-news-omega.vercel.app/latest" },
};

const GROUPS = [
  ["jobs", "नई सरकारी नौकरियां", "Notification, भर्ती और आवेदन"],
  ["exams", "नई परीक्षाएं", "Exam notice, date, syllabus और schedule"],
  ["admit-card", "नए Admit Card", "परीक्षा से पहले जरूरी प्रवेश-पत्र"],
  ["answer-key", "नई Answer Keys", "उत्तर मिलान और objection"],
  ["results", "नए Results", "Result, merit, cutoff और selection"],
  ["scholarship", "नई Scholarships", "Scheme, OTR, application और status"],
  ["admission", "नए Admissions", "College, university, course और counselling"],
  ["education", "नई शिक्षा जानकारी", "Board, university और academic updates"],
  ["schemes", "नई सरकारी योजनाएं", "योजना, पात्रता और आवेदन"],
] as const;

export default async function LatestPage() {
  let items: any[] = [];
  let dbError = false;

  try {
    items = await db.news.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 120,
      select: { id: true, slug: true, title: true, description: true, sourceName: true, publishedAt: true, createdAt: true, category: { select: { name: true, slug: true } } },
    });
  } catch (error) {
    dbError = true;
    console.error("Latest page database read failed:", error);
  }

  const grouped = new Map(GROUPS.map(([slug]) => [slug, items.filter(item => item.category.slug === slug).slice(0, 10)]));
  const latest = items.slice(0, 30);

  return (
    <main className="min-h-screen bg-gray-50 py-7">
      <div className="mx-auto max-w-6xl px-4">
        <nav className="text-xs font-bold text-gray-500"><Link href="/">होम</Link><span className="mx-2">/</span>Latest Updates</nav>
        <section className="mt-4 rounded-3xl bg-gradient-to-br from-red-700 to-red-500 p-6 text-white shadow-lg sm:p-8">
          <p className="text-xs font-black uppercase tracking-wider text-red-100">Latest Student Updates</p>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">आज की सबसे जरूरी सरकारी जानकारी</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-red-50 sm:text-base">India-style latest hub: नौकरी, परीक्षा, Admit Card, Answer Key, Result, Scholarship, Admission और Education को अलग-अलग साफ हिस्सों में देखें। हर update में पहले यह पहचानें कि वह किस भर्ती, परीक्षा, योजना या course का है।</p>
          <div className="mt-5 flex flex-wrap gap-2">{GROUPS.map(([slug, label]) => <Link key={slug} href={`#${slug}`} className="rounded-full bg-white/10 px-3 py-2 text-xs font-black hover:bg-white/20">{label}</Link>)}</div>
        </section>

        {dbError && <section className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900"><b>Live updates अभी अस्थायी रूप से उपलब्ध नहीं हैं।</b> Page 500 पर नहीं गिरेगा। Automatic official sync/database ठीक होते ही latest items फिर अपने आप दिखेंगे।</section>}

        <section className="mt-7 rounded-2xl border border-red-100 bg-red-50 p-5">
          <p className="text-xs font-black uppercase tracking-wider text-red-600">सबसे पहले</p>
          <h2 className="mt-1 text-xl font-black text-gray-950">जिस काम के लिए आए हैं, वही section खोलें</h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">Latest list को सिर्फ headline की तरह न पढ़ें। किसी update पर जाने के बाद उसका exact exam/recruitment/scheme/year पहचानें और फिर उसी Student Master page से जुड़े सभी stages देखें।</p>
        </section>

        <AdsterraNative />

        <section className="mt-7 rounded-2xl bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-end justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-wider text-red-600">All latest</p><h2 className="text-2xl font-black">नवीनतम 30 updates</h2></div><Link href="/search" className="text-xs font-black text-red-600">अपना काम खोजें →</Link></div>
          <div className="mt-4 space-y-3">{latest.map(item => { const entityKey = getStudentEntityKey(item.title, item.category.slug); const entityName = getStudentEntityName(item.title); const context = getStudentContext(item.category.slug, item.title); return <article key={item.id} className="rounded-2xl border border-gray-100 p-4"><div className="flex flex-wrap items-center gap-2 text-[11px] font-black"><span className="rounded-full bg-red-50 px-2 py-1 text-red-700">{context.label}</span><span className="text-gray-400">{new Date(item.publishedAt || item.createdAt).toLocaleDateString("hi-IN", { day: "numeric", month: "short", year: "numeric" })}</span></div><Link href={`/news/${item.slug}`} className="mt-2 block font-black leading-snug text-gray-950 hover:text-red-600">{item.title}</Link><p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-500">{item.description || "Official source पर आधारित student action information."}</p><div className="mt-3 flex flex-wrap gap-2"><Link href={`/student-work/${entityKey}`} className="rounded-lg bg-gray-950 px-3 py-2 text-xs font-black text-white">{entityName} के सभी updates →</Link><Link href={`/news/${item.slug}`} className="rounded-lg bg-red-600 px-3 py-2 text-xs font-black text-white">पूरा समझें →</Link></div></article> })}</div>
        </section>

        {GROUPS.map(([slug, label, desc]) => { const group = grouped.get(slug) || []; return <section id={slug} key={slug} className="mt-8 scroll-mt-24"><div className="flex items-end justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-wider text-red-600">Latest {label}</p><h2 className="text-2xl font-black text-gray-950">{label}</h2><p className="mt-1 text-sm text-gray-500">{desc}</p></div><Link href={`/category/${slug}`} className="text-xs font-black text-red-600">सभी देखें →</Link></div>{group.length === 0 ? <div className="mt-4 rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-500">अभी इस section में कोई नया published update नहीं मिला।</div> : <div className="mt-4 grid gap-3 md:grid-cols-2">{group.map(item => <Link key={item.id} href={`/news/${item.slug}`} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm hover:border-red-200"><div className="text-xs font-black text-red-600">{item.sourceName || "Official source"}</div><div className="mt-1 font-black leading-snug text-gray-950">{item.title}</div><div className="mt-2 text-xs text-gray-500">{new Date(item.publishedAt || item.createdAt).toLocaleDateString("hi-IN", { day: "numeric", month: "short", year: "numeric" })}</div></Link>)}</div>}</section> })}

        <section className="mt-9 rounded-2xl border border-gray-200 bg-white p-5"><h2 className="text-lg font-black">Official action से पहले</h2><div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">{["सही संस्था/विभाग", "सही exam/recruitment/scheme", "सही year/session", "Eligibility और documents", "Official latest notice"].map(x => <div key={x} className="rounded-xl bg-gray-50 p-3 text-sm font-bold">✓ {x}</div>)}</div></section>
      </div>
    </main>
  );
}
