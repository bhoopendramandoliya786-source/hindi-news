import Link from "next/link";
import { db } from "@/lib/db";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "खबर खोजें",
  description: "Hindi News पर खबरें खोजें।",
  robots: { index: false, follow: true },
};
export const dynamic = "force-dynamic";
type Props = { searchParams: Promise<{ q?: string }> };
export default async function SearchPage({ searchParams }: Props) {
  const { q = "" } = await searchParams; const query = q.trim();
  const results = query ? await db.news.findMany({ where: { status: "PUBLISHED", OR: [{ title: { contains: query, mode: "insensitive" } }, { description: { contains: query, mode: "insensitive" } }, { content: { contains: query, mode: "insensitive" } }] }, orderBy: { publishedAt: "desc" }, take: 50, include: { category: true } }) : [];
  return <main className="min-h-screen bg-gray-50 py-8"><div className="mx-auto max-w-5xl px-4"><div className="mb-6 rounded-2xl bg-white p-5 shadow-sm"><h1 className="text-2xl font-black">🔎 खबर खोजें</h1><form className="mt-4 flex gap-2"><input name="q" defaultValue={query} placeholder="जैसे: राजस्थान, REET, मोदी..." className="min-w-0 flex-1 rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-red-500"/><button className="rounded-xl bg-red-600 px-5 py-3 font-black text-white">खोजें</button></form></div>{query&&<h2 className="mb-4 text-lg font-black">“{query}” के लिए {results.length} खबरें मिलीं</h2>}<div className="space-y-4">{results.map((item)=><article key={item.id} className="flex gap-4 rounded-2xl bg-white p-4 shadow-sm"><Link href={`/news/${item.slug}`} className="h-24 w-32 shrink-0 overflow-hidden rounded-xl bg-gray-100">{item.imageUrl?<img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover"/>:<div className="flex h-full items-center justify-center text-xs font-bold text-red-600">न्यूज़</div>}</Link><div><Link href={`/category/${item.category.slug}`} className="text-xs font-black text-red-600">{item.category.name}</Link><Link href={`/news/${item.slug}`}><h3 className="mt-1 font-black text-gray-950 hover:text-red-600">{item.title}</h3></Link><p className="mt-1 line-clamp-2 text-sm text-gray-500">{item.description||item.content}</p></div></article>)}</div>{query&&results.length===0&&<div className="rounded-2xl bg-white p-12 text-center text-gray-500">इस शब्द से कोई खबर नहीं मिली।</div>}</div></main>;
}
