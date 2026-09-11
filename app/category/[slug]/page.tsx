import Link from "next/link";
import { db } from "@/lib/db";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;

  // डेटाबेस से कैटेगरी और उससे जुड़ी पब्लिश खबरें लाएं
  const category = await (db as any).category.findFirst({
    where: {
      slug: slug,
    },
    include: {
      news: {
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        take: 30,
      },
    },
  });

  if (!category) {
    return (
      <main className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-2">
          कैटेगरी नहीं मिली
        </h1>
        <p className="text-gray-600 mb-6">
          यह कैटेगरी अभी उपलब्ध नहीं है।
        </p>
        <Link
          href="/"
          className="inline-block rounded-md bg-red-600 px-5 py-2 text-white font-medium hover:bg-red-700 transition"
        >
          होमपेज पर जाएं
        </Link>
      </main>
    );
  }

  return (
    <main className="container mx-auto max-w-4xl px-4 py-6">
      {/* Category Header */}
      <div className="flex items-center justify-between border-b-2 border-red-600 pb-3 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-xl">📰</span>
          <h1 className="text-2xl font-black text-gray-900">
            {category.name}
          </h1>
        </div>
        <span className="text-sm font-semibold text-red-600">
          Latest News
        </span>
      </div>

      {category.news.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 py-16 text-center text-gray-500">
          इस कैटेगरी में फिलहाल कोई ताज़ा खबर उपलब्ध नहीं है।
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {category.news.map((item: any) => (
            <article
              key={item.id}
              className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md transition hover:shadow-lg"
            >
              {/* Image */}
              {item.imageUrl && (
                <div className="relative h-56 w-full overflow-hidden bg-gray-100 sm:h-72">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              {/* Card Body */}
              <div className="p-5">
                {/* Meta Header */}
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold text-red-600">
                    {category.name}
                  </span>
                  <span className="text-gray-400">
                    {new Date(item.publishedAt || item.createdAt).toLocaleDateString("hi-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "numeric",
                      minute: "numeric",
                    })}
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-snug mb-2">
                  {item.title}
                </h2>

                {/* Description */}
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 mb-5">
                  {item.description || item.content}
                </p>

                {/* Footer / Read More Button */}
                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                  <span className="text-xs text-gray-500">
                    {item.sourceName || "दैनिक समाचार"}
                  </span>
                  
                  <Link
                    href={`/news/${item.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-red-700"
                  >
                    और पढ़ें →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
