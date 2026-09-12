import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { cache } from "react";

interface Props { params: Promise<{ slug: string }> }
export const revalidate = 60;

const getCategory = cache(async (slug: string) => {
  return db.category.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      news: {
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        take: 30,
        select: {
          id: true,
          title: true,
          description: true,
          content: true,
          imageUrl: true,
          sourceName: true,
          publishedAt: true,
          createdAt: true,
        },
      },
    },
  });
});

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const category = await getCategory(slug);
  return {
    title: category ? `${category.name} की ताज़ा खबरें` : "कैटेगरी नहीं मिली",
    description: category?.description || "ताज़ा हिंदी खबरें",
    alternates: { canonical: `/category/${slug}` },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return <main className="container mx-auto px-4 py-16 text-center"><h1 className="mb-2 text-2xl font-bold text-red-600">कैटेगरी नहीं मिली</h1><p className="mb-6 text-gray-600">यह कैटेगरी अभी उपलब्ध नहीं है।</p><Link href="/" className="inline-block rounded-md bg-red-600 px-5 py-2 font-medium text-white hover:bg-red-700">होमपेज पर जाएं</Link></main>;

  return <main className="container mx-auto max-w-4xl px-4 py-6"><div className="mb-6 flex items-center justify-between border-b-2 border-red-600 pb-3"><div className="flex items-center gap-2"><span className="text-xl">📰</span><h1 className="text-2xl font-black text-gray-900">{category.name}</h1></div><span className="text-sm font-semibold text-red-600">Latest News</span></div>{category.news.length === 0 ? <div className="rounded-xl border border-dashed border-gray-300 py-16 text-center text-gray-500">इस कैटेगरी में फिलहाल कोई ताज़ा खबर उपलब्ध नहीं है।</div> : <div className="flex flex-col gap-6">{category.news.map((item, index) => <article key={item.id} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md transition hover:shadow-lg">{item.imageUrl && <div className="relative h-56 w-full overflow-hidden bg-gray-100 sm:h-72"><Image src={item.imageUrl} alt={item.title} fill sizes="(max-width: 768px) 100vw, 768px" priority={index < 2} className="object-cover" /></div>}<div className="p-5"><div className="mb-2 flex items-center justify-between gap-3 text-xs"><span className="font-bold text-red-600">{category.name}</span><span className="text-right text-gray-400">{new Date(item.publishedAt || item.createdAt).toLocaleDateString("hi-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "numeric" })}</span></div><Link href={`/news/${item.id}`} className="group/title block"><h2 className="mb-2 text-lg font-bold leading-snug text-gray-900 group-hover/title:text-red-600 sm:text-xl">{item.title}</h2></Link><p className="mb-5 line-clamp-3 text-sm leading-relaxed text-gray-600">{item.description || item.content}</p><div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-4"><span className="truncate text-xs text-gray-500">{item.sourceName || "दैनिक समाचार"}</span><Link href={`/news/${item.id}`} className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700">और पढ़ें →</Link></div></div></article>)}</div>}</main>;
}
