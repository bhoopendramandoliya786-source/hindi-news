import Link from "next/link";
import db from "@/lib/db";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;

  // डेटाबेस से कैटेगरी और खबरें निकालें
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
        <h1 className="text-3xl font-extrabold text-red-600 mb-2">
          कैटेगरी नहीं मिली
        </h1>
        <p className="text-gray-600 mb-6">
          यह कैटेगरी अभी उपलब्ध नहीं है या इसमें कोई खबर नहीं है।
        </p>
        <Link
          href="/"
          className="inline-block rounded-md bg-red-600 px-5 py-2.5 text-white font-medium hover:bg-red-700 transition"
        >
          होमपेज पर जाएं
        </Link>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="border-b-4 border-red-600 pb-2 mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">
          {category.name}
        </h1>
      </div>

      {category.news.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 py-16 text-center text-gray-500">
          इस कैटेगरी में फिलहाल कोई ताज़ा खबर उपलब्ध नहीं है।
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {category.news.map((item: any) => (
            <article
              key={item.id}
              className="flex flex-col overflow-hidden rounded-lg border bg-white shadow-sm transition hover:shadow-md"
            >
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="h-48 w-full object-cover"
                />
              )}
              <div className="flex flex-1 flex-col p-4">
                <span className="mb-1 text-xs font-bold uppercase tracking-wider text-red-600">
                  {category.name}
                </span>
                <h2 className="line-clamp-2 text-lg font-bold text-gray-900 mb-2">
                  {item.title}
                </h2>
                <p className="line-clamp-3 text-sm text-gray-600 flex-1">
                  {item.description || item.content}
                </p>
                <div className="mt-4 pt-3 border-t text-xs text-gray-400">
                  {new Date(item.publishedAt || item.createdAt).toLocaleDateString("hi-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
              }
