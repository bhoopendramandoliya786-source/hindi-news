import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import AdSlot from "@/components/AdSense";

export const revalidate = 30;
const WHATSAPP_LINK = "https://whatsapp.com/channel/0029Vb8rO9c7DAWvQtwE3o3n";

const newsSelect = {
  id: true,
  title: true,
  description: true,
  imageUrl: true,
  publishedAt: true,
  createdAt: true,
  categoryId: true,
  category: { select: { id: true, name: true, slug: true } },
};

function dateText(value: Date | string | null | undefined) {
  return new Date(value || Date.now()).toLocaleDateString("hi-IN", { day: "numeric", month: "short", year: "numeric" });
}

function NewsCard({ item, featured = false }: { item: any; featured?: boolean }) {
  return (
    <article className={`group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg ${featured ? "md:col-span-2" : ""}`}>
      <Link href={`/news/${item.id}`} className="block">
        <div className={`${featured ? "h-64 sm:h-80" : "h-48"} relative overflow-hidden bg-gray-100`}>
          {item.imageUrl ? <Image src={item.imageUrl} alt={item.title} fill sizes={featured ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"} priority={featured} className="object-cover transition duration-500 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center bg-gradient-to-br from-red-600 to-orange-500 text-xl font-black text-white">Hindi News</div>}
        </div>
      </Link>
      <div className="p-4 sm:p-5">
        <div className="mb-2 flex items-center justify-between gap-3 text-xs">
          <Link href={`/category/${item.category?.slug || ""}`} className="font-black text-red-600 hover:underline">{item.category?.name || "समाचार"}</Link>
          <time className="text-gray-400">{dateText(item.publishedAt || item.createdAt)}</time>
        </div>
        <Link href={`/news/${item.id}`}>
          <h3 className={`${featured ? "text-xl sm:text-2xl" : "text-base"} font-black leading-snug text-gray-950 transition group-hover:text-red-600`}>{item.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-500">{item.description || item.title}</p>
        </Link>
        <div className="mt-4 border-t border-gray-100 pt-3">
          <Link href={`/news/${item.id}`} className="text-xs font-black text-red-600 hover:underline">पूरी खबर पढ़ें →</Link>
        </div>
      </div>
    </article>
  );
}

export default async function HomePage() {
  const [featured, breaking, latest, categories] = await Promise.all([
    db.news.findMany({ where: { status: "PUBLISHED", isFeatured: true }, orderBy: { publishedAt: "desc" }, take: 3, select: newsSelect }),
    db.news.findMany({ where: { status: "PUBLISHED", isBreaking: true }, orderBy: { publishedAt: "desc" }, take: 8, select: newsSelect }),
    db.news.findMany({ where: { status: "PUBLISHED" }, orderBy: { publishedAt: "desc" }, take: 18, select: newsSelect }),
    db.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true, _count: { select: { news: { where: { status: "PUBLISHED" } } } } },
    }),
  ]);

  const featuredIds = new Set(featured.map((item) => item.id));
  const latestWithoutFeatured = latest.filter((item) => !featuredIds.has(item.id));

  return (
    <main className="min-h-screen bg-gray-50 pb-16">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:py-8">
        <section className="rounded-3xl bg-gradient-to-r from-red-700 via-red-600 to-orange-500 p-6 text-white shadow-lg sm:p-10">
          <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-black">🔴 ताज़ा खबरें और जरूरी अपडेट</span>
          <h1 className="mt-4 text-3xl font-black sm:text-5xl">देश, राजस्थान और दुनिया की ताज़ा खबरें</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-red-50 sm:text-base">भारत, राजस्थान, सरकारी नौकरी, बिज़नेस, टेक्नोलॉजी, खेल और मनोरंजन की खबरें एक ही जगह।</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-green-500 px-5 py-3 text-sm font-black shadow hover:bg-green-600">💬 WhatsApp चैनल से जुड़ें</a>
            <Link href="/search" className="rounded-xl bg-white px-5 py-3 text-sm font-black text-red-700 hover:bg-red-50">🔎 खबर खोजें</Link>
          </div>
        </section>

        <AdSlot className="my-5" />

        {breaking.length > 0 && (
          <section className="mb-8 overflow-hidden rounded-2xl border border-red-100 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-red-100 px-4 py-3"><span className="rounded-md bg-red-600 px-2 py-1 text-xs font-black text-white">ब्रेकिंग</span><h2 className="font-black text-gray-950">बड़ी और ताज़ा खबरें</h2></div>
            <div className="divide-y divide-gray-100">{breaking.map((item) => <Link key={item.id} href={`/news/${item.id}`} className="block px-4 py-3 text-sm font-bold text-gray-800 hover:bg-red-50 hover:text-red-700">🔴 {item.title}</Link>)}</div>
          </section>
        )}

        {featured.length > 0 && (
          <section className="mb-10"><SectionTitle title="⭐ प्रमुख खबरें" /><div className="grid gap-5 md:grid-cols-2">{featured.map((item) => <NewsCard key={item.id} item={item} featured />)}</div></section>
        )}

        <AdSlot className="my-5" />

        <section className="mb-10">
          <SectionTitle title="📰 ताज़ा खबरें" />
          {latestWithoutFeatured.length === 0 ? <Empty /> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{latestWithoutFeatured.map((item) => <NewsCard key={item.id} item={item} />)}</div>}
        </section>

        {categories.slice(0, 6).map((category) => {
          const categoryNews = latest.filter((item) => item.categoryId === category.id).slice(0, 3);
          if (!categoryNews.length) return null;
          return <section key={category.id} className="mb-10"><div className="mb-5 flex items-center justify-between border-b-2 border-red-600 pb-2"><h2 className="text-xl font-black text-gray-950">{category.name}</h2><Link href={`/category/${category.slug}`} className="text-xs font-black text-red-600">सभी खबरें →</Link></div><div className="grid gap-5 md:grid-cols-3">{categoryNews.map((item) => <NewsCard key={item.id} item={item} />)}</div></section>;
        })}

        <AdSlot className="my-5" />

        <section className="rounded-2xl bg-gray-950 p-6 text-white sm:p-8">
          <h2 className="text-2xl font-black">📲 रोज़ की खबर सीधे WhatsApp पर</h2>
          <p className="mt-2 text-sm leading-6 text-gray-300">नई खबर, भर्ती, रिजल्ट और जरूरी अपडेट मिस न करें।</p>
          <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="mt-5 inline-block rounded-xl bg-green-500 px-5 py-3 text-sm font-black hover:bg-green-600">WhatsApp चैनल जॉइन करें →</a>
        </section>
      </div>
    </main>
  );
}

function SectionTitle({ title }: { title: string }) { return <div className="mb-5 flex items-center justify-between border-b-2 border-red-600 pb-2"><h2 className="text-xl font-black text-gray-950">{title}</h2></div>; }
function Empty() { return <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500">अभी कोई खबर उपलब्ध नहीं है।</div>; }
