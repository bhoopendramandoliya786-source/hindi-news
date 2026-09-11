import Link from "next/link";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function NewsDetailPage({ params }: Props) {
  const { id } = await params;

  // डेटाबेस से खबर निकालें
  const newsItem = await (db as any).news.findUnique({
    where: { id: id },
    include: { category: true },
  });

  if (!newsItem) {
    notFound();
  }

  return (
    <article className="container mx-auto max-w-3xl px-4 py-8">
      {/* Category & Date */}
      <div className="flex items-center justify-between text-sm mb-4">
        <Link
          href={`/category/${newsItem.category?.slug || ""}`}
          className="font-bold text-red-600 uppercase hover:underline"
        >
          {newsItem.category?.name || "समाचार"}
        </Link>
        <span className="text-gray-400 text-xs">
          {new Date(newsItem.publishedAt || newsItem.createdAt).toLocaleDateString("hi-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      {/* Main Title */}
      <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-6">
        {newsItem.title}
      </h1>

      {/* Main News Image */}
      {newsItem.imageUrl && (
        <div className="relative w-full overflow-hidden rounded-2xl mb-6 shadow-sm">
          <img
            src={newsItem.imageUrl}
            alt={newsItem.title}
            className="w-full max-h-[450px] object-cover"
          />
        </div>
      )}

      {/* Short Description / Highlight */}
      {newsItem.description && (
        <p className="text-lg font-medium text-gray-700 leading-relaxed border-l-4 border-red-600 pl-4 my-6 italic bg-gray-50 py-3 rounded-r-lg">
          {newsItem.description}
        </p>
      )}

      {/* Full Content */}
      <div className="text-gray-800 text-base leading-loose whitespace-pre-line mb-8">
        {newsItem.content || newsItem.description}
      </div>

      {/* Source & Back Link */}
      <div className="border-t border-gray-200 pt-6 flex flex-wrap items-center justify-between gap-4">
        {newsItem.sourceUrl && (
          <a
            href={newsItem.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline"
          >
            मूल स्रोत देखें: {newsItem.sourceName || "यहाँ क्लिक करें"} ↗
          </a>
        )}

        <Link
          href="/"
          className="inline-block rounded-md bg-gray-900 px-4 py-2 text-xs font-semibold text-white hover:bg-gray-800 transition"
        >
          ← वापस होम पर जाएं
        </Link>
      </div>
    </article>
  );
            }
