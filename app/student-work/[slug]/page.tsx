import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { db } from "@/lib/db";
import AdSlot from "@/components/AdSense";
import { AdsterraBanner, AdsterraNative } from "@/components/AdsterraAds";
import { getStudentContext } from "@/lib/student-context";
import { getStudentEntityKey, getStudentEntityName } from "@/lib/student-entity";

interface Props { params: Promise<{ slug: string }> }
export const revalidate = 60;
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://hindi-news-omega.vercel.app").replace(/\/$/, "");
const STAGES = [
  ["Notification / आवेदन", "jobs", ["notification", "notice", "recruitment", "bharti", "apply", "application", "form", "विज्ञप्ति", "भर्ती", "आवेदन"]],
  ["परीक्षा", "exams", ["exam", "syllabus", "schedule", "परीक्षा", "सिलेबस"]],
  ["Admit Card", "admit-card", ["admit", "card", "प्रवेश", "प्रवेश-पत्र"]],
  ["Answer Key / Objection", "answer-key", ["answer", "key", "objection", "आंसर", "उत्तर कुंजी", "आपत्ति"]],
  ["Result / Merit", "results", ["result", "merit", "cutoff", "cut-off", "रिजल्ट", "परिणाम", "मेरिट"]],
] as const;
const stageFor = (title: string, category: string) => { const hay = `${title} ${category}`.toLowerCase(); return STAGES.find(s => s[2].some(w => hay.includes(w.toLowerCase()))) || [getStudentContext(category, title).label, category, []] as const; };

const getWork = cache(async (slug: string) => {
  try {
    const rows = await db.news.findMany({ where: { status: "PUBLISHED" }, orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }], take: 1200, select: { id: true, slug: true, title: true, description: true, sourceName: true, sourceUrl: true, publishedAt: true, createdAt: true, category: { select: { slug: true, name: true } } } });
    const matched = rows.filter(item => getStudentEntityKey(item.title, item.category.slug) === slug);
    if (!matched.length) return null;
    const first = matched[0];
    return { slug, name: getStudentEntityName(first.title), categorySlug: first.category.slug, items: matched, dbError: false };
  } catch (error) {
    console.error("Student work database read failed:", error);
    return null;
  }
});

export async function generateMetadata({ params }: Props) { const { slug } = await params; const work = await getWork(slug); if (!work) return { title: "Student work | Student Update", robots: { index: false, follow: true } }; const description = `${work.name} के आवेदन, परीक्षा, Admit Card, Answer Key और Result से जुड़े official updates एक जगह।`.slice(0, 160); return { title: `${work.name} | पूरा workflow`, description, alternates: { canonical: `${SITE_URL}/student-work/${slug}` } }; }

export default async function StudentWorkPage({ params }: Props) {
  const { slug } = await params; const work = await getWork(slug); if (!work) notFound();
  const groups = new Map<string, { label: string; href: string; items: typeof work.items }>();
  for (const item of work.items) { const [label, href] = stageFor(item.title, item.category.slug); const old = groups.get(label); if (old) old.items.push(item); else groups.set(label, { label, href: `/category/${href}`, items: [item] }); }
  const ordered = [...groups.values()]; const latest = work.items[0];
  return <main className="min-h-screen bg-gray-50 py-6 sm:py-8"><div className="mx-auto max-w-6xl px-4"><nav className="text-xs font-bold text-gray-500"><Link href="/">होम</Link> / <Link href={`/category/${work.categorySlug}`}>{getStudentContext(work.categorySlug, work.name).label}</Link> / {work.name}</nav><section className="mt-4 rounded-3xl bg-gradient-to-br from-gray-950 via-red-800 to-orange-600 p-6 text-white shadow-xl sm:p-9"><div className="text-xs font-black uppercase tracking-wider text-red-100">एक ही काम की पूरी timeline</div><h1 className="mt-2 text-3xl font-black sm:text-5xl">{work.name}</h1><p className="mt-3 max-w-4xl text-sm leading-7 text-red-50">इस exact भर्ती/परीक्षा/योजना से जुड़े available official updates को एक जगह जोड़ा गया है।</p><div className="mt-5 rounded-2xl bg-white/10 p-4 text-sm leading-6"><b>अभी आपको क्या करना है?</b><br />सबसे नया उपलब्ध stage खोलें और उसी update के अंतिम official action से काम पूरा करें।</div>{latest && <Link href={`/news/${latest.slug}`} className="mt-4 inline-flex rounded-xl bg-white px-4 py-3 text-sm font-black text-red-700">Latest update खोलें →</Link>}</section><AdsterraNative /><AdSlot className="my-6" /><section className="mt-6 grid gap-4 sm:grid-cols-2">{ordered.map(stage => <section key={stage.label} className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm"><div className="flex items-center justify-between gap-3"><h2 className="text-lg font-black">{stage.label}</h2><span className="rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-700">{stage.items.length} update</span></div><div className="mt-4 space-y-3">{stage.items.slice(0, 6).map(item => <Link key={item.id} href={`/news/${item.slug}`} className="block rounded-xl bg-gray-50 p-3 hover:bg-red-50"><p className="text-sm font-black leading-5">{item.title}</p><p className="mt-1 text-xs text-gray-500">Official: {item.sourceName || "सरकारी स्रोत"}</p></Link>)}</div><Link href={stage.items[0] ? `/news/${stage.items[0].slug}` : stage.href} className="mt-4 inline-flex text-sm font-black text-red-700">इस stage का latest काम →</Link></section>)}</section><AdsterraBanner /><section className="mt-7 rounded-3xl border border-red-100 bg-red-50 p-5"><h2 className="text-xl font-black">Official काम से पहले checklist</h2><div className="mt-3 grid gap-2 text-sm leading-6 sm:grid-cols-2"><p>✓ Exact name और year/session मिलाएं</p><p>✓ Eligibility और documents official notice से मिलाएं</p><p>✓ Application/roll number सुरक्षित रखें</p><p>✓ Deadline official source पर verify करें</p><p>✓ Payment केवल official portal पर करें</p></div></section><section className="mt-6 rounded-3xl bg-gray-950 p-6 text-white"><h2 className="text-2xl font-black">Final official action</h2><p className="mt-2 text-sm leading-7 text-gray-300">यह page workflow समझाता है। आवेदन, download, objection, result या payment हमेशा संबंधित सरकारी website पर ही करें।</p><div className="mt-4 flex flex-wrap gap-2"><Link href={`/category/${work.categorySlug}`} className="rounded-xl bg-white px-4 py-2 text-sm font-black text-gray-950">Category देखें →</Link><Link href="/track" className="rounded-xl bg-white/10 px-4 py-2 text-sm font-black ring-1 ring-white/20">दूसरा Tracker →</Link></div></section></div></main>;
}
