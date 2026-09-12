import Link from "next/link";
import { db } from "@/lib/db";
import AdSlot from "@/components/AdSense";

export const dynamic = "force-dynamic";

export default async function JobsPage() {
  const category = await db.category.findUnique({ where: { slug: "jobs" }, include: { news: { where: { status: "PUBLISHED" }, orderBy: { publishedAt: "desc" }, take: 50 } } });

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-6xl px-4">
        <div className="rounded-3xl bg-gradient-to-r from-red-700 to-orange-500 p-7 text-white">
          <h1 className="text-3xl font-black">🏛️ सरकारी नौकरी और भर्ती</h1>
          <p className="mt-2 text-sm text-red-50">नई भर्ती, रिजल्ट, एडमिट कार्ड और सरकारी नौकरी की जरूरी जानकारी।</p>
        </div>
        <AdSlot className="my-5" />
        <div className="mb-6 rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
          <h2 className="font-black text-gray-950">📢 अपनी भर्ती या coaching का promotion करें</h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">Recruitment campaign, coaching institute या career service के लिए sponsored promotion उपलब्ध है।</p>
          <Link href="/advertise" className="mt-3 inline-block rounded-xl bg-red-600 px-4 py-2 text-sm font-black text-white">विज्ञापन की जानकारी →</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {category?.news.map((item) => <article key={item.id} className="overflow-hidden rounded-2xl bg-white shadow-sm"><Link href={`/news/${item.slug}`}><div className="h-48 bg-gray-100">{item.imageUrl ? <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-red-600">सरकारी नौकरी</div>}</div><div className="p-4"><h2 className="font-black text-gray-950 hover:text-red-600">{item.title}</h2><p className="mt-2 line-clamp-2 text-sm text-gray-500">{item.description}</p></div></Link></article>)}
        </div>
        {(!category || category.news.length === 0) && <div className="mt-6 rounded-2xl bg-white p-12 text-center text-gray-500">अभी कोई भर्ती खबर उपलब्ध नहीं है।</div>}
        <AdSlot className="my-5" />
      </div>
    </main>
  );
}
