import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { db } from "@/lib/db";
import AdSlot from "@/components/AdSense";
import { AdsterraBanner, AdsterraNative } from "@/components/AdsterraAds";
import { getStudentContext } from "@/lib/student-context";
import { buildStudentEntities, getStudentEntityKey } from "@/lib/student-entity";

interface Props { params: Promise<{ slug: string }> }
export const revalidate = 60;
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://hindi-news-omega.vercel.app").replace(/\/$/, "");

type Item = { id: string; slug: string; title: string; description: string | null; sourceName: string | null; publishedAt: Date | null; createdAt: Date; category: { slug: string; name: string } };
const CATEGORY_INFO: Record<string, { name: string; description: string }> = {
  jobs: { name: "सरकारी नौकरी", description: "भारत और राजस्थान की सरकारी भर्ती, आवेदन और चयन प्रक्रिया को सही भर्ती के हिसाब से समझें।" },
  exams: { name: "परीक्षा", description: "सरकारी और छात्र परीक्षाओं के notification, syllabus, exam date और अगले चरण की जानकारी।" },
  "admit-card": { name: "Admit Card", description: "किस परीक्षा या भर्ती का प्रवेश पत्र है, क्या चाहिए और डाउनलोड के बाद क्या जांचना है।" },
  "answer-key": { name: "Answer Key", description: "परीक्षा की उत्तर कुंजी, response और objection प्रक्रिया को official source के अनुसार समझें।" },
  results: { name: "Result", description: "किस परीक्षा, भर्ती, बोर्ड या विश्वविद्यालय का result है और result के बाद अगला चरण क्या है।" },
  scholarship: { name: "Scholarship", description: "Scheme, academic session, eligibility, documents, application, verification और status को एक flow में समझें।" },
  admission: { name: "Admission", description: "Course, college, university, counselling, merit और final admission की जानकारी।" },
  documents: { name: "Documents", description: "Recruitment, scholarship, admission और सरकारी सेवाओं में कौन से documents चाहिए।" },
  schemes: { name: "सरकारी योजनाएं", description: "किस विभाग की योजना है, किसके लिए है, क्या लाभ है और official आवेदन कैसे होगा।" },
  "citizen-services": { name: "नागरिक सेवाएं", description: "SSO, Jan Aadhaar, certificates और दूसरी सरकारी online services का सही official route।" },
  education: { name: "शिक्षा", description: "RBSE, CBSE, university, college, ITI, Polytechnic और academic session के education updates।" },
  "current-affairs": { name: "Current Affairs", description: "Exam और student use के लिए verified current affairs और जरूरी सरकारी updates।" },
  "student-updates": { name: "राजस्थान छात्र अपडेट", description: "राजस्थान के छात्रों के लिए जरूरी latest सरकारी, परीक्षा, scholarship और education updates।" },
};
const FLOW: Record<string, { steps: string[]; related: string[] }> = {
  jobs: { steps: ["भर्ती/विज्ञापन पहचानें", "पद, योग्यता और शर्तें verify करें", "OTR/आवेदन पूरा करें", "Admit Card और परीक्षा देखें", "Answer Key/objection देखें", "Result/selection का अगला चरण देखें"], related: ["admit-card", "answer-key", "results"] },
  exams: { steps: ["Exam का exact नाम और year पहचानें", "Syllabus/pattern verify करें", "Application/status देखें", "Admit Card आने पर details जांचें", "Exam instructions follow करें", "Answer Key और Result देखें"], related: ["jobs", "admit-card", "results"] },
  "admit-card": { steps: ["Exact exam/recruitment पहचानें", "Official download page खोलें", "Application/registration details दें", "नाम, roll number और centre जांचें", "Date, time और reporting instructions मिलाएं"], related: ["exams", "answer-key", "results"] },
  "answer-key": { steps: ["Exact exam और paper पहचानें", "Official key डाउनलोड करें", "अपने answers मिलाएं", "Objection window हो तो rules देखें", "Final key और result का अगला चरण देखें"], related: ["admit-card", "results", "exams"] },
  results: { steps: ["Exact exam/recruitment/board पहचानें", "Official result page खोलें", "Roll/application details भरें", "Scorecard/result सुरक्षित करें", "Merit/cutoff/shortlist देखें", "DV/counselling/selection का अगला चरण देखें"], related: ["jobs", "answer-key", "admit-card"] },
  scholarship: { steps: ["Scheme और academic session पहचानें", "Eligibility verify करें", "OTR जहां लागू हो पूरा करें", "Documents और bank details तैयार रखें", "Application और verification status देखें", "Payment/status official portal पर जांचें"], related: ["documents", "schemes", "admission"] },
  admission: { steps: ["Institute/course/session पहचानें", "Eligibility verify करें", "Form और documents तैयार करें", "Merit/counselling status देखें", "Verification/seat allotment follow करें", "Final admission instructions देखें"], related: ["documents", "scholarship", "exams"] },
  documents: { steps: ["जिस काम के लिए document चाहिए वह पहचानें", "Official requirement देखें", "Original/valid copy तैयार रखें", "नाम/DOB/details mismatch जांचें", "Official upload/submit route अपनाएं"], related: ["jobs", "scholarship", "admission"] },
  schemes: { steps: ["Scheme और department पहचानें", "Eligibility/benefit verify करें", "Required documents देखें", "Official application route अपनाएं", "Application/verification/status देखें"], related: ["scholarship", "documents", "citizen-services"] },
  "citizen-services": { steps: ["Exact service पहचानें", "Department/official portal verify करें", "Identity/documents तैयार रखें", "Official request/application करें", "Reference और status सुरक्षित रखें"], related: ["documents", "schemes", "education"] },
  education: { steps: ["Board/university/institute पहचानें", "Class/course और session verify करें", "Official notice/result/admission देखें", "Documents और dates जांचें", "Action जरूरी हो तो official portal पर करें"], related: ["results", "admission", "documents"] },
  "current-affairs": { steps: ["Student-useful update चुनें", "Official source verify करें", "Exam/job relevance समझें", "जरूरी facts नोट करें", "Action हो तो संबंधित task page खोलें"], related: ["exams", "jobs", "scholarship"] },
  "student-updates": { steps: ["Department और exact काम पहचानें", "Exam/college/service और session मिलाएं", "Official source verify करें", "Documents/eligibility देखें", "अंतिम काम official website पर करें"], related: ["jobs", "results", "scholarship"] },
};

const getCategoryData = cache(async (slug: string) => {
  try {
    return await db.category.findUnique({
      where: { slug },
      select: { name: true, slug: true, description: true, news: { where: { status: "PUBLISHED" }, orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }], take: 40, select: { id: true, slug: true, title: true, description: true, sourceName: true, publishedAt: true, createdAt: true, category: { select: { slug: true, name: true } } } } },
    });
  } catch (error) {
    console.error(`Category database read failed for ${slug}:`, error);
    return null;
  }
});

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const info = CATEGORY_INFO[slug];
  if (!info) return { title: "Category नहीं मिली", robots: { index: false, follow: true } };
  return { title: `${info.name} | Latest Updates | Student Update`, description: info.description, alternates: { canonical: `${SITE_URL}/category/${slug}` } };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const info = CATEGORY_INFO[slug];
  if (!info) notFound();
  const row = await getCategoryData(slug);
  const items = (row?.news || []) as Item[];
  const flow = FLOW[slug] || FLOW["student-updates"];
  const context = getStudentContext(slug, info.name);
  const entities = buildStudentEntities(items.map((item) => ({ title: item.title })), slug).slice(0, 12);
  const dbUnavailable = !row;

  return <main className="min-h-screen bg-gray-50 py-6 sm:py-8"><div className="mx-auto max-w-7xl px-4">
    <nav className="text-xs font-bold text-gray-500"><Link href="/" className="hover:text-red-600">होम</Link><span className="mx-2">/</span>{info.name}</nav>
    <section className="mt-4 rounded-3xl bg-gradient-to-br from-gray-950 via-red-800 to-orange-600 p-6 text-white shadow-xl sm:p-9"><div className="text-xs font-black uppercase tracking-wider text-red-100">{context.label}</div><h1 className="mt-2 text-3xl font-black sm:text-5xl">{info.name}</h1><p className="mt-3 max-w-4xl text-sm leading-7 text-red-50 sm:text-base">{info.description}</p><div className="mt-5 flex flex-wrap gap-2"><Link href="/track" className="rounded-xl bg-white px-4 py-3 text-sm font-black text-red-800">Master Tracker →</Link><Link href="/search" className="rounded-xl bg-white/15 px-4 py-3 text-sm font-black ring-1 ring-white/30">अपना exact काम खोजें</Link></div></section>
    {dbUnavailable && <section className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900"><b>Live updates अभी sync नहीं हो पाए हैं।</b><br />Category का पूरा workflow उपलब्ध है। Database/official sync ठीक होते ही नए updates अपने आप यहां दिखेंगे।</section>}
    <section className="mt-6 rounded-3xl border border-red-100 bg-white p-5 shadow-sm sm:p-7"><div className="text-xs font-black uppercase tracking-wider text-red-600">आपका flow</div><h2 className="mt-1 text-2xl font-black">इस काम में क्या करना है?</h2><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{flow.steps.map((step, index) => <div key={step} className="rounded-2xl bg-gray-50 p-4"><span className="text-xs font-black text-red-600">0{index + 1}</span><p className="mt-1 text-sm font-black leading-6 text-gray-900">{step}</p></div>)}</div></section>
    {entities.length > 0 && <section className="mt-7 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7"><div className="flex items-end justify-between gap-3"><div><div className="text-xs font-black uppercase tracking-wider text-red-600">Exact work</div><h2 className="mt-1 text-2xl font-black">किस भर्ती / परीक्षा / scheme का काम?</h2></div><Link href="/track" className="text-xs font-black text-red-600">Tracker →</Link></div><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{entities.map((entity) => <Link key={entity.key} href={`/student-work/${entity.key}`} className="rounded-2xl border border-gray-100 bg-gray-50 p-4 hover:border-red-200 hover:bg-red-50"><div className="font-black leading-6 text-gray-950">{entity.name}</div><div className="mt-2 text-xs text-gray-500">{entity.count} जुड़े update</div><span className="mt-3 block text-xs font-black text-red-700">पूरा workflow →</span></Link>)}</div></section>}
    <AdsterraNative /><AdSlot className="my-6" />
    <section className="mt-6"><div className="mb-4 flex items-end justify-between border-b-2 border-red-600 pb-2"><div><div className="text-xs font-black uppercase tracking-wider text-red-600">Latest</div><h2 className="mt-1 text-2xl font-black">{info.name} के नए updates</h2></div><span className="text-xs font-bold text-gray-500">{items.length} published</span></div>{items.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{items.map((item) => <article key={item.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"><div className="flex justify-between gap-3 text-xs"><span className="font-black text-red-600">{item.sourceName || "Official source"}</span><span className="text-gray-400">{new Date(item.publishedAt || item.createdAt).toLocaleDateString("hi-IN", { day: "numeric", month: "short", year: "numeric" })}</span></div><h3 className="mt-2 font-black leading-snug text-gray-950">{item.title}</h3><p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-600">{item.description || "Official source पर आधारित student action information."}</p><div className="mt-4 flex flex-wrap gap-2"><Link href={`/news/${item.slug}`} className="rounded-lg bg-gray-950 px-3 py-2 text-xs font-black text-white">पूरा समझें →</Link><Link href={`/student-work/${getStudentEntityKey(item.title, slug)}`} className="rounded-lg bg-red-50 px-3 py-2 text-xs font-black text-red-700">इसी काम की timeline →</Link></div></article>)}</div> : <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">अभी इस category में कोई published update उपलब्ध नहीं दिख रहा। <Link href="/search" className="font-black text-red-600">दूसरा काम खोजें →</Link></div>}</section>
    <AdsterraBanner /><AdSlot className="my-6" />
    <section className="mt-7 rounded-3xl bg-gray-950 p-6 text-white"><h2 className="text-2xl font-black">Final official action</h2><p className="mt-2 max-w-3xl text-sm leading-7 text-gray-300">यह portal आपको update समझाता है और सही चरण तक पहुंचाता है। आवेदन, download, objection, result, payment या status का अंतिम काम हमेशा संबंधित official website पर ही करें।</p><div className="mt-4 flex flex-wrap gap-2">{flow.related.map((related) => <Link key={related} href={`/category/${related}`} className="rounded-xl bg-white/10 px-4 py-2 text-sm font-black ring-1 ring-white/20">{CATEGORY_INFO[related]?.name || related} →</Link>)}</div></section>
  </div></main>;
}
