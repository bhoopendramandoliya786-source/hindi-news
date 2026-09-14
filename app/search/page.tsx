import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import type { Metadata } from "next";
import { AdsterraNative } from "@/components/AdsterraAds";

export const metadata: Metadata = { title: "Student काम खोजें", description: "राजस्थान की भर्ती, परीक्षा, Admit Card, Result, Scholarship और छात्र योजनाओं से जुड़ी आधिकारिक जानकारी खोजें।", robots: { index: false, follow: true } };
export const dynamic = "force-dynamic";
type Props = { searchParams: Promise<{ q?: string }> };

const TASKS = [
  ["jobs", "सरकारी भर्ती", "नोटिस → आवेदन → परीक्षा → रिजल्ट"],
  ["exams", "परीक्षाएं", "परीक्षा से जुड़े सभी अगले चरण"],
  ["admit-card", "Admit Card", "डाउनलोड → विवरण जांचें → परीक्षा"],
  ["answer-key", "Answer Key", "उत्तर मिलाएं → आपत्ति → Result"],
  ["results", "Results", "Result → score → अगला चरण"],
  ["scholarship", "Scholarship", "Eligibility → OTR → documents → status"],
  ["admission", "Admissions", "Eligibility → form → counselling → admission"],
  ["documents", "Documents", "कौन सा document और कहां लगेगा"],
  ["schemes", "सरकारी योजनाएं", "Eligibility → apply → status"],
] as const;

export default async function SearchPage({ searchParams }: Props) {
  const { q = "" } = await searchParams; const query = q.trim().slice(0, 100);
  const results = query ? await db.news.findMany({ where: { status: "PUBLISHED", OR: [{ title: { contains: query, mode: "insensitive" } }, { description: { contains: query, mode: "insensitive" } }, { content: { contains: query, mode: "insensitive" } }] }, orderBy: { publishedAt: "desc" }, take: 50, select: { id: true, title: true, description: true, imageUrl: true, sourceName: true, category: { select: { name: true, slug: true } } } }) : [];
  return <main className="min-h-screen bg-gray-50 py-8"><div className="mx-auto max-w-5xl px-4">
    <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-7"><div className="text-xs font-black uppercase tracking-wider text-red-600">Student Action Search</div><h1 className="mt-1 text-2xl font-black text-gray-950 sm:text-3xl">अपना सरकारी काम या student update खोजें</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">खबर के बजाय वह काम खोजें जो आपको करना है—जैसे REET Admit Card, scholarship, RPSC भर्ती या RBSE Result।</p><form className="mt-5 flex flex-col gap-2 sm:flex-row" role="search"><input name="q" defaultValue={query} maxLength={100} placeholder="जैसे: REET एडमिट कार्ड, छात्रवृत्ति, RPSC भर्ती, RBSE रिजल्ट" aria-label="Student काम खोजें" className="min-w-0 flex-1 rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-red-500" /><button className="rounded-xl bg-red-600 px-6 py-3 font-black text-white hover:bg-red-700">काम खोजें</button></form></section>
    {!query && <section className="mt-6"><h2 className="text-xl font-black text-gray-950">किस काम की जानकारी चाहिए?</h2><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{TASKS.map(([slug, label, desc]) => <Link key={slug} href={`/category/${slug}`} prefetch className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-red-200"><div className="font-black text-gray-950">{label} →</div><div className="mt-1 text-xs leading-5 text-gray-500">{desc}</div></Link>)}</div></section>}
    {query && <><div className="mb-4 mt-7 flex items-end justify-between gap-3"><div><div className="text-xs font-bold uppercase tracking-wider text-red-600">Search results</div><h2 className="text-xl font-black text-gray-950">“{query}” के लिए {results.length} updates</h2></div><Link href="/search" prefetch className="text-xs font-bold text-red-600">नई खोज</Link></div><div className="space-y-4">{results.map((item) => <article key={item.id} className="flex gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"><Link href={`/news/${item.id}`} prefetch className="relative h-24 w-28 shrink-0 overflow-hidden rounded-xl bg-gray-100 sm:h-28 sm:w-36">{item.imageUrl ? <Image src={item.imageUrl} alt={item.title} fill sizes="144px" className="object-cover" /> : <div className="flex h-full items-center justify-center text-center text-xs font-bold text-red-600">Student<br/>Update</div>}</Link><div className="min-w-0 flex-1"><Link href={`/category/${item.category.slug}`} prefetch className="text-xs font-black text-red-600">{item.category.name}</Link><Link href={`/news/${item.id}`} prefetch><h3 className="mt-1 font-black leading-snug text-gray-950 hover:text-red-600">{item.title}</h3></Link><p className="mt-1 line-clamp-2 text-sm leading-6 text-gray-500">{item.description || "Official source पर आधारित student action information."}</p><div className="mt-3 flex flex-wrap items-center gap-2"><span className="text-[11px] text-gray-400">Official: {item.sourceName || "Source"}</span><Link href={`/news/${item.id}`} prefetch className="rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white">पूरा काम देखें →</Link></div></div></article>)}</div><AdsterraNative />{results.length === 0 && <section className="mt-4 rounded-2xl bg-white p-8 text-center shadow-sm"><h3 className="font-black text-gray-900">इस search से exact update नहीं मिला</h3><p className="mt-2 text-sm text-gray-500">नीचे दिए student task में जाकर related official updates देखें।</p><div className="mt-4 flex flex-wrap justify-center gap-2">{TASKS.slice(0, 6).map(([slug, label]) => <Link key={slug} href={`/category/${slug}`} prefetch className="rounded-full bg-red-50 px-4 py-2 text-sm font-bold text-red-700">{label}</Link>)}</div></section>}</>}
  </div></main>;
}
