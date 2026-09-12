import Link from "next/link";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

// टेक्स्ट के अंदर मौजूद लिंक को नीले क्लिकेबल लिंक में बदलने वाला हेल्पर
function parseInlineLinks(text: string) {
  const urlRegex = /(https?:\/\/[^\s]+|[a-zA-Z0-9.-]+\.(?:gov\.in|nic\.in|com|in|org|edu)[^\s]*)/gi;
  const parts = text.split(urlRegex);

  return parts.map((part, i) => {
    if (!part) return null;
    if (part.match(urlRegex)) {
      const href = part.startsWith("http") ? part : `https://${part}`;
      return (
        <a
          key={i}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-bold text-blue-600 hover:text-blue-800 hover:underline break-all bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-sm ml-1"
        >
          {part} ↗
        </a>
      );
    }
    return part;
  });
}

// Markdown हेडिंग, बुलेट, टेबल और लिंक इंजन
function renderFormattedContent(text: string) {
  if (!text) return null;

  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="my-4 space-y-2 list-disc pl-6 text-gray-800">
          {listItems.map((item, idx) => (
            <li key={idx} className="leading-relaxed">{item}</li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim();

    if (!line) {
      flushList();
      return;
    }

    // 1. हेडिंग (###)
    if (line.startsWith("###")) {
      flushList();
      const headingText = line.replace(/^###\s*/, "");
      elements.push(
        <h3
          key={`h3-${index}`}
          className="mt-8 mb-4 border-l-4 border-red-600 bg-red-50/40 pl-3 py-2 text-lg sm:text-xl font-black text-gray-900 rounded-r-lg"
        >
          {headingText}
        </h3>
      );
      return;
    }

    // 2. डिवाइडर (---)
    if (line === "---") {
      flushList();
      elements.push(<hr key={`hr-${index}`} className="my-6 border-gray-200" />);
      return;
    }

    // 3. बुलेट पॉइंट्स (* या • या -)
    if (line.startsWith("*") || line.startsWith("•") || (line.startsWith("-") && !line.startsWith("---"))) {
      const cleanItem = line.replace(/^[*•-]\s*/, "");
      listItems.push(parseInlineLinks(cleanItem));
      return;
    }

    // 4. नंबर लिस्ट (1. 2. 3.)
    if (/^\d+\.\s/.test(line)) {
      flushList();
      elements.push(
        <div key={`num-${index}`} className="my-2 flex gap-3 text-gray-800 leading-relaxed font-medium">
          <span className="shrink-0 font-bold text-red-600">{line.match(/^\d+\./)?.[0]}</span>
          <span>{parseInlineLinks(line.replace(/^\d+\.\s*/, ""))}</span>
        </div>
      );
      return;
    }

    // 5. साधारण पैराग्राफ
    flushList();
    elements.push(
      <p key={`p-${index}`} className="my-3 text-base sm:text-lg leading-loose text-gray-800">
        {parseInlineLinks(line)}
      </p>
    );
  });

  flushList();
  return elements;
}

export default async function NewsDetailPage({ params }: Props) {
  const { id } = await params;

  const newsItem = await (db as any).news.findUnique({
    where: { id: id },
    include: { category: true },
  });

  if (!newsItem) {
    notFound();
  }

  const relatedNews = await (db as any).news.findMany({
    where: {
      id: { not: id },
      status: "PUBLISHED",
    },
    orderBy: { publishedAt: "desc" },
    take: 6,
  });

  const WHATSAPP_LINK = "https://whatsapp.com/channel/0029Vb8rO9c7DAWvQtwE3o3n";

  return (
    <main className="min-h-screen bg-gray-50/50 py-6 md:py-10 relative">
      
      {/* 🟢 Floating WhatsApp Button */}
      <div className="fixed bottom-6 right-4 z-50">
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
        
        {/* Breadcrumb */}
        <div className="mb-4 flex items-center gap-2 text-xs font-semibold text-gray-500">
          <Link href="/" className="hover:text-red-600">होम</Link>
          <span>/</span>
          <Link href={`/category/${newsItem.category?.slug || ""}`} className="text-red-600 hover:underline uppercase">
            {newsItem.category?.name || "समाचार"}
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          
          {/* Main Content */}
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

            <h1 className="text-2xl font-black leading-snug text-gray-950 sm:text-3xl md:text-4xl mb-6">
              {newsItem.title}
            </h1>

            {newsItem.imageUrl && (
              <div className="relative mb-6 overflow-hidden rounded-xl bg-gray-100">
                <img
                  src={newsItem.imageUrl}
                  alt={newsItem.title}
                  className="w-full max-h-[440px] object-cover"
                />
              </div>
            )}

            {/* In-Article WhatsApp Box */}
            <div className="my-6 rounded-xl border border-dashed border-green-300 bg-green-50/80 p-4 text-center">
              <p className="text-sm font-bold text-gray-900 mb-2">
                📢 सरकारी नौकरी, रिजल्ट और ताज़ा खबरों के तुरंत अपडेट पाने के लिए हमारे चैनल से जुड़ें:
              </p>
              <div className="flex justify-center">
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2 text-xs font-bold text-white shadow hover:bg-green-700 transition"
                >
                  <span>💬</span> व्हाट्सएप चैनल से जुड़ें 👉
                </a>
              </div>
            </div>

            {/* Highlighted Lead */}
            {newsItem.description && (
              <div className="my-6 rounded-r-xl border-l-4 border-red-600 bg-red-50/50 p-4 text-base font-semibold leading-relaxed text-gray-800">
                {newsItem.description}
              </div>
            )}

            {/* Formatted Content */}
            <div className="article-body">
              {renderFormattedContent(newsItem.content || newsItem.description)}
            </div>

            {/* Footer */}
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

          {/* Sidebar */}
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
