import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";

export const revalidate = 300;
export const metadata: Metadata = { title: "ट्रेंडिंग खबरें", description: "Hindi News की सबसे ज्यादा पढ़ी जा रही और चर्चा में रहने वाली ताज़ा खबरें।" };

function trendScore(viewCount: number, publishedAt: Date | null) {
  const hours = publishedAt ? Math.max(1, (Date.now() - publishedAt.getTime()) / 3600000) : 168;
  return (Math.log1p(Math.max(0, viewCount)) * 8) / Math.pow(hours + 2, 0.42) + (hours < 24 ? 18 / Math.pow(hours + 1, 0.35) : 0);
}

export default async function TrendingPage() {
  const candidates = await db.news.findMany({ where: { status: "PUBLISHED", publishedAt: { not: null } }, include: { category: true }, orderBy: [{ publishedAt: "desc" }], take: 120 });
  const news = candidates.map((item) => ({ item, score: trendScore(item.viewCount, item.publishedAt) })).sort((a, b) => b.score - a.score).slice(0, 30).map(({ item }) => item);

  return <main className="min-h-screen bg-gray-50 py-8"><div className="mx-auto max-w-7xl px-4">
    <div className="mb-8 rounded-3xl bg-gray-950 p-6 text-white sm:p-8"><p className="text-sm font-bold text-red-400">HINDI NEWS • TRENDING</p><h1 className="mt-2 text-3xl font-black sm:text-4xl">ट्रेंडिंग खबरें</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-gray-300">नई और ज्यादा पढ़ी जा रही खबरों को ताजगी और पाठक रुचि दोनों के आधार पर दिखाया गया है।</p></div>
    {news.length === 0 ? <div className="rounded-2xl bg-white p-10 text-center text-gray-500">अभी ट्रेंडिंग खबरें उपलब्ध नहीं हैं।</div> : <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{news.map((item, index) => <Link key={item.id} href={`/news/${item.slug}`} prefetch className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 transition hover:-translate-y-0.5 hover:shadow-lg"><div className="relative aspect-[16/9] overflow-hidden bg-gray-100">{item.imageUrl ? <Image src={item.imageUrl} alt={item.title} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 33vw" /> : <div className="flex h-full items-center justify-center text-4xl">📰</div>}<span className="absolute left-3 top-3 rounded-full bg-red-600 px-3 py-1 text-xs font-black text-white">#{index + 1}</span></div><div className="p-5"><div className="flex items-center justify-between gap-3 text-xs font-bold text-gray-500"><span className="text-red-600">{item.category.name}</span><span>👁 {item.viewCount.toLocaleString("en-IN")}</span></div><h2 className="mt-3 line-clamp-3 text-lg font-extrabold leading-7 text-gray-950">{item.title}</h2>{item.description && <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-600">{item.description}</p>}</div></Link>)}</div>}
  </div></main>;
}
