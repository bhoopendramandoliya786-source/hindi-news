import Link from "next/link";
import { db } from "@/lib/db";
import AdSlot from "@/components/AdSense";
import { AdsterraBanner, AdsterraNative } from "@/components/AdsterraAds";
import AutoSystemBadge from "@/components/AutoSystemBadge";
import { getStudentEntityKey } from "@/lib/student-entity";

const TASKS = [
  ["jobs", "💼", "सरकारी नौकरी", "भर्ती, आवेदन और चयन"],
  ["exams", "📝", "परीक्षा", "Exam, syllabus और date"],
  ["admit-card", "🎫", "Admit Card", "किस परीक्षा/भर्ती का प्रवेश पत्र?"],
  ["answer-key", "🔑", "Answer Key", "उत्तर, response और objection"],
  ["results", "🏆", "Result", "किस परीक्षा/भर्ती का result?"],
  ["scholarship", "🎓", "Scholarship", "Scheme, session और status"],
  ["admission", "🏫", "Admission", "Course, college और counselling"],
  ["education", "📚", "शिक्षा", "RBSE, University, ITI, Polytechnic"],
  ["documents", "📄", "Documents", "किस काम में कौन सा document?"],
  ["schemes", "🏛️", "सरकारी योजनाएं", "विभाग, पात्रता और लाभ"],
  ["citizen-services", "🪪", "नागरिक सेवाएं", "SSO, Jan Aadhaar और services"],
  ["current-affairs", "📰", "Current Affairs", "Exam-useful verified updates"],
  ["student-updates", "⭐", "राजस्थान छात्र अपडेट", "Student-useful latest updates"],
] as const;

const QUALIFICATIONS = ["10वीं", "12वीं", "ITI", "Diploma", "Graduate", "B.Ed", "B.Tech", "Nursing"] as const;
const ORGANISATIONS = ["SSC", "UPSC", "Railway RRB", "Banking", "RPSC", "RSSB", "RBSE", "NSP"] as const;

function dateText(value: Date | string | null | undefined) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("hi-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default async function StudentPortalHome() {
  let latest: any[] = [];
  let categories: any[] = [];
  let dbError = false;

  try {
    [latest, categories] = await Promise.all([
      db.news.findMany({ where: { status: "PUBLISHED" }, orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }], take: 36, select: { id: true, slug: true, title: true, description: true, publishedAt: true, createdAt: true, sourceName: true, category: { select: { name: true, slug: true } } } }),
      db.category.findMany({ orderBy: { name: "asc" }, select: { name: true, slug: true, _count: { select: { news: { where: { status: "PUBLISHED" } } } } } }),
    ]);
  } catch (error) {
    dbError = true;
    console.error("Student Update homepage database read failed:", error);
  }

  const count = (slug: string) => categories.find((x) => x.slug === slug)?._count.news || 0;

  return <main className="min-h-screen bg-gray-50 pb-16"><div className="mx-auto max-w-7xl px-4 py-5 sm:py-8">
    <section className="rounded-3xl bg-gradient-to-r from-gray-950 via-red-800 to-orange-600 p-6 text-white shadow-xl sm:p-10">
      <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-black">🎓 Student Update • India + Rajasthan</span>
      <h1 className="mt-4 max-w-4xl text-3xl font-black leading-tight sm:text-5xl">खबर नहीं — आपका पूरा सरकारी काम</h1>
      <p className="mt-4 max-w-4xl text-sm leading-7 text-red-50 sm:text-base">भर्ती, परीक्षा, Admit Card, Answer Key, Result, Scholarship, Admission और सरकारी सेवाओं को exact काम के हिसाब से खोजें। पहले जानकारी समझें, फिर documents/eligibility देखें और अंत में official website पर काम करें।</p>
      <div className="mt-6 flex flex-wrap gap-3"><Link href="/track" className="rounded-xl bg-white px-5 py-3 text-sm font-black text-red-800">Recruitment / Exam Tracker →</Link><Link href="/search" className="rounded-xl bg-white/15 px-5 py-3 text-sm font-black ring-1 ring-white/30">अपना काम खोजें</Link><Link href="/category/jobs" className="rounded-xl bg-white/15 px-5 py-3 text-sm font-black ring-1 ring-white/30">आज की नौकरी</Link></div>
      <AutoSystemBadge />
    </section>

    {dbError && <section className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900"><b>Live database अभी अस्थायी रूप से उपलब्ध नहीं है।</b> Website बंद नहीं होगी। Automatic official sync/database ठीक होते ही latest data अपने आप फिर दिखेगा। <Link href="/search" className="font-black underline">Search खोलें</Link></section>}

    <section className="mt-6 rounded-3xl border border-red-100 bg-white p-5 shadow-sm sm:p-6"><p className="text-xs font-black uppercase tracking-wider text-red-600">अभी क्या करना है?</p><h2 className="mt-1 text-2xl font-black text-gray-950">अपना काम चुनें</h2><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Link href="/category/jobs" className="rounded-2xl bg-red-50 p-4"><b>📝 आवेदन करना है</b><p className="mt-1 text-xs text-gray-600">नई भर्ती और form</p></Link><Link href="/category/admit-card" className="rounded-2xl bg-blue-50 p-4"><b>🎫 Admit Card चाहिए</b><p className="mt-1 text-xs text-gray-600">Exam/Recruitment पहचानें</p></Link><Link href="/category/results" className="rounded-2xl bg-green-50 p-4"><b>🏆 Result देखना है</b><p className="mt-1 text-xs text-gray-600">Exam/Recruitment के अनुसार</p></Link><Link href="/category/scholarship" className="rounded-2xl bg-yellow-50 p-4"><b>🎓 Scholarship चाहिए</b><p className="mt-1 text-xs text-gray-600">Scheme + session + status</p></Link></div></section>

    <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{TASKS.map(([slug, icon, title, text]) => <Link key={slug} href={`/category/${slug}`} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm hover:border-red-200 hover:shadow-md"><div className="text-2xl">{icon}</div><div className="mt-2 font-black text-gray-950">{title}</div><div className="mt-1 text-xs leading-5 text-gray-500">{text}</div><div className="mt-3 text-xs font-black text-red-600">{count(slug).toLocaleString("hi-IN")} अपडेट →</div></Link>)}</section>

    <AdSlot className="my-6" />

    <section className="rounded-3xl border border-blue-100 bg-blue-50 p-5 sm:p-7"><p className="text-xs font-black uppercase tracking-wider text-blue-700">हर काम का नियम</p><h2 className="mt-1 text-2xl font-black text-gray-950">पहले समझें → तैयार हों → official काम करें</h2><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{[["1", "क्या हुआ?", "Update का सीधा मतलब"], ["2", "किसके लिए?", "Eligibility"], ["3", "क्या चाहिए?", "Documents/details"], ["4", "अब क्या करें?", "सही क्रम"], ["5", "Official काम", "मूल सरकारी page"]].map(([n, title, text]) => <div key={n} className="rounded-2xl bg-white p-4 shadow-sm"><b className="text-red-600">{n}</b><div className="mt-1 font-black text-gray-950">{title}</div><div className="mt-1 text-xs text-gray-600">{text}</div></div>)}</div></section>

    <section className="mt-8 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-end justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-wider text-red-600">Qualification wise</p><h2 className="mt-1 text-2xl font-black">अपनी योग्यता से शुरू करें</h2></div><Link href="/search" className="text-xs font-black text-red-600">और खोजें →</Link></div><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{QUALIFICATIONS.map((q) => <Link key={q} href={`/search?q=${encodeURIComponent(q)}`} className="rounded-2xl bg-gray-50 p-4 hover:bg-red-50"><b>{q}</b><p className="mt-1 text-xs text-gray-500">{q} से जुड़े jobs, exams, admissions और updates</p><span className="mt-2 block text-xs font-black text-red-600">Updates देखें →</span></Link>)}</div></section>

    <section className="mt-6 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6"><p className="text-xs font-black uppercase tracking-wider text-red-600">Organisation / Exam wise</p><h2 className="mt-1 text-2xl font-black">किस संस्था या exam का update चाहिए?</h2><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{ORGANISATIONS.map((name) => <Link key={name} href={`/track?q=${encodeURIComponent(name)}`} className="rounded-2xl bg-gray-50 p-4 hover:bg-red-50"><b>{name}</b><p className="mt-1 text-xs text-gray-500">इस नाम से मिला पूरा workflow</p><span className="mt-2 block text-xs font-black text-red-600">Tracker खोलें →</span></Link>)}</div></section>

    <section className="mt-8"><div className="mb-4 flex items-end justify-between border-b-2 border-red-600 pb-2"><div><h2 className="text-2xl font-black">आज के जरूरी अपडेट</h2><p className="mt-1 text-xs text-gray-500">हर card में exact काम का master page भी है</p></div><Link href="/search" className="text-xs font-black text-red-600">सभी खोजें →</Link></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{latest.slice(0, 12).map((item) => { const key = getStudentEntityKey(item.title, item.category.slug); return <article key={item.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"><div className="flex justify-between gap-3 text-xs"><span className="font-black text-red-600">{item.category.name}</span><span className="text-gray-400">{dateText(item.publishedAt || item.createdAt)}</span></div><h3 className="mt-2 font-black leading-snug">{item.title}</h3><p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-600">{item.description || "Official source पर आधारित student action information."}</p><div className="mt-4 flex flex-wrap gap-2"><Link href={`/news/${item.slug}`} className="rounded-lg bg-gray-950 px-3 py-2 text-xs font-black text-white">पूरा समझें →</Link><Link href={`/student-work/${key}`} className="rounded-lg bg-red-50 px-3 py-2 text-xs font-black text-red-700">इसी काम के सभी updates →</Link></div></article> })}</div></section>

    <AdsterraNative />
    <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100"><h2 className="text-2xl font-black">📌 भर्ती / परीक्षा का पूरा रास्ता</h2><p className="mt-2 text-sm leading-6 text-gray-600">Notification → Application → Admit Card → Exam → Answer Key/Objection → Result → Selection/Appointment. जिस नाम को खोजेंगे, Tracker उपलब्ध published stages को एक जगह दिखाएगा और missing stage को अनुमान से live नहीं बताएगा।</p><Link href="/track" className="mt-5 inline-block rounded-xl bg-red-700 px-5 py-3 text-sm font-black text-white">Master Tracker खोलें →</Link></section>

    <AdsterraBanner /><AdSlot className="my-6" />
    <section className="mt-6 rounded-3xl bg-gray-950 p-6 text-white sm:p-8"><h2 className="text-2xl font-black">📲 जरूरी छात्र अपडेट सीधे पाएं</h2><p className="mt-2 text-sm leading-6 text-gray-300">भर्ती, परीक्षा, रिजल्ट, स्कॉलरशिप और सरकारी छात्र काम के नए updates मिस न करें।</p><a href="https://whatsapp.com/channel/0029Vb8rO9c7DAWvQtwE3o3n" target="_blank" rel="noopener noreferrer" className="mt-5 inline-block rounded-xl bg-green-500 px-5 py-3 text-sm font-black">WhatsApp चैनल जॉइन करें →</a></section>
  </div></main>;
}
