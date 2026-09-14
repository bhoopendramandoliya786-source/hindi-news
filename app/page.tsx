import Link from "next/link";
import { db } from "@/lib/db";
import AdSlot from "@/components/AdSense";
import { AdsterraBanner, AdsterraNative } from "@/components/AdsterraAds";

export const revalidate = 30;

const WHATSAPP_LINK = "https://whatsapp.com/channel/0029Vb8rO9c7DAWvQtwE3o3n";

export const metadata = {
  title: "Student Update | राजस्थान छात्रों के सरकारी काम की आधिकारिक जानकारी",
  description:
    "राजस्थान के छात्रों और नौकरी अभ्यर्थियों के लिए सरकारी भर्ती, परीक्षा, एडमिट कार्ड, आंसर की, रिजल्ट, छात्रवृत्ति, एडमिशन, दस्तावेज और सरकारी योजनाओं की आधिकारिक जानकारी।",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    title: "Student Update | राजस्थान छात्रों के जरूरी सरकारी काम",
    description: "आधिकारिक जानकारी को आसान हिंदी में समझें और सही सरकारी पेज तक सीधे जाएं।",
    url: "/",
  },
};

const cardSelect = {
  id: true,
  title: true,
  description: true,
  publishedAt: true,
  createdAt: true,
  categoryId: true,
  sourceName: true,
  sourceUrl: true,
  category: { select: { id: true, name: true, slug: true } },
};

const sections = [
  ["jobs", "💼", "सरकारी नौकरी", "नई भर्ती, आवेदन और चयन प्रक्रिया"],
  ["exams", "📝", "परीक्षा", "परीक्षा, सिलेबस और जरूरी निर्देश"],
  ["admit-card", "🎫", "एडमिट कार्ड", "परीक्षा प्रवेश पत्र और डाउनलोड प्रक्रिया"],
  ["answer-key", "🔑", "आंसर की", "उत्तर कुंजी और आपत्ति प्रक्रिया"],
  ["results", "🏆", "रिजल्ट", "परिणाम, मेरिट और आगे की प्रक्रिया"],
  ["scholarship", "🎓", "स्कॉलरशिप", "छात्रवृत्ति आवेदन, दस्तावेज और स्थिति"],
  ["admission", "🏫", "एडमिशन", "प्रवेश, काउंसलिंग और जरूरी दस्तावेज"],
  ["documents", "📄", "डॉक्यूमेंट", "सरकारी छात्र काम में लगने वाले दस्तावेज"],
  ["schemes", "🏛️", "सरकारी योजनाएं", "छात्रों और युवाओं के लिए योजनाएं"],
  ["current-affairs", "📰", "करंट अफेयर्स", "परीक्षा उपयोगी सरकारी अपडेट"],
];

function dateText(value: Date | string | null | undefined) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("hi-IN", { day: "numeric", month: "short", year: "numeric" });
}

function ActionCard({ item }: { item: any }) {
  return (
    <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="rounded-full bg-red-50 px-3 py-1 font-black text-red-700">{item.category?.name || "छात्र अपडेट"}</span>
        <time className="text-gray-400">{dateText(item.publishedAt || item.createdAt)}</time>
      </div>
      <h3 className="mt-3 text-lg font-black leading-snug text-gray-950">{item.title}</h3>
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-600">{item.description || "आधिकारिक स्रोत पर उपलब्ध जानकारी को आसान हिंदी में समझें।"}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href={`/news/${item.id}`} prefetch className="rounded-xl bg-gray-950 px-4 py-2 text-xs font-black text-white">काम की जानकारी देखें →</Link>
        {item.sourceUrl && <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-black text-gray-700">Official ↗</a>}
      </div>
    </article>
  );
}

export default async function HomePage() {
  const [latest, categories] = await Promise.all([
    db.news.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: 36,
      select: cardSelect,
    }),
    db.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true, _count: { select: { news: { where: { status: "PUBLISHED" } } } } },
    }),
  ]);

  const bySlug = new Map(latest.map((item) => [item.category?.slug || "", item]));
  const activeCategories = sections.map(([slug]) => categories.find((c) => c.slug === slug)).filter(Boolean) as any[];

  return (
    <main className="min-h-screen bg-gray-50 pb-16">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:py-8">
        <section className="rounded-3xl bg-gradient-to-r from-gray-950 via-red-800 to-orange-600 p-6 text-white shadow-xl sm:p-10">
          <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-black">🎓 Student Update • Official Information</span>
          <h1 className="mt-4 max-w-4xl text-3xl font-black leading-tight sm:text-5xl">छात्रों का काम आसान — खबर नहीं, पूरा सरकारी काम समझें</h1>
          <p className="mt-4 max-w-4xl text-sm leading-7 text-red-50 sm:text-base">सरकारी भर्ती से रिजल्ट तक, स्कॉलरशिप से एडमिशन तक। हम आधिकारिक स्रोत की जानकारी को अपनी आसान हिंदी में समझाते हैं और जहाँ कार्रवाई करनी हो वहाँ सीधे official page तक पहुंचाते हैं।</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/category/jobs" className="rounded-xl bg-white px-5 py-3 text-sm font-black text-red-800">आज की भर्तियां देखें</Link>
            <Link href="/category/scholarship" className="rounded-xl bg-white/15 px-5 py-3 text-sm font-black text-white ring-1 ring-white/30">स्कॉलरशिप देखें</Link>
            <Link href="/search" className="rounded-xl bg-white/15 px-5 py-3 text-sm font-black text-white ring-1 ring-white/30">अपना अपडेट खोजें</Link>
          </div>
        </section>

        <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {sections.map(([slug, icon, title, text]) => {
            const category = categories.find((c) => c.slug === slug);
            return (
              <Link key={slug} href={`/category/${slug}`} prefetch className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm hover:border-red-200 hover:shadow-md">
                <div className="text-2xl">{icon}</div>
                <div className="mt-2 text-sm font-black text-gray-950">{title}</div>
                <div className="mt-1 text-xs leading-5 text-gray-500">{text}</div>
                <div className="mt-3 text-xs font-black text-red-600">{category?._count.news?.toLocaleString("hi-IN") || 0} अपडेट →</div>
              </Link>
            );
          })}
        </section>

        <AdSlot className="my-6" />

        <section className="mb-10 rounded-2xl border border-emerald-100 bg-emerald-50 p-5 sm:p-6">
          <h2 className="text-xl font-black text-gray-950">✅ हमारी जानकारी का नियम</h2>
          <div className="mt-3 grid gap-3 text-sm leading-6 text-gray-700 sm:grid-cols-3">
            <div><b>1. Official source</b><br />तारीख, पात्रता, फीस, रिजल्ट जैसी जानकारी बिना सत्यापन के नहीं जोड़ी जाएगी।</div>
            <div><b>2. Original Hindi</b><br />दूसरी वेबसाइट का लेख कॉपी नहीं होगा; सरकारी जानकारी को आसान भाषा में समझाया जाएगा।</div>
            <div><b>3. Action first</b><br />जहाँ आवेदन, डाउनलोड, objection या result देखना हो वहाँ official action link प्राथमिक रहेगा।</div>
          </div>
        </section>

        <section className="mb-10">
          <div className="mb-5 flex items-end justify-between border-b-2 border-red-600 pb-2">
            <div><h2 className="text-2xl font-black text-gray-950">आज के जरूरी छात्र अपडेट</h2><p className="mt-1 text-xs text-gray-500">नए अपडेट को पहले काम के हिसाब से देखें</p></div>
            <Link href="/search" className="text-xs font-black text-red-600">सभी खोजें →</Link>
          </div>
          {latest.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{latest.slice(0, 12).map((item) => <ActionCard key={item.id} item={item} />)}</div> : <div className="rounded-2xl border border-dashed bg-white p-10 text-center text-gray-500">अभी कोई आधिकारिक अपडेट उपलब्ध नहीं है।</div>}
        </section>

        <AdsterraNative />

        <section className="mb-10">
          <div className="mb-5 flex items-end justify-between border-b-2 border-red-600 pb-2"><div><h2 className="text-2xl font-black text-gray-950">किस काम के लिए आए हैं?</h2><p className="mt-1 text-xs text-gray-500">अपना सरकारी काम चुनें और उसी से जुड़े अपडेट देखें</p></div></div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {sections.slice(0, 9).map(([slug, icon, title, text]) => {
              const item = bySlug.get(slug);
              return <Link key={slug} href={`/category/${slug}`} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:border-red-200 hover:shadow-md"><div className="text-3xl">{icon}</div><h3 className="mt-3 text-xl font-black text-gray-950">{title}</h3><p className="mt-2 text-sm leading-6 text-gray-600">{text}</p>{item && <p className="mt-4 line-clamp-2 text-xs font-bold text-red-700">नया: {item.title}</p>}<span className="mt-4 inline-block text-xs font-black text-red-600">इस काम के सभी अपडेट →</span></Link>;
            })}
          </div>
        </section>

        <section className="mb-10 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 sm:p-8">
          <h2 className="text-2xl font-black text-gray-950">📌 सरकारी भर्ती का पूरा सफर</h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">राजस्थान Recruitment Portal खुद भर्ती प्रक्रिया को registration → advertisement → application → admit card → examination → answer key → document verification → result → allocation → recommendation → medical → police verification → appointment/posting जैसे चरणों में बताता है।</p>
          <div className="mt-5 flex flex-wrap gap-2">{["Registration", "Advertisement", "Application", "Admit Card", "Exam", "Answer Key", "Document Verification", "Result", "Allocation", "Appointment"].map((step, i) => <span key={step} className="rounded-full bg-gray-100 px-3 py-2 text-xs font-black text-gray-700">{i + 1}. {step}</span>)}</div>
          <a href="https://www.recruitment.rajasthan.gov.in/" target="_blank" rel="noopener noreferrer" className="mt-5 inline-block rounded-xl bg-red-700 px-5 py-3 text-sm font-black text-white">Rajasthan Recruitment Portal खोलें ↗</a>
        </section>

        <AdsterraBanner />
        <AdSlot className="my-6" />

        <section className="rounded-3xl bg-gray-950 p-6 text-white sm:p-8">
          <h2 className="text-2xl font-black">📲 जरूरी छात्र अपडेट सीधे पाएं</h2>
          <p className="mt-2 text-sm leading-6 text-gray-300">भर्ती, परीक्षा, रिजल्ट, स्कॉलरशिप और सरकारी छात्र काम के नए अपडेट मिस न करें।</p>
          <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="mt-5 inline-block rounded-xl bg-green-500 px-5 py-3 text-sm font-black">WhatsApp चैनल जॉइन करें →</a>
        </section>
      </div>
    </main>
  );
}
