import Link from "next/link";
import { cache } from "react";
import { db } from "@/lib/db";
import { AdsterraBanner, AdsterraNative } from "@/components/AdsterraAds";
import { getStudentEntityKey, getStudentEntityName } from "@/lib/student-entity";

interface Props { params: Promise<{ key: string }> }
export const revalidate = 60;
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://hindi-news-omega.vercel.app").replace(/\/$/, "");

const CATEGORY_SLUGS = [
  "jobs", "exams", "admit-card", "answer-key", "results", "scholarship",
  "admission", "documents", "schemes", "citizen-services", "education",
  "current-affairs", "student-updates",
] as const;

type Item = {
  id: string; slug: string; title: string; description: string | null;
  sourceName: string | null; sourceUrl: string | null; publishedAt: Date | null;
};

const getItems = cache(async (categorySlug: string) => {
  const category = await db.category.findUnique({
    where: { slug: categorySlug },
    select: { name: true, slug: true, news: {
      where: { status: "PUBLISHED" }, orderBy: { publishedAt: "desc" }, take: 100,
      select: { id: true, slug: true, title: true, description: true, sourceName: true, sourceUrl: true, publishedAt: true },
    } },
  });
  return category;
});

function getCategoryFromKey(key: string) {
  return CATEGORY_SLUGS.find((slug) => key.startsWith(`${slug}-`)) || null;
}

function stage(category: string) {
  if (["jobs", "exams", "admit-card", "answer-key", "results"].includes(category)) {
    return [
      ["01", "Notification / आवेदन", "भर्ती या परीक्षा की मूल notification, eligibility और application status देखें।"],
      ["02", "Admit Card / परीक्षा", "Admit Card, exam date, city और reporting instructions जांचें।"],
      ["03", "Answer Key / Objection", "परीक्षा के बाद answer key और objection window देखें, यदि लागू हो।"],
      ["04", "Result / Merit", "Result, score, cutoff, merit या shortlist का official update देखें।"],
      ["05", "अगला चयन चरण", "DV, counselling, preference, fee, medical या appointment जैसे अगले official चरण देखें।"],
    ];
  }
  if (category === "scholarship") return [["01", "Scheme पहचानें", "Academic session, scheme, eligibility और OTR requirement verify करें।"], ["02", "Application", "Documents तैयार करके scholarship application भरें और details जांचें।"], ["03", "Verification", "Institute/department verification और correction/status देखें।"], ["04", "Payment / Status", "Sanction, payment और application status की official स्थिति जांचें।"]];
  if (category === "admission") return [["01", "Course / Eligibility", "Course, institute और academic session की eligibility समझें।"], ["02", "Application", "Form, documents और fee की official requirement देखें।"], ["03", "Merit / Counselling", "Merit list, counselling, choice filling या seat allotment देखें।"], ["04", "Final Admission", "Verification, fee payment और final admission instructions पूरा करें।"]];
  return [["01", "क्या है?", "Update किस department, service, scheme या education process से जुड़ा है, पहले पहचानें।"], ["02", "किसके लिए?", "Eligibility, class/course/category और लागू शर्तें official source से verify करें।"], ["03", "क्या चाहिए?", "Documents, registration/OTR और application requirements तैयार करें।"], ["04", "अब क्या करें?", "यदि action जरूरी है तो अंतिम official link से वही काम पूरा करें।"]];
}

export async function generateMetadata({ params }: Props) {
  const { key } = await params;
  const categorySlug = getCategoryFromKey(key);
  const name = getStudentEntityName(key.replace(`${categorySlug || "student-updates"}-`, "").replace(/-/g, " "));
  return { title: `${name} | पूरा काम, सभी अपडेट`, description: `${name} से जुड़े आवेदन, एडमिट कार्ड, आंसर की, रिजल्ट और अगले official steps एक जगह।`, alternates: { canonical: `${SITE_URL}/student/${key}` } };
}

export default async function StudentEntityPage({ params }: Props) {
  const { key } = await params;
  const categorySlug = getCategoryFromKey(key);
  if (!categorySlug) return <main className="mx-auto max-w-3xl px-4 py-16"><h1 className="text-2xl font-bold">यह student update नहीं मिला</h1><Link className="mt-5 inline-block underline" href="/search">अपना काम खोजें</Link></main>;

  const category = await getItems(categorySlug);
  if (!category) return <main className="mx-auto max-w-3xl px-4 py-16"><h1 className="text-2xl font-bold">जानकारी उपलब्ध नहीं है</h1></main>;

  const items = (category.news as Item[]).filter((item) => getStudentEntityKey(item.title, categorySlug) === key);
  const name = items.length ? getStudentEntityName(items[0].title) : key.slice(categorySlug.length + 1).replace(/-/g, " ");
  if (!items.length) return <main className="mx-auto max-w-3xl px-4 py-16"><p className="text-sm text-slate-500">Student update</p><h1 className="mt-2 text-3xl font-bold">{name}</h1><p className="mt-4 text-slate-600">इस नाम से अभी कोई प्रकाशित update नहीं मिला।</p><Link className="mt-5 inline-block underline" href={`/category/${categorySlug}`}>संबंधित सभी अपडेट देखें</Link></main>;

  const steps = stage(categorySlug);
  const latest = items[0];
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <nav className="text-sm text-slate-500"><Link href="/">Home</Link> / <Link href={`/category/${categorySlug}`}>{category.name}</Link> / {name}</nav>
      <section className="mt-5 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-blue-700">{category.name} • Master Update</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">{name}</h1>
            <p className="mt-3 text-slate-600">इस page पर इसी भर्ती/परीक्षा/योजना/एडमिशन से जुड़े अलग-अलग चरण एक जगह मिलेंगे। हर update पढ़कर अंत में अपना official अगला काम करें।</p>
            <div className="mt-5 rounded-2xl bg-slate-50 p-4"><p className="font-bold">अभी सबसे पहले क्या देखें?</p><p className="mt-1 text-sm text-slate-600">सबसे नया update नीचे है। अगर वह आपकी स्थिति से जुड़ा है तो उसे खोलें; पुराने चरण भी इसी page पर मिलेंगे।</p><Link href={`/news/${latest.slug}`} className="mt-3 inline-block rounded-xl bg-blue-700 px-4 py-2 font-semibold text-white">नवीनतम अपडेट खोलें</Link></div>
          </div>

          <div className="mt-6 rounded-3xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">पूरा काम किस क्रम में है?</h2>
            <div className="mt-4 grid gap-3">
              {steps.map(([n, title, text]) => <div key={n} className="flex gap-4 rounded-2xl border p-4"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blue-50 font-bold text-blue-700">{n}</span><div><h3 className="font-bold">{title}</h3><p className="mt-1 text-sm text-slate-600">{text}</p></div></div>)}
            </div>
          </div>

          <AdsterraNative />
          <div className="mt-6 rounded-3xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">इससे जुड़े सभी updates</h2>
            <div className="mt-4 space-y-3">
              {items.map((item) => <article key={item.id} className="rounded-2xl border p-4"><p className="text-xs font-semibold text-slate-500">{item.publishedAt ? new Date(item.publishedAt).toLocaleDateString("hi-IN") : "Update"}</p><h3 className="mt-1 text-lg font-bold"><Link className="hover:underline" href={`/news/${item.slug}`}>{item.title}</Link></h3>{item.description && <p className="mt-1 text-sm text-slate-600">{item.description}</p>}{item.sourceUrl && <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm font-semibold text-red-700">Official source →</a>}</article>)}
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-6"><h2 className="text-lg font-bold text-red-900">अंतिम कदम</h2><p className="mt-1 text-sm text-red-800">पहले ऊपर की जानकारी पढ़ें। फिर जिस update में आपका काम है उसे खोलें और उसके सबसे नीचे दिए official action से आवेदन/डाउनलोड/रिजल्ट/objection करें।</p><Link href={`/news/${latest.slug}`} className="mt-4 inline-block rounded-xl bg-red-700 px-5 py-3 font-bold text-white">Official काम के लिए latest guide खोलें</Link></div>
        </div>
        <aside><div className="sticky top-24"><AdsterraBanner /></div></aside>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "CollectionPage", name, url: `${SITE_URL}/student/${key}`, mainEntityOfPage: `${SITE_URL}/student/${key}` }) }} />
    </main>
  );
}
