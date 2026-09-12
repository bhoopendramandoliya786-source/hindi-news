import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const newsList = await (db as any).news.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 12,
    include: { category: true },
  });

  // अपने WhatsApp और Telegram ग्रुप के लिंक यहाँ सेट करें
  const WHATSAPP_LINK = "https://whatsapp.com/channel/your-channel-id";
  const TELEGRAM_LINK = "https://t.me/your-telegram-channel";

  return (
    <main className="min-h-screen bg-gray-50/50 pb-16 relative">
      
      {/* 🟢 स्क्रीन पर हमेशा तैरता (Floating) WhatsApp बटन */}
      <div className="fixed bottom-6 right-4 z-50 flex flex-col gap-2">
        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-full bg-green-500 px-4 py-2.5 text-xs font-bold text-white shadow-xl transition hover:bg-green-600 hover:scale-105"
        >
          <span className="text-sm">💬</span> WhatsApp से जुड़ें
        </a>
      </div>

      <div className="container mx-auto max-w-6xl px-4 pt-6">
        
        {/* Top Banner Header */}
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 p-6 text-white shadow-sm sm:p-8">
          <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
            🔴 ताज़ा खबरें व वेकेंसी
          </span>
          <h1 className="mt-3 text-2xl font-black sm:text-4xl">
            देश और दुनिया की ताज़ा खबरें
          </h1>
          <p className="mt-2 text-sm text-red-100 sm:text-base">
            भारत, राजस्थान, सरकारी भर्ती, बिज़नेस, खेल और मनोरंजन की खबरें एक ही जगह।
          </p>

          {/* Header Social Bar */}
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-green-500 px-3.5 py-1.5 text-xs font-bold text-white shadow transition hover:bg-green-600"
            >
              <span>💬</span> WhatsApp चैनल जॉइन करें
            </a>
            <a
              href={TELEGRAM_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-sky-500 px-3.5 py-1.5 text-xs font-bold text-white shadow transition hover:bg-sky-600"
            >
              <span>✈️</span> Telegram ग्रुप
            </a>
          </div>
        </div>

        {/* Advertisement Space */}
        <div className="my-6 flex h-24 w-full items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white text-xs font-semibold text-gray-400">
          Advertisement Space (Google AdSense)
        </div>

        {/* Section Heading */}
        <div className="mb-6 flex items-center justify-between border-b-2 border-red-600 pb-2">
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <span>📰</span> ताज़ा खबरें
          </h2>
          <span className="text-xs font-bold uppercase tracking-wider text-red-600">
            LATEST UPDATES
          </span>
        </div>

        {/* News Grid */}
        {newsList.length === 0 ? (
          <div className="rounded-xl bg-white p-12 text-center text-gray-500">
            अभी कोई खबर उपलब्ध नहीं है।
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {newsList.map((item: any) => (
              <article
                key={item.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md"
              >
                {/* News Thumbnail */}
                <Link href={`/news/${item.id}`} className="relative block h-48 w-full overflow-hidden bg-gray-100">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="h-full w-full object-cover transition duration-300 hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-red-500 to-orange-500 text-lg font-bold text-white">
                      Hindi News
                    </div>
                  )}
                </Link>

                {/* Card Content */}
                <div className="flex flex-1 flex-col p-4">
                  <div className="mb-2 flex items-center justify-between text-xs text-gray-400">
                    <span className="font-bold text-red-600 uppercase">
                      {item.category?.name || "समाचार"}
                    </span>
                    <span>
                      {new Date(item.publishedAt || item.createdAt).toLocaleDateString("hi-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>

                  <Link href={`/news/${item.id}`} className="group mb-2 block flex-1">
                    <h3 className="line-clamp-2 text-base font-bold leading-snug text-gray-900 group-hover:text-red-600 transition">
                      {item.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-gray-500">
                      {item.description || item.title}
                    </p>
                  </Link>

                  {/* Card Footer (NDTV हटाकर आपका ब्रांड नाम) */}
                  <div className="mt-3 flex items-center justify-between border-t border-gray-50 pt-3">
                    <span className="text-[11px] font-medium text-gray-400">
                      Hindi News
                    </span>
                    <Link
                      href={`/news/${item.id}`}
                      className="rounded-md bg-red-600 px-3 py-1 text-xs font-bold text-white transition hover:bg-red-700"
                    >
                      और पढ़ें →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
