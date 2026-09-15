import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { buildEntityKey } from "@/lib/entity-key";
import { AdsterraNative } from "@/components/AdsterraAds";

export const metadata: Metadata = { title: "भर्ती / परीक्षा / छात्र Tracker | Student Update", description: "किसी भर्ती, परीक्षा, रिजल्ट, Admit Card, Answer Key, Scholarship, Admission या योजना को एक जगह समझें और अगला काम जानें।", robots: { index: false, follow: true } };
export const dynamic = "force-dynamic";
type Props = { searchParams: Promise<{ q?: string }> };
const STAGES = [
  ["jobs", "01", "Notification / भर्ती", "आवेदन, पात्रता और भर्ती"],
  ["exams", "02", "परीक्षा", "Exam date, syllabus और pattern"],
  ["admit-card", "03", "Admit Card", "Hall ticket और exam centre"],
  ["answer-key", "04", "Answer Key", "उत्तर, response और objection"],
  ["results", "05", "Result", "Result, merit और cutoff"],
  ["admission", "06", "Counselling / Admission", "Merit, seat allotment और admission"],
  ["scholarship", "07", "Scholarship", "Scheme, session, OTR और status"],
  ["schemes", "08", "सरकारी योजना", "Eligibility, benefit और application"],
  ["education", "09", "Education / Board", "Board, university और session"],
] as const;
const clean = (v: string) => v.trim().replace(/\s+/g, " ").slice(0, 100);
const PRIORITY = ["results", "answer-key", "admit-card", "exams", "jobs", "admission", "scholarship", "schemes", "education"];

export default async function TrackPage({ searchParams }: Props) {
  const query = clean((await searchParams).q || "");
  if (!query) return <main className="min-h-screen bg-gray-50 py-10"><div className="mx-auto max-w-4xl px-4"><section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8"><div className="text-xs font-black uppercase tracking-wider text-red-600">Master Tracker</div><h1 className="mt-2 text-3xl font-black">किस भर्ती, परीक्षा, रिजल्ट या छात्र काम को एक जगह ट्रैक करना है?</h1><p className="mt-3 text-sm leading-7 text-gray-600">जैसे SSC CGL 2026, REET, RPSC School Lecturer, RRB NTPC, RBSE 10th Result या Rajasthan Scholarship.</p><form className="mt-6 flex flex-col gap-2 sm:flex-row"><input name="q" className="min-w-0 flex-1 rounded-xl border border-gray-300 px-4 py-3" placeholder="जैसे: SSC CGL 2026 / REET / Rajasthan Scholarship" /><button className="rounded-xl bg-red-600 px-6 py-3 font-black text-white">Tracker खोलें →</button></form></section></div></main>;

  const entityKey = buildEntityKey(query);
  const words = query.split(" ").filter(w => w.length > 2).slice(0, 5);
  let updates: any[] = [];
  let dbError = false;
  try {
    const entityMatches = await db.news.findMany({ where: { status: "PUBLISHED", entityKey }, orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }], take: 100, select: { id: true, slug: true, title: true, description: true, sourceName: true, sourceUrl: true, publishedAt: true, entityKey: true, category: { select: { name: true, slug: true } } } });
    if (entityMatches.length) {
      updates = entityMatches;
    } else {
      updates = await db.news.findMany({ where: { status: "PUBLISHED", OR: [{ title: { contains: query, mode: "insensitive" } }, { description: { contains: query, mode: "insensitive" } }, { content: { contains: query, mode: "insensitive" } }, ...words.map(word => ({ title: { contains: word, mode: "insensitive" as const } }))] }, orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }], take: 100, select: { id: true, slug: true, title: true, description: true, sourceName: true, sourceUrl: true, publishedAt: true, entityKey: true, category: { select: { name: true, slug: true } } } });
    }
  } catch (error) { dbError = true; console.error("Tracker database read failed:", error); }
  const stageData = STAGES.map(([slug, icon, label, hint]) => ({ slug, icon, label, hint, items: updates.filter(item => item.category.slug === slug).slice(0, 5) }));
  const active = stageData.filter(s => s.items.length);
  const nextStage = PRIORITY.map(slug => stageData.find(stage => stage.slug === slug)).find(stage => stage?.items.length);
  const nextItem = nextStage?.items[0];
  const nextLabel = nextStage?.label || "Official source";
  return <main className="min-h-screen bg-gray-50 py-8"><div className="mx-auto max-w-6xl px-4"><nav className="text-xs font-bold text-gray-500"><Link href="/" className="hover:text-red-600">होम</Link> / Tracker</nav><section className="mt-4 rounded-3xl bg-white p-6 shadow-sm sm:p-8"><div className="text-xs font-black uppercase tracking-wider text-red-600">{active.length} चरण मिले</div><h1 className="mt-2 text-3xl font-black">{query}</h1><p className="mt-3 max-w-3xl text-sm leading-7 text-gray-600">एक ही भर्ती/परीक्षा/योजना के updates को एक master flow में जोड़ा गया है। जिस stage की verified जानकारी नहीं मिली, उसे live होने का दावा नहीं किया जाता।</p>{dbError && <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><b>Live database अभी उपलब्ध नहीं है।</b> Sync वापस आते ही tracker खुद भर जाएगा।</div>}<div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-gray-50 p-4"><div className="text-xs text-gray-500">मिली updates</div><b className="text-2xl">{updates.length}</b></div><div className="rounded-2xl bg-gray-50 p-4"><div className="text-xs text-gray-500">मिले stages</div><b className="text-2xl">{active.length}</b></div><div className="rounded-2xl bg-red-50 p-4"><div className="text-xs text-red-700">अभी क्या करें?</div><b className="text-sm text-red-800">{nextStage ? `${nextLabel} वाला सबसे नया verified update खोलें` : "अभी verified update उपलब्ध नहीं"}</b></div></div>{nextItem && <div className="mt-5 rounded-2xl border-2 border-red-200 bg-red-50 p-5"><div className="text-xs font-black uppercase tracking-wide text-red-700">आपका अगला काम</div><h2 className="mt-1 text-xl font-black text-gray-950">{nextLabel}</h2><p className="mt-2 text-sm leading-7 text-gray-700">{nextItem.title}</p><div className="mt-4 flex flex-wrap gap-2"><Link href={`/news/${nextItem.slug}`} className="rounded-xl bg-red-700 px-4 py-2.5 text-sm font-black text-white">पहले पूरा तरीका समझें →</Link>{nextItem.sourceUrl && <a href={nextItem.sourceUrl} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-white px-4 py-2.5 text-sm font-black text-red-700">Official action ↗</a>}</div></div>}</section><section className="mt-6 space-y-4">{stageData.map(stage => <section key={stage.slug} className="rounded-3xl border bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div className="flex gap-3"><span className={`flex h-10 w-10 items-center justify-center rounded-xl text-xs font-black ${stage.items.length ? "bg-red-600 text-white" : "bg-gray-100 text-gray-400"}`}>{stage.icon}</span><div><h2 className="font-black">{stage.label}</h2><p className="mt-1 text-xs text-gray-500">{stage.hint}</p></div></div><span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-black">{stage.items.length ? "जानकारी मिली" : "अभी नहीं मिली"}</span></div>{stage.items.length ? <div className="mt-4 grid gap-3 lg:grid-cols-2">{stage.items.map(item => <Link key={item.id} href={`/news/${item.slug}`} className="rounded-2xl border border-gray-100 p-4 hover:border-red-200"><div className="text-[11px] font-black text-red-600">{item.category.name} · {item.sourceName || "Official source"}</div><div className="mt-1 font-black leading-6">{item.title}</div><div className="mt-3 text-xs font-black text-red-700">यह update समझें →</div></Link>)}</div> : <div className="mt-4 rounded-2xl bg-gray-50 p-4 text-xs leading-6 text-gray-500">इस नाम से इस stage की verified update नहीं मिली। <Link href={`/category/${stage.slug}`} className="font-black text-red-600">Category देखें →</Link></div>}</section>)}</section><AdsterraNative /><section className="mt-7 rounded-3xl bg-gray-950 p-6 text-white"><h2 className="text-2xl font-black">Final official action</h2><p className="mt-2 text-sm leading-6 text-gray-300">Application, admit card, objection, result, scholarship, admission या payment का अंतिम काम संबंधित official website पर ही करें।</p>{nextItem?.sourceUrl ? <a href={nextItem.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-black text-gray-950">अब official website पर जाएं ↗</a> : <p className="mt-3 text-xs text-gray-400">Official link तभी दिखेगा जब verified source URL उपलब्ध होगा।</p>}</section></div></main>;
}
