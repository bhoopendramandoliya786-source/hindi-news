                  import Link from "next/link";
import { getLatestNews } from "@/lib/news-service";

export const dynamic = "force-dynamic";

function formatDate(date: Date | null) {
  if (!date) return "";

  return new Intl.DateTimeFormat("hi-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata"
  }).format(date);
}

export default async function HomePage() {
  const news = await getLatestNews(20);

  return (
    <main className="min-h-screen bg-gray-50/50">
      {/* Hero Banner */}
      <section className="border-b bg-gradient-to-br from-red-50 via-white to-orange-50">
        <div className="container mx-auto max-w-6xl px-4 py-8 md:py-12">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-red-100 px-3.5 py-1.5 text-xs font-bold text-red-700 shadow-sm">
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-600"></span>
              ताज़ा खबरें
            </div>

            <h1 className="text-3xl font-black leading-tight text-gray-950 md:text-5xl">
              देश और दुनिया की <span className="text-red-600">ताज़ा खबरें</span>
            </h1>

            <p className="mt-3 text-base leading-relaxed text-gray-600 md:text-lg">
              भारत, राजस्थान, दुनिया, बिज़नेस, टेक्नोलॉजी, खेल और मनोरंजन की खबरें एक ही जगह।
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="container mx-auto max-w-6xl px-4 py-8">
        {/* Ads Banner Placeholder */}
        <div className="mb-8 flex h-24 w-full items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-100 text-sm font-medium text-gray-400">
          Advertisement Space
        </div>

        {/* Section Header */}
        <div className="mb-6 flex items-center justify-between border-b-2 border-red-600 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">📰</span>
            <h2 className="text-2xl font-extrabold text-gray-950">ताज़ा खबरें</h2>
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-red-600">
            Latest News
          </span>
        </div>

        {news.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-gray-500 shadow-sm">
            अभी कोई खबर उपलब्ध नहीं है।
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {news.map((item) => (
              <article
                key={item.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                {/* Image */}
                <Link href={`/news/${item.id}`} className="relative block h-48 w-full overflow-hidden bg-gray-100">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-red-600 to-red-400 font-bold text-white">
                      📰 Hindi News
                    </div>
                  )}
                </Link>

                {/* Card Content */}
                <div className="flex flex-1 flex-col p-5">
                  {/* Category & Date */}
                  <div className="mb-2.5 flex items-center justify-between text-xs">
                    <Link
                      href={`/category/${item.category?.slug || ""}`}
                      className="font-bold uppercase text-red-600 hover:underline"
                    >
                      {item.category?.name || "समाचार"}
                    </Link>

                    {item.publishedAt && (
                      <span className="text-gray-400">
                        {formatDate(item.publishedAt)}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <Link href={`/news/${item.id}`}>
                    <h3 className="line-clamp-2 text-lg font-bold leading-snug text-gray-900 transition group-hover:text-red-600">
                      {item.title}
                    </h3>
                  </Link>

                  {/* Description */}
                  {item.description && (
                    <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-gray-600">
                      {item.description}
                    </p>
                  )}

                  {/* Card Bottom / Footer */}
                  <div className="mt-auto flex items-center justify-between gap-2 border-t border-gray-100 pt-4">
                    <span className="truncate text-xs font-medium text-gray-500">
                      {item.sourceName || "दैनिक समाचार"}
                    </span>

                    {/* Keep User On Your Platform */}
                    <Link
                      href={`/news/${item.id}`}
                      className="shrink-0 rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-red-700"
                    >
                      और पढ़ें →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
                  }
