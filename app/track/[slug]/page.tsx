import Link from "next/link";
import type { Metadata } from "next";
import { cache } from "react";
import { db } from "@/lib/db";
import { buildTrackKey, buildTrackLabel, getTrackTokens, scoreTrackMatch } from "@/lib/student-track";
import { AdsterraBanner, AdsterraNative } from "@/components/AdsterraAds";

interface Props { params: Promise<{ slug: string }> }
export const revalidate = 60;
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://hindi-news-omega.vercel.app").replace(/\/$/, "");

const STAGE_ORDER = ["jobs", "exams", "admit-card", "answer-key", "results", "admission", "scholarship", "documents", "schemes"];
const STAGE_LABELS: Record<string, string> = {
  jobs: "भर्ती / आवेदन",
  exams: "परीक्षा",
  "admit-card": "एडमिट कार्ड",
  "answer-key": "आंसर की / आपत्ति",
  results: "रिजल्ट / मेरिट",
  admission: "एडमिशन / काउंसलिंग",
  scholarship: "छात्रवृत्ति",
  documents: "डॉक्यूमेंट / सत्यापन",
  schemes: "योजना / लाभ",
};

const getPublished = cache(async () => db.news.findMany({
  where: { status: "PUBLISHED" },
  orderBy: { publishedAt: "desc" },
  take: 250,
  select: { id: true, slug: true, title: true, description: true, category: { select: { slug: true, name: true } }, publishedAt: true, createdAt: true, sourceName: true }
}));

function decodeSlug(slug: string) {
  try { return decodeURIComponent(slug).replace(/-/g, " ").trim().toLowerCase(); } catch { return slug.replace(/-/g, " ").trim().toLowerCase(); }
}

async function getTrack(slug: string) {
  const all = await getPublished();
  const raw = decodeSlug(slug);
  const seed = all.find((item) => buildTrackKey(item.title) === slug);
  const tokens = seed ? getTrackTokens(seed.title) : raw.split(/\s+/).filter((x) => x.length >= 3).slice(0, 6);
  const matched = all.map((item) => ({ item, score: scoreTrackMatch(item.title, tokens) }))
    .filter(({ score }) => score >= Math.max(20, tokens.length * 10))
    .sort((a, b) => b.score - a.score || new Date(b.item.publishedAt || b.item.createdAt).getTime() - new Date(a.item.publishedAt || a.item.createdAt).getTime())
    .map(({ item }) => item);
  if (!matched.length) return null;
  const label = seed ? buildTrackLabel(seed.title) : matched[0].title;
  return { label, tokens, items: matched.slice(0, 60) };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const track = await getTrack(slug);
  if (!track) return { title: "जानकारी नहीं मिली", robots: { index: false, follow: true } };
  return { title: `${track.label} — सभी अपडेट | Student Update`, description: `${track.label} से जुड़े भर्ती, परीक्षा, एडमिट कार्ड, आंसर की, रिजल्ट और दूसरे जरूरी अपडेट एक जगह।`, alternates: { canonical: `${SITE_URL}/track/${slug}` } };
}

export default async function TrackPage({ params }: Props) {
  const { slug } = await params;
  const track = await getTrack(slug);
  if (!track) return <main className="mx-auto max-w-4xl px-4 py-16"><h1 className="text-3xl font-black">यह master update नहीं मिला</h1><p className="mt-3 text-gray-600">नीचे से latest updates में जाएं या दूसरा exam/recruitment खोजें।</p><Link className="mt-6 inline-block rounded-xl bg-blue-700 px-5 py-3 font-bold text-white" href="/search">अपना काम खोजें</Link></main>;

  const grouped = new Map<string, typeof track.items>();
  for (const item of track.items) grouped.set(item.category.slug, [...(grouped.get(item.category.slug) || []), item]);

  return <main className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
    <div className="mb-6 text-sm text-gray-500"><Link href="/">होम</Link> / <span>Master Update</span></div>
    <section className="rounded-3xl border border-blue-100 bg-blue-50 p-6 sm:p-9">
      <p className="text-sm font-black uppercase tracking-wide text-blue-700">एक ही काम के सारे चरण</p>
      <h1 className="mt-2 text-3xl font-black leading-tight text-gray-950 sm:text-5xl">{track.label}</h1>
      <p className="mt-4 max-w-3xl text-base leading-8 text-gray-700 sm:text-lg">इस page पर इस exam, भर्ती, admission या scholarship से जुड़े अलग-अलग updates को एक ही जगह जोड़कर दिखाया गया है, ताकि आपको हर बार नया पेज खोजने की जरूरत न पड़े।</p>
    </section>

    <section className="mt-7 rounded-2xl border bg-white p-5 shadow-sm">
      <h2 className="text-xl font-black">अभी क्या करना है?</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {STAGE_ORDER.map((stage, i) => <div key={stage} className={`rounded-xl border p-4 ${grouped.has(stage) ? "border-blue-200 bg-blue-50" : "bg-gray-50"}`}><div className="text-xs font-black text-gray-500">चरण {i + 1}</div><div className="mt-1 font-extrabold">{STAGE_LABELS[stage]}</div><div className="mt-1 text-sm text-gray-600">{grouped.has(stage) ? `${grouped.get(stage)!.length} अपडेट` : "अभी इस चरण का update नहीं मिला"}</div></div>)}
      </div>
    </section>

    <AdsterraNative />

    <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
      <div>
        <h2 className="text-2xl font-black">सभी संबंधित अपडेट</h2>
        <div className="mt-4 space-y-3">
          {track.items.map((item) => <Link key={item.id} href={`/news/${item.slug}`} className="block rounded-2xl border bg-white p-5 transition hover:border-blue-300 hover:shadow-sm"><div className="flex flex-wrap items-center gap-2 text-xs font-bold"><span className="rounded-full bg-gray-100 px-2.5 py-1">{item.category.name}</span>{item.sourceName && <span className="text-gray-500">{item.sourceName}</span>}</div><h3 className="mt-2 text-lg font-extrabold text-gray-950">{item.title}</h3>{item.description && <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-600">{item.description}</p>}</Link>)}
        </div>
      </div>
      <aside><AdsterraBanner /><div className="mt-5 rounded-2xl border bg-gray-50 p-5"><h2 className="font-black">काम की दूसरी जगह</h2><div className="mt-3 space-y-2 text-sm font-bold"><Link className="block hover:text-blue-700" href="/category/jobs">सरकारी नौकरी</Link><Link className="block hover:text-blue-700" href="/category/results">रिजल्ट</Link><Link className="block hover:text-blue-700" href="/category/admit-card">एडमिट कार्ड</Link><Link className="block hover:text-blue-700" href="/category/scholarship">स्कॉलरशिप</Link><Link className="block hover:text-blue-700" href="/search">अपना काम खोजें</Link></div></div></aside>
    </section>
  </main>;
}
