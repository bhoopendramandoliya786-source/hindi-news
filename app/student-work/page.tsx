import Link from "next/link";
import { cache } from "react";
import { db } from "@/lib/db";
import { buildStudentEntities } from "@/lib/student-entity";

export const revalidate = 60;

const getEntities = cache(async () => {
  const items = await db.news.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 2500,
    select: { title: true, category: { select: { slug: true, name: true } } },
  });
  const grouped = new Map<string, { title: string; categorySlug: string; categoryName: string }>();
  for (const item of items) {
    const key = `${item.category.slug}:${item.title}`;
    if (!grouped.has(key)) grouped.set(key, { title: item.title, categorySlug: item.category.slug, categoryName: item.category.name });
  }
  return buildStudentEntities([...grouped.values()], "student-updates").slice(0, 120);
});

export default async function StudentWorkIndex() {
  let entities: Awaited<ReturnType<typeof getEntities>> = [];
  let error = false;
  try { entities = await getEntities(); } catch (e) { error = true; console.error("Student master index failed", e); }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-6xl px-4">
        <div className="rounded-3xl bg-gradient-to-br from-red-700 to-red-500 p-7 text-white shadow-lg sm:p-9">
          <p className="text-xs font-black uppercase tracking-widest text-red-100">Student Master Hub</p>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">किस भर्ती, परीक्षा, रिजल्ट या स्कॉलरशिप का पूरा काम देखना है?</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-red-50 sm:text-base">एक ही काम के अलग-अलग official updates को एक master page में जोड़कर देखें—notification, form, admit card, answer key, result, merit, counselling और status जहां उपलब्ध हों।</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/latest" className="rounded-xl bg-white px-4 py-3 text-sm font-black text-red-700">आज के latest updates</Link>
            <Link href="/search" className="rounded-xl bg-gray-950 px-4 py-3 text-sm font-black text-white">अपना काम खोजें</Link>
          </div>
        </div>

        <section className="mt-7 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div><p className="text-xs font-black uppercase tracking-wider text-red-600">Live master list</p><h2 className="text-2xl font-black">एक काम → एक पूरी timeline</h2></div>
            <p className="text-xs text-gray-500">Verified published updates से अपने-आप बनती है</p>
          </div>
          {error ? <div className="mt-5 rounded-xl bg-amber-50 p-4 text-sm font-semibold text-gray-700">Master list अभी database से नहीं पढ़ पाई। थोड़ी देर बाद फिर खोलें।</div> : entities.length ? <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {entities.map((entity) => <Link key={entity.key} href={`/student-work/${entity.key}`} className="group rounded-2xl border border-gray-100 bg-gray-50 p-5 transition hover:-translate-y-0.5 hover:border-red-200 hover:bg-red-50">
              <div className="flex items-start justify-between gap-3"><span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-red-700">{entity.categorySlug}</span><span className="text-xs font-bold text-gray-400">{entity.count} updates</span></div>
              <h3 className="mt-3 line-clamp-2 text-lg font-black text-gray-950 group-hover:text-red-700">{entity.name}</h3>
              <p className="mt-2 text-xs leading-5 text-gray-600">पूरी भर्ती/परीक्षा/काम की timeline और अगला चरण देखें →</p>
            </Link>)}
          </div> : <div className="mt-5 rounded-xl bg-gray-50 p-5 text-sm text-gray-600">अभी master updates नहीं मिले। Automatic sync के बाद यह सूची भरती जाएगी।</div>}
        </section>

        <section className="mt-7 grid gap-4 sm:grid-cols-3">
          {[['1','पहले समझें','किस संस्था, परीक्षा, भर्ती या योजना की बात है'],['2','फिर तैयार हों','eligibility, documents, OTR और application details'],['3','अंत में action','अंतिम कार्रवाई हमेशा official source पर']].map(([n,t,d]) => <div key={n} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-sm font-black text-white">{n}</span><h2 className="mt-3 font-black">{t}</h2><p className="mt-1 text-sm leading-6 text-gray-600">{d}</p></div>)}
        </section>
      </div>
    </main>
  );
}
