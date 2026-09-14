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

const STAGE_RULES: Array<{ label: string; href: string; words: string[] }> = [
  { label: "नोटिफिकेशन / आवेदन", href: "/category/jobs", words: ["notification", "notice", "recruitment", "bharti", "apply", "application", "form", "विज्ञप्ति", "भर्ती", "आवेदन"] },
  { label: "परीक्षा / परीक्षा तिथि", href: "/category/exams", words: ["exam", "syllabus", "schedule", "परीक्षा", "सिलेबस", "समय-सारणी"] },
  { label: "एडमिट कार्ड", href: "/category/admit-card", words: ["admit", "card", "प्रवेश", "प्रवेश-पत्र"] },
  { label: "आंसर की / ऑब्जेक्शन", href: "/category/answer-key", words: ["answer", "key", "objection", "आंसर", "उत्तर कुंजी", "आपत्ति"] },
  { label: "रिजल्ट / मेरिट", href: "/category/results", words: ["result", "merit", "cutoff", "cut-off", "रिजल्ट", "परिणाम", "मेरिट"] },
];

function stageFor(title: string, categorySlug: string) {
  const hay = `${title} ${categorySlug}`.toLowerCase();
  return STAGE_RULES.find(rule => rule.words.some(word => hay.includes(word.toLowerCase()))) || { label: getStudentContext(categorySlug, title).label, href: `/category/${categorySlug}` };
}

const getWork = cache(async (slug: string) => {
  const rows = await db.news.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 2500,
    select: { id: true, slug: true, title: true, description: true, sourceName: true, sourceUrl: true, publishedAt: true, createdAt: true, category: { select: { slug: true, name: true } } },
  });
  const matched = rows.filter(item => getStudentEntityKey(item.title, item.category.slug) === slug);
  if (!matched.length) return null;
  const first = matched[0];
  return { slug, name: getStudentEntityName(first.title), categorySlug: first.category.slug, items: matched };
});

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const work = await getWork(slug);
  if (!work) return { title: "Student work नहीं मिला", robots: { index: false, follow: true } };
  const description = `${work.name} के आवेदन, परीक्षा, एडमिट कार्ड, आंसर की और रिजल्ट से जुड़े latest official updates एक जगह।`.slice(0, 160);
  return { title: `${work.name} | पूरा अपडेट और अगला काम`, description, alternates: { canonical: `${SITE_URL}/student-work/${work.slug}` }, robots: { index: true, follow: true }, openGraph: { title: `${work.name} | पूरा अपडेट`, description, url: `${SITE_URL}/student-work/${work.slug}` } };
}

export default async function StudentWorkPage({ params }: Props) {
  const { slug } = await params;
  const work = await getWork(slug);
  if (!work) notFound();

  const stages = new Map<string, { label: string; href: string; items: typeof work.items }>();
  for (const item of work.items) {
    const stage = stageFor(item.title, item.category.slug);
    const existing = stages.get(stage.label);
    if (existing) existing.items.push(item); else stages.set(stage.label, { ...stage, items: [item] });
  }
  const stageList = STAGE_RULES.map(rule => stages.get(rule.label)).filter(Boolean) as Array<{ label: string; href: string; items: typeof work.items }>;
  for (const stage of stages.values()) if (!stageList.some(item => item.label === stage.label)) stageList.push(stage);

  const current = stageList[stageList.length - 1] || { label: getStudentContext(work.categorySlug, work.name).label, href: `/category/${work.categorySlug}`, items: work.items.slice(0, 1) };
  const latest = work.items[0];

  return <main className="container mx-auto max-w-5xl px-4 py-6">
    <nav className="mb-4 text-sm text-gray-500"><Link href="/" className="hover:text-red-600">होम</Link> / <Link href={`/category/${work.categorySlug}`} className="hover:text-red-600">{getStudentContext(work.categorySlug, work.name).label}</Link> / <span className="text-gray-800">{work.name}</span></nav>

    <section className="rounded-3xl bg-gradient-to-br from-red-700 to-red-500 p-6 text-white shadow-lg sm:p-8">
      <p className="text-xs font-black uppercase tracking-wider text-red-100">एक ही काम की पूरी timeline</p>
      <h1 className="mt-2 text-3xl font-black sm:text-4xl">{work.name}</h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-red-50 sm:text-base">इस exact भर्ती/परीक्षा/योजना/रिजल्ट से जुड़े उपलब्ध official updates को एक जगह रखा गया है ताकि आपको हर stage अलग-अलग खोजने न पड़ें।</p>
      <div className="mt-5 rounded-2xl bg-white/10 p-4 text-sm leading-6"><b>अभी आपको क्या करना है?</b><br />सबसे नया उपलब्ध stage <b>{current.label}</b> है। पहले उसका latest update खोलें, फिर उसी page के अंतिम official action से काम पूरा करें।</div>
      {latest && <Link href={`/news/${latest.slug}`} className="mt-4 inline-flex rounded-xl bg-white px-4 py-3 text-sm font-black text-red-700 shadow-sm hover:bg-red-50">अभी का latest update खोलें →</Link>}
    </section>

    <AdsterraNative />
    <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_IN_ARTICLE} className="min-h-[120px]" />

    <section className="mt-6 grid gap-4 sm:grid-cols-2">
      {stageList.map(stage => <div key={stage.label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"><div className="flex items-center justify-between gap-3"><h2 className="text-lg font-black">{stage.label}</h2><span className="rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-700">{stage.items.length} update</span></div><div className="mt-4 space-y-3">{stage.items.slice(0, 5).map(item => <Link key={item.id} href={`/news/${item.slug}`} className="block rounded-xl bg-gray-50 p-3 hover:bg-red-50"><p className="text-sm font-black leading-5 text-gray-900">{item.title}</p><p className="mt-1 text-xs text-gray-500">Official: {item.sourceName || "सरकारी स्रोत"}</p></Link>)}</div><Link href={stage.items[0] ? `/news/${stage.items[0].slug}` : stage.href} className="mt-4 inline-flex text-sm font-black text-red-700 hover:underline">इस stage का latest काम →</Link></div>)}
    </section>

    <AdsterraBanner />

    <section className="mt-7 rounded-2xl border border-red-100 bg-red-50 p-5"><h2 className="text-xl font-black">Official काम से पहले checklist</h2><div className="mt-3 grid gap-2 text-sm leading-6 text-gray-800 sm:grid-cols-2"><p>✓ Exact exam/recruitment/scheme name मिलाएं</p><p>✓ Year/session मिलाएं</p><p>✓ Eligibility और documents official notice से मिलाएं</p><p>✓ Application/roll number सुरक्षित रखें</p><p>✓ Deadline खुद official source पर verify करें</p><p>✓ कोई payment हो तो केवल official portal पर करें</p></div></section>

    <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-black text-gray-950">इस page का काम क्या है?</h2>
      <p className="mt-2 text-sm leading-7 text-gray-700">यह page किसी सरकारी website की जगह नहीं है। इसका काम official updates को एक exact काम के नीचे जोड़ना है। आवेदन, डाउनलोड, objection, result या payment हमेशा संबंधित official website पर ही करें।</p>
      <div className="mt-4 flex flex-wrap gap-2"><Link href="/search" className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold hover:bg-gray-50">दूसरा काम खोजें</Link><Link href={`/category/${work.categorySlug}`} className="rounded-xl bg-red-700 px-4 py-2 text-sm font-black text-white hover:bg-red-800">{getStudentContext(work.categorySlug, work.name).label} देखें</Link></div>
    </section>
  </main>;
}
