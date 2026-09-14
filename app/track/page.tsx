import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { AdsterraNative } from "@/components/AdsterraAds";

export const metadata: Metadata = {
  title: "भर्ती / परीक्षा Tracker | Student Update",
  description: "किसी भर्ती, परीक्षा, रिजल्ट, Admit Card, Answer Key या Scholarship को एक ही जगह समझें और अगला काम जानें।",
  robots: { index: false, follow: true },
};

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ q?: string }> };

type Stage = {
  slug: string;
  label: string;
  icon: string;
  action: string;
  hint: string;
};

const STAGES: Stage[] = [
  { slug: "jobs", label: "Notification / भर्ती", icon: "01", action: "आवेदन की स्थिति देखें", hint: "नोटिफिकेशन, पात्रता, फीस और आवेदन की जानकारी" },
  { slug: "exams", label: "परीक्षा", icon: "02", action: "परीक्षा की जानकारी देखें", hint: "Exam date, pattern, syllabus और जरूरी तैयारी" },
  { slug: "admit-card", label: "Admit Card", icon: "03", action: "Admit Card देखें", hint: "Hall ticket, exam city और परीक्षा से पहले की जांच" },
  { slug: "answer-key", label: "Answer Key", icon: "04", action: "Answer Key देखें", hint: "उत्तर मिलाएं, response sheet और objection" },
  { slug: "results", label: "Result", icon: "05", action: "Result देखें", hint: "Result, score, merit list, cut-off और अगला चरण" },
  { slug: "admission", label: "Counselling / Admission", icon: "06", action: "Admission चरण देखें", hint: "Merit, counselling, seat allotment और admission" },
];

const clean = (value: string) => value.trim().replace(/\s+/g, " ").slice(0, 100);

export default async function TrackPage({ searchParams }: Props) {
  const raw = (await searchParams).q || "";
  const query = clean(raw);

  if (!query) {
    return (
      <main className="min-h-screen bg-gray-50 py-10">
        <div className="mx-auto max-w-4xl px-4">
          <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
            <div className="text-xs font-black uppercase tracking-wider text-red-600">Master Tracker</div>
            <h1 className="mt-2 text-3xl font-black text-gray-950">किस भर्ती या परीक्षा को एक जगह ट्रैक करना है?</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-600">जैसे <b>SSC CGL</b>, <b>REET</b>, <b>RPSC School Lecturer</b>, <b>RRB NTPC</b>, <b>RBSE 10th Result</b> या किसी Scholarship का नाम लिखें।</p>
            <form className="mt-6 flex flex-col gap-2 sm:flex-row">
              <input name="q" className="min-w-0 flex-1 rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-red-500" placeholder="जैसे: SSC CGL 2026" />
              <button className="rounded-xl bg-red-600 px-6 py-3 font-black text-white">Tracker खोलें →</button>
            </form>
          </section>
        </div>
      </main>
    );
  }

  const words = query.split(" ").filter((word) => word.length > 2).slice(0, 8);
  const searchOr = [
    { title: { contains: query, mode: "insensitive" as const } },
    { description: { contains: query, mode: "insensitive" as const } },
    { content: { contains: query, mode: "insensitive" as const } },
    ...words.slice(0, 4).map((word) => ({ title: { contains: word, mode: "insensitive" as const } })),
  ];

  const updates = await db.news.findMany({
    where: { status: "PUBLISHED", OR: searchOr },
    orderBy: { publishedAt: "desc" },
    take: 80,
    select: { id: true, slug: true, title: true, description: true, sourceName: true, sourceUrl: true, publishedAt: true, category: { select: { name: true, slug: true } } },
  });

  const unique = Array.from(new Map(updates.map((item) => [item.id, item])).values());
  const stageData = STAGES.map((stage) => ({ ...stage, items: unique.filter((item) => item.category.slug === stage.slug).slice(0, 5) }));
  const activeStages = stageData.filter((stage) => stage.items.length > 0);
  const latest = unique.slice(0, 12);

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-6xl px-4">
        <nav className="text-xs font-bold text-gray-500"><Link href="/" className="hover:text-red-600">होम</Link> <span className="mx-1">/</span> <Link href="/search" className="hover:text-red-600">Search</Link> <span className="mx-1">/</span> Tracker</nav>

        <section className="mt-4 rounded-3xl bg-white p-6 shadow-sm sm:p-8">
          <div className="text-xs font-black uppercase tracking-wider text-red-600">{activeStages.length ? `${activeStages.length} चरणों में जानकारी मिली` : "Master Tracker"}</div>
          <h1 className="mt-2 text-3xl font-black leading-tight text-gray-950 sm:text-4xl">{query}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-600">यहां इस नाम से मिली भर्ती/परीक्षा/रिजल्ट/Admit Card/Answer Key जैसी सभी उपलब्ध updates को एक workflow में रखा गया है। जो चरण अभी नहीं मिला है, उसे अनुमान से “live” नहीं बताया गया है।</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-gray-50 p-4"><div className="text-xs font-bold text-gray-500">मिली updates</div><div className="mt-1 text-2xl font-black text-gray-950">{unique.length}</div></div>
            <div className="rounded-2xl bg-gray-50 p-4"><div className="text-xs font-bold text-gray-500">मिले हुए चरण</div><div className="mt-1 text-2xl font-black text-gray-950">{activeStages.length}</div></div>
            <div className="rounded-2xl bg-red-50 p-4"><div className="text-xs font-bold text-red-700">आपका अगला काम</div><div className="mt-1 text-sm font-black text-red-800">नीचे सबसे नया उपलब्ध चरण खोलें</div></div>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-red-100 bg-red-50 p-5 sm:p-6">
          <div className="text-xs font-black uppercase tracking-wider text-red-600">अभी क्या करें?</div>
          <h2 className="mt-1 text-xl font-black text-gray-950">पहले सबसे ऊपर वाला उपलब्ध चरण देखें</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {(activeStages.length ? activeStages : stageData).slice().reverse().slice(0, 3).map((stage) => (
              <Link key={stage.slug} href={stage.items[0] ? `/news/${stage.items[0].slug}` : `/category/${stage.slug}`} className="rounded-xl bg-red-600 px-4 py-3 text-sm font-black text-white hover:bg-red-700">{stage.action} →</Link>
            ))}
          </div>
        </section>

        <section className="mt-7">
          <h2 className="text-2xl font-black text-gray-950">पूरा भर्ती / परीक्षा workflow</h2>
          <p className="mt-1 text-sm text-gray-500">हर चरण में वही official update दिखाया गया है जो इस search से मिला है।</p>
          <div className="mt-5 space-y-4">
            {stageData.map((stage) => (
              <section key={stage.slug} className={`rounded-3xl border bg-white p-5 shadow-sm ${stage.items.length ? "border-gray-100" : "border-dashed border-gray-200"}`}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-black ${stage.items.length ? "bg-red-600 text-white" : "bg-gray-100 text-gray-400"}`}>{stage.icon}</div>
                    <div><h3 className="font-black text-gray-950">{stage.label}</h3><p className="mt-1 text-xs leading-5 text-gray-500">{stage.hint}</p></div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-black ${stage.items.length ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-400"}`}>{stage.items.length ? "जानकारी मिली" : "अभी नहीं मिली"}</span>
                </div>
                {stage.items.length > 0 && <div className="mt-4 grid gap-3 lg:grid-cols-2">{stage.items.map((item) => <article key={item.id} className="rounded-2xl border border-gray-100 p-4"><div className="text-[11px] font-black text-red-600">{item.category.name} · {item.sourceName || "Official source"}</div><Link href={`/news/${item.slug}`} className="mt-1 block font-black leading-snug text-gray-950 hover:text-red-600">{item.title}</Link>{item.description && <p className="mt-2 line-clamp-2 text-xs leading-5 text-gray-500">{item.description}</p>}<Link href={`/news/${item.slug}`} className="mt-3 inline-flex rounded-lg bg-gray-950 px-3 py-2 text-xs font-bold text-white">यह update समझें →</Link></article>)}</div>}
                {!stage.items.length && <div className="mt-4 rounded-2xl bg-gray-50 p-4 text-xs leading-6 text-gray-500">इस search के आधार पर इस चरण की कोई verified published update नहीं मिली। अनुमान लगाने के बजाय संबंधित category देखें। <Link href={`/category/${stage.slug}`} className="font-black text-red-600">{stage.label} खोलें →</Link></div>}
              </section>
            ))}
          </div>
        </section>

        <AdsterraNative />

        {latest.length > 0 && <section className="mt-7 rounded-3xl bg-white p-5 shadow-sm sm:p-6"><h2 className="text-xl font-black text-gray-950">इस नाम से मिली बाकी latest updates</h2><div className="mt-4 space-y-3">{latest.map((item) => <Link key={`latest-${item.id}`} href={`/news/${item.slug}`} className="block rounded-xl border border-gray-100 p-3 hover:border-red-200"><div className="text-xs font-black text-red-600">{item.category.name}</div><div className="mt-1 text-sm font-black text-gray-900">{item.title}</div></Link>)}</div></section>}

        <section className="mt-7 rounded-3xl bg-gray-950 p-6 text-white sm:p-8">
          <div className="text-xs font-black uppercase tracking-wider text-red-300">Final official action</div>
          <h2 className="mt-2 text-2xl font-black">काम पूरा करने के लिए official source ही इस्तेमाल करें</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-300">यह portal आपको समझाता और सही चरण तक पहुंचाता है। आवेदन, admit card, objection, result या status का अंतिम काम संबंधित सरकारी website पर ही करें और वहां details दोबारा verify करें।</p>
          <Link href={`/search?q=${encodeURIComponent(query)}`} className="mt-5 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-black text-gray-950">सभी matching updates देखें →</Link>
        </section>
      </div>
    </main>
  );
}
