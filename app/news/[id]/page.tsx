import Link from "next/link";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function NewsDetailPage({ params }: Props) {
  const { id } = await params;

  // 1. मुख्य खबर निकालें
  const newsItem = await (db as any).news.findUnique({
    where: { id: id },
    include: { category: true },
  });

  if (!newsItem) {
    notFound();
  }

  // 2. साइडबार के लिए अन्य ताज़ा खबरें निकालें
  const relatedNews = await (db as any).news.findMany({
    where: {
      id: { not: id },
      status: "PUBLISHED",
    },
    orderBy: { publishedAt: "desc" },
    take: 6,
  });

  return (
    <main className="min-h-screen bg-gray-50/50 py-6 md:py-10">
      <div className="container mx-auto max-w-5xl px-4">
        
        {/* Breadcrumb Navigation */}
        <div className="mb-4 flex items-center gap-2 text-xs font-semibold text-gray-500">
          <Link href="/" className="hover:text-red-600">होम</Link>
          <span>/</span>
          <Link href={`/category/${newsItem.category?.slug || ""}`} className="text-red-600 hover:underline uppercase">
            {newsItem.category?.name || "समाचार"}
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          
          {/* Main Article (Left 2 Columns) */}
          <article className="rounded-2xl border border-gray-100 bg-white p-5 md:p-8 shadow-sm lg:col-span-2">
            
            <div className="mb-3 flex items-center justify-between text-xs text-gray-500">
              <span className="rounded bg-red-50 px-2.5 py-1 font-bold text-red-600">
                {newsItem.category?.name || "ताज़ा खबर"}
              </span>
              <span>
                {new Date(newsItem.publishedAt || newsItem.createdAt).toLocaleDateString("hi-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-2xl font-black leading-snug text-gray-950 sm:text-3xl md:text-4xl mb-6">
              {newsItem.title}
            </h1>

            {/* Main Image */}
            {newsItem.imageUrl ? (
              <div className="relative mb-6 overflow-hidden rounded-xl bg-gray-100">
                <img
                  src={newsItem.imageUrl}
                  alt={newsItem.title}
                  className="w-full max-h-[420px] object-cover"
                />
              </div>
            ) : (
              <div className="mb-6 flex h-60 w-full items-center justify-center rounded-xl bg-gradient-to-r from-red-600 to-orange-500 text-white font-bold text-xl">
                📰 {newsItem.category?.name || "Hindi News"}
              </div>
            )}

            {/* Short Highlighted Summary */}
            {newsItem.description && (
              <div className="my-6 rounded-r-xl border-l-4 border-red-600 bg-red-50/50 p-4 text-base font-semibold leading-relaxed text-gray-800">
                {newsItem.description}
              </div>
            )}

            {/* Full Body Content */}
            <div className="text-base sm:text-lg leading-loose text-gray-700 space-y-4">
              <p>{newsItem.content || newsItem.description}</p>
            </div>

            {/* Footer Links */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-6">
              {newsItem.sourceUrl && (
                <a
                  href={newsItem.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  मूल स्रोत: {newsItem.sourceName || "यहाँ देखें"} ↗
                </a>
              )}

              <Link
                href="/"
                className="rounded-lg bg-gray-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-gray-800"
              >
                ← वापस होम पर जाएं
              </Link>
            </div>
          </article>

          {/* Sidebar: Related / Trending News (Right 1 Column) */}
          <aside className="space-y-6">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h3 className="border-b-2 border-red-600 pb-2 text-base font-black text-gray-950 mb-4">
                🔥 अन्य ताज़ा खबरें
              </h3>

              <div className="flex flex-col gap-4">
                {relatedNews.map((rel: any) => (
                  <Link
                    key={rel.id}
                    href={`/news/${rel.id}`}
                    className="group flex gap-3 items-center border-b border-gray-50 pb-3 last:border-0"
                  >
                    {rel.imageUrl ? (
                      <img
                        src={rel.imageUrl}
                        alt=""
                        className="h-16 w-20 rounded-lg object-cover bg-gray-100 shrink-0"
                      />
                    ) : (
                      <div className="h-16 w-20 rounded-lg bg-red-100 flex items-center justify-center text-xs font-bold text-red-600 shrink-0">
                        न्यूज़
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="line-clamp-2 text-xs font-bold leading-snug text-gray-900 group-hover:text-red-600 transition">
                        {rel.title}
                      </h4>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>

        </div>
      </div>
    </main>
  );
                    }
