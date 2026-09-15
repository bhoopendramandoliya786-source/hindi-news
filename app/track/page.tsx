import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { buildEntityKey } from "@/lib/entity-key";
import { getStudentEntityName } from "@/lib/student-entity";
import { AdsterraNative } from "@/components/AdsterraAds";

export const metadata: Metadata = {
  title: "Student Master Tracker | भर्ती, परीक्षा, रिजल्ट और छात्र काम",
  description: "किस भर्ती, परीक्षा, रिजल्ट, Admit Card, Answer Key, Scholarship या Admission का काम है—पहले सही entity चुनें, फिर पूरा workflow समझें।",
  robots: { index: false, follow: true },
};
export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ q?: string; entity?: string }> };

const STAGES = [
  ["jobs", "01", "भर्ती / Notification", "यह भर्ती किस पद और संस्था की है?"],
  ["exams", "02", "परीक्षा", "Exam date, syllabus और instructions"],
  ["admit-card", "03", "Admit Card", "प्रवेश पत्र और exam centre"],
  ["answer-key", "04", "Answer Key / Objection", "उत्तर मिलाएं और objection देखें"],
  ["results", "05", "Result / Merit", "परिणाम, merit, cutoff या shortlist"],
  ["admission", "06", "Counselling / Admission", "Merit, allotment और admission"],
  ["scholarship", "07", "Scholarship", "Scheme, session, OTR और status"],
  ["schemes", "08", "योजना / सेवा", "Eligibility, benefit और application"],
  ["education", "09", "Education / Board", "Board, university, course और session"],
] as const;

const ACTIONS: Record<string, string> = {
  jobs: "यदि आवेदन खुला है तो eligibility और documents मिलाकर आवेदन की तैयारी करें।",
  exams: "सही exam की date, syllabus और instructions देखकर तैयारी/अगले चरण पर जाएं।",
  "admit-card": "Admit card उपलब्ध हो तो डाउनलोड करके नाम, roll number, centre और reporting time जांचें।",
  "answer-key": "अपने उत्तर मिलाएं और official objection window खुली हो तो नियम देखकर आपत्ति करें।",
  results: "Result/merit देखें और document verification, counselling या appointment का अगला notice जांचें।",
  admission: "अपना course/college/session मिलाएं और counselling या admission की अगली official प्रक्रिया देखें।",
  scholarship: "Scheme + session + eligibility मिलाएं; OTR, documents, application और status देखें।",
  schemes: "पहले eligibility और लाभ समझें; लागू होने पर official application/service प्रक्रिया करें।",
  education: "Board/university/course/session सही है या नहीं मिलाएं और उसी official notice का अगला कदम देखें।",
};

const clean = (v: string) => v.trim().replace(/\s+/g, " ").slice(0, 100);
const dateValue = (value: Date | string | null | undefined) => value ? new Date(value).getTime() : 0;

export default async function TrackPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = clean(params.q || "");
  const requestedEntity = clean(params.entity || "");

  if (!query && !requestedEntity) {
    return <main className="min-h-screen bg-gray-50 py-10"><div className="mx-auto max-w-5xl px-4"><section className="rounded-3xl bg-white p-6 shadow-sm sm:p-9"><div className="text-xs font-black uppercase tracking-wider text-red-600">Master Tracker</div><h1 className="mt-2 text-3xl font-black">पहले सही भर्ती / परीक्षा / योजना चुनें</h1><p className="mt-3 max-w-3xl text-sm leading-7 text-gray-600">सिर्फ “SSC” या “Result” लिखने पर अलग-अलग चीजें आपस में नहीं मिलेंगी। पहले अपना exact काम चुनें—जैसे SSC CPO SI 2026, SSC CHSL 2026, REET 2026 या Rajasthan Scholarship 2026-27।</p><form className="mt-6 flex flex-col gap-2 sm:flex-row"><input name="q" className="min-w-0 flex-1 rounded-xl border border-gray-300 px-4 py-3" placeholder="जैसे: SSC CGL 2026 / REET / Rajasthan Scholarship" /><button className="rounded-xl bg-red-600 px-6 py-3 font-black text-white">सही काम खोजें →</button></form></section></div></main>;
  }

  let updates: any[] = [];
  try {
    updates = await db.news.findMany({
      where: { status: "PUBLISHED", ...(requestedEntity ? { entityKey: requestedEntity } : { OR: [{ title: { contains: query, mode: "insensitive" } }, { description: { contains: query, mode: "insensitive" } }, { content: { contains: query, mode: "insensitive" } }] }) },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: 300,
      select: { id: true, slug: true, title: true, description: true, sourceName: true, sourceUrl: true, publishedAt: true, createdAt: true, entityKey: true, category: { select: { name: true, slug: true } } },
    });
  } catch (error) {
    console.error("Master tracker database read failed:", error);
  }

  if (!requestedEntity) {
    const groups = new Map<string, any[]>();
    for (const item of updates) {
      const key = item.entityKey || buildEntityKey(item.title, item.sourceName);
      const list = groups.get(key) || [];
      list.push(item);
      groups.set(key, list);
    }
    const entities = [...groups.entries()]
      .map(([key, items]) => {
        items.sort((a, b) => dateValue(b.publishedAt || b.createdAt) - dateValue(a.publishedAt || a.createdAt));
        return { key, items, latest: items[0], stages: new Set(items.map((x) => x.category.slug)).size, name: getStudentEntityName(items[0].title) };
      })
      .sort((a, b) => dateValue(b.latest.publishedAt || b.latest.createdAt) - dateValue(a.latest.publishedAt || a.latest.createdAt))
      .slice(0, 30);

    return <main className="min-h-screen bg-gray-50 py-8"><div className="mx-auto max-w-6xl px-4"><section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8"><div className="text-xs font-black uppercase tracking-wider text-red-600">आपने खोजा: {query}</div><h1 className="mt-2 text-3xl font-black">अब अपना exact काम चुनें</h1><p className="mt-3 text-sm leading-7 text-gray-600">अलग-अलग भर्ती/परीक्षा/योजना अलग दिखाई गई हैं। किसी एक को खोलने पर उसी का पूरा workflow मिलेगा—दूसरी भर्ती की जानकारी नहीं मिलेगी।</p><form className="mt-5 flex gap-2"><input name="q" defaultValue={query} className="min-w-0 flex-1 rounded-xl border border-gray-300 px-4 py-3" /><button className="rounded-xl bg-gray-950 px-5 py-3 font-black text-white">फिर खोजें</button></form></section><section className="mt-6 grid gap-4 md:grid-cols-2">{entities.length ? entities.map((entity) => <article key={entity.key} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"><div className="flex items-center justify-between gap-3 text-xs"><span className="font-black text-red-600">{entity.stages} stages · {entity.items.length} updates</span><span className="text-gray-400">{new Date(entity.latest.publishedAt || entity.latest.createdAt).toLocaleDateString("hi-IN", { day: "numeric", month: "short", year: "numeric" })}</span></div><h2 className="mt-2 text-xl font-black">{entity.name}</h2><p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-600">{entity.latest.description || entity.latest.title}</p><div className="mt-4 flex flex-wrap gap-2"><Link href={`/track?entity=${encodeURIComponent(entity.key)}`} className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-black text-white">पूरा workflow देखें →</Link><Link href={`/news/${entity.latest.slug}`} className="rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-black text-gray-900">Latest update</Link></div></article>) : <div className="rounded-2xl bg-white p-6 text-sm text-gray-600">इस नाम से अभी verified update नहीं मिला। exact भर्ती/परीक्षा/योजना का नाम लिखकर फिर खोजें।</div>}</section><AdsterraNative /></div></main>;
  }

  const entityKey = requestedEntity;
  const matches = updates.filter((item) => (item.entityKey || buildEntityKey(item.title, item.sourceName)) === entityKey);
  if (!matches.length) return <main className="min-h-screen bg-gray-50 py-10"><div className="mx-auto max-w-2xl px-4"><section className="rounded-3xl bg-white p-7 text-center shadow-sm"><h1 className="text-2xl font-black">यह master workflow अभी नहीं मिला</h1><p className="mt-3 text-sm leading-6 text-gray-600">हो सकता है entity पुरानी हो या अभी official update publish न हुआ हो।</p><Link href="/track" className="mt-5 inline-flex rounded-xl bg-red-600 px-5 py-3 text-sm font-black text-white">दूसरा काम खोजें →</Link></section></div></main>;

  matches.sort((a, b) => dateValue(b.publishedAt || b.createdAt) - dateValue(a.publishedAt || a.createdAt));
  const entityName = getStudentEntityName(matches[0].title);
  const lifecycle = STAGES.map(([slug, icon, label, hint]) => ({ slug, icon, label, hint, items: matches.filter((x) => x.category.slug === slug).sort((a, b) => dateValue(b.publishedAt || b.createdAt) - dateValue(a.publishedAt || a.createdAt)) }));
  const latestStage = lifecycle.map((stage) => ({ stage, item: stage.items[0] })).filter((x) => x.item).sort((a, b) => dateValue(b.item.publishedAt || b.item.createdAt) - dateValue(a.item.publishedAt || a.item.createdAt))[0];
  const currentStage = latestStage?.stage;
  const currentItem = latestStage?.item || matches[0];
  const action = ACTIONS[currentStage?.slug || "jobs"];

  return <main className="min-h-screen bg-gray-50 py-8"><div className="mx-auto max-w-6xl px-4"><Link href={`/track?q=${encodeURIComponent(entityName)}`} className="text-sm font-bold text-red-600">← सभी matching works</Link><section className="mt-3 rounded-3xl bg-gradient-to-br from-red-800 to-orange-600 p-6 text-white shadow-lg sm:p-8"><div className="text-xs font-black uppercase tracking-wider text-red-100">एक ही काम का Master Page</div><h1 className="mt-2 text-3xl font-black sm:text-4xl">{entityName}</h1><p className="mt-3 max-w-3xl text-sm leading-7 text-red-50">यह page सिर्फ इसी भर्ती/परीक्षा/योजना के updates जोड़ता है। दूसरे exam या दूसरे result को इस timeline में नहीं मिलाया जाएगा।</p><div className="mt-5 grid gap-3 sm:grid-cols-4"><div className="rounded-2xl bg-white/10 p-4"><p className="text-xs text-red-100">किसका काम?</p><p className="mt-1 font-black">{entityName}</p></div><div className="rounded-2xl bg-white/10 p-4"><p className="text-xs text-red-100">कुल updates</p><p className="mt-1 text-2xl font-black">{matches.length}</p></div><div className="rounded-2xl bg-white/10 p-4"><p className="text-xs text-red-100">Current stage</p><p className="mt-1 font-black">{currentStage?.label || "Verified update"}</p></div><div className="rounded-2xl bg-white/10 p-4"><p className="text-xs text-red-100">अभी क्या करें?</p><p className="mt-1 font-black">{currentStage?.label || "Latest update देखें"}</p></div></div></section><section className="mt-6 grid gap-5 lg:grid-cols-[1.3fr_.7fr]"><div className="rounded-2xl border-2 border-red-100 bg-red-50 p-5"><div className="text-xs font-black uppercase tracking-wider text-red-700">अभी आपका काम</div><h2 className="mt-1 text-2xl font-black">{currentStage?.label || "Latest verified update"}</h2><p className="mt-2 text-sm leading-7 text-gray-700">{action}</p><p className="mt-3 text-sm font-bold text-gray-900">Latest: {currentItem.title}</p><Link href={`/news/${currentItem.slug}`} className="mt-4 inline-flex rounded-xl bg-red-700 px-5 py-3 text-sm font-black text-white">पहले पूरा तरीका समझें →</Link></div><div className="rounded-2xl border bg-white p-5"><div className="text-xs font-black uppercase tracking-wider text-gray-500">पहचान check</div><div className="mt-3 space-y-2 text-sm"><div>✓ सही भर्ती/परीक्षा/योजना</div><div>✓ सही year/session</div><div>✓ सही संस्था/विभाग</div><div>✓ अपनी eligibility/documents</div><div>✓ अंतिम भरोसा official notice</div></div></div></section><AdsterraNative /><section className="mt-6 rounded-2xl border bg-white p-5 shadow-sm"><h2 className="text-2xl font-black">पूरा workflow</h2><p className="mt-1 text-sm text-gray-500">जिस stage की verified information मिली है वही live दिखती है; बाकी को “अभी update नहीं मिला” कहा गया है।</p><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{lifecycle.map((stage) => <article key={stage.slug} className={`rounded-2xl border p-4 ${stage.items.length ? "border-green-100 bg-green-50" : "border-dashed border-gray-200 bg-gray-50"}`}><div className="flex items-start justify-between"><span className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-black ${stage.items.length ? "bg-green-600 text-white" : "bg-gray-200 text-gray-500"}`}>{stage.icon}</span><span className="rounded-full bg-white px-2 py-1 text-[10px] font-black">{stage.items.length ? `${stage.items.length} update` : "अभी नहीं"}</span></div><h3 className="mt-3 font-black">{stage.label}</h3><p className="mt-1 text-xs text-gray-500">{stage.hint}</p>{stage.items.length ? <div className="mt-3 space-y-2">{stage.items.slice(0, 4).map((item) => <Link key={item.id} href={`/news/${item.slug}`} className="block rounded-xl bg-white p-3 text-sm font-bold hover:ring-2 hover:ring-red-100">{item.title}<span className="mt-1 block text-[11px] font-black text-red-600">इस stage की जानकारी →</span></Link>)}</div> : <p className="mt-3 text-xs leading-5 text-gray-500">इस entity के लिए verified update अभी publish नहीं मिला।</p>}</article>)}</div></section><section className="mt-6 rounded-2xl border bg-white p-5 shadow-sm"><h2 className="text-xl font-black">इस काम के लिए क्या तैयार रखें?</h2><div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{["Official notification/notice", "Application या registration number", "पहचान और जरूरी documents", "Exam/admission details", "Payment/receipt proof जहां लागू हो", "Latest official notice"].map((x) => <div key={x} className="rounded-xl bg-gray-50 p-3 text-sm font-bold">✓ {x}</div>)}</div></section><section className="mt-6 rounded-3xl bg-gray-950 p-6 text-white sm:p-8"><div className="text-xs font-black uppercase tracking-wider text-gray-400">Final official action</div><h2 className="mt-1 text-2xl font-black">अब official website पर अपना काम करें</h2><p className="mt-2 text-sm leading-6 text-gray-300">ऊपर की जानकारी समझने और पहचान जांचने के बाद ही अंतिम आवेदन, download, objection, result या status का काम official source पर करें।</p>{currentItem.sourceUrl ? <a href={currentItem.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-black text-gray-950">Official action ↗</a> : <p className="mt-3 text-xs text-gray-400">Verified official link उपलब्ध होने पर यहां दिखाई देगा।</p>}</section></div></main>;
}
