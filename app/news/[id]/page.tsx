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

  // अपने WhatsApp और Telegram ग्रुप के लिंक यहाँ डालें
  const WHATSAPP_LINK = "https://whatsapp.com/channel/your-channel-id";
  const TELEGRAM_LINK = "https://t.me/your-telegram-channel";

  return (
    <main className="min-h-screen bg-gray-50/50 py-6 md:py-10 relative">
      
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
          
          {/* Main Article Area (बाईं तरफ मुख्य खबर) */}
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
            {newsItem.imageUrl && (
              <div className="relative mb-6 overflow-hidden rounded-xl bg-gray-100">
                <img
                  src={newsItem.imageUrl}
                  alt={newsItem.title}
                  className="w-full max-h-[440px] object-cover"
                />
              </div>
            )}

            {/* In-Article Community Join Box (WhatsApp/Telegram जॉइन बॉक्स) */}
            <div className="my-6 rounded-xl border border-dashed border-green-300 bg-green-50/70 p-4 text-center">
              <p className="text-sm font-bold text-gray-900 mb-2">
                📢 ताज़ा खबरों और सरकारी नौकरी के अपडेट सबसे पहले पाने के लिए:
              </p>
              <div className="flex justify-center gap-3">
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  className="rounded-lg bg-green-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-green-700"
                >
                  व्हाट्सएप चैनल से जुड़ें 👉
                </a>
                <a
                  href={TELEGRAM_LINK}
                  target="_blank"
                  className="rounded-lg bg-sky-500 px-4 py-2 text-xs font-bold text-white shadow hover:bg-sky-600"
                >
                  टेलीग्राम ग्रुप
                </a>
              </div>
            </div>

            {/* Short Highlighted Description */}
            {newsItem.description && (
              <div className="my-6 rounded-r-xl border-l-4 border-red-600 bg-red-50/50 p-4 text-base font-semibold leading-relaxed text-gray-800">
                {newsItem.description}
              </div>
            )}

            {/* News Body Text */}
            <div className="text-base sm:text-lg leading-loose text-gray-800 space-y-4">
              <p>{newsItem.content || newsItem.description}</p>
            </div>

            {/* Footer Navigation (NDTV/अमर उजाला का बाहरी लिंक हटा दिया गया) */}
            <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-6">
              <span className="text-xs text-gray-400 font-medium">
                विशेष रिपोर्ट • Hindi News
              </span>

              <Link
                href="/"
                className="rounded-lg bg-gray-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-gray-800"
              >
                ← वापस होम पर जाएं
              </Link>
            </div>
          </article>

          {/* Sidebar (दाईं तरफ अन्य ताज़ा खबरें) */}
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
