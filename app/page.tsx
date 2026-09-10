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
    <main>
      <section className="bg-gradient-to-br from-red-50 via-white to-orange-50">
        <div className="container py-10 md:py-16">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex rounded-full bg-red-100 px-4 py-2 text-sm font-bold text-red-700">
              🔴 ताज़ा खबरें
            </div>

            <h1 className="text-4xl font-black leading-tight text-gray-950 md:text-6xl">
              देश और दुनिया की
              <span className="text-red-600"> ताज़ा खबरें</span>
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-gray-600">
              भारत, राजस्थान, दुनिया, बिज़नेस, टेक्नोलॉजी, खेल और मनोरंजन की
              खबरें एक ही जगह।
            </p>
          </div>
        </div>
      </section>

      <section className="container py-8">
        <div className="mb-8 rounded-xl bg-gray-200 p-6 text-center text-sm text-gray-500">
          Advertisement Space
        </div>

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-gray-950">
            📰 ताज़ा खबरें
          </h2>

          <span className="text-sm font-semibold text-red-600">
            Latest News
          </span>
        </div>

        {news.length === 0 ? (
          <div className="rounded-xl bg-gray-100 p-10 text-center text-gray-600">
            अभी कोई खबर उपलब्ध नहीं है।
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {news.map((item) => (
              <article
                key={item.id}
                className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200 transition hover:-translate-y-1 hover:shadow-lg"
              >
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="h-48 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-48 items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 text-gray-500">
                    News Image
                  </div>
                )}

                <div className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-bold text-red-600">
                      {item.category.name}
                    </span>

                    {item.publishedAt && (
                      <span className="text-xs text-gray-500">
                        {formatDate(item.publishedAt)}
                      </span>
                    )}
                  </div>

                  <h3 className="mt-2 text-xl font-bold leading-7 text-gray-950">
                    {item.title}
                  </h3>

                  {item.description && (
                    <p className="mt-3 line-clamp-3 leading-6 text-gray-600">
                      {item.description}
                    </p>
                  )}

                  <div className="mt-5 flex items-center justify-between gap-3">
                    <span className="text-xs font-medium text-gray-500">
                      {item.sourceName || "News Source"}
                    </span>

                    {item.sourceUrl && (
  <a
    href={item.sourceUrl}
    target="_blank"
    rel="noopener noreferrer"
    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
  >
    और पढ़ें →
  </a>
)}
                    
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
