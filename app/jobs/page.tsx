import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import AdSlot from "@/components/AdSense";
import { AdsterraBanner } from "@/components/AdsterraAds";

export const revalidate = 60;

const jobsSelect = {
  id: true,
  title: true,
  description: true,
  imageUrl: true,
  publishedAt: true,
  createdAt: true,
};

export const metadata = {
  title: "सरकारी नौकरी और भर्ती | हिंदी न्यूज़",
  description: "सरकारी नौकरी, भर्ती, परीक्षा, रिजल्ट और एडमिट कार्ड की ताज़ा हिंदी अपडेट।",
  alternates: { canonical: "/jobs" },
};

export default async function JobsPage() {
  const category = await db.category.findUnique({
    where: { slug: "jobs" },
    select: {
      id: true,
      name: true,
      news: {
        where: { status: "PUBLISHED" },
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        take: 50,
        select: jobsSelect,
      },
    },
  });

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-6xl px-4">
        <div className="rounded-3xl bg-gradient-to-r from-red-700 to-orange-500 p-7 text-white shadow-sm sm:p-9">
          <h1 className="text-3xl font-black sm:text-4xl">🏛️ सरकारी नौकरी और भर्ती</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-red-50 sm:text-base">
            नई भर्ती, सरकारी नौकरी, परीक्षा, रिजल्ट और एडमिट कार्ड की जरूरी जानकारी एक जगह।
          </p>
        </div>

        <AdSlot className="my-5" />

        <div className="mb-6 rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
          <h2 className="font-black text-gray-950">📢 अपनी भर्ती या coaching का promotion करें</h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            Recruitment campaign, coaching institute या career service के लिए sponsored promotion उपलब्ध है।
          </p>
          <Link
            href="/advertise"
            prefetch
            className="mt-3 inline-block rounded-xl bg-red-600 px-4 py-2 text-sm font-black text-white hover:bg-red-700"
          >
            विज्ञापन की जानकारी →
          </Link>
        </div>

        <AdsterraBanner />

        <section aria-label="सरकारी नौकरी की ताज़ा खबरें" className="mt-6">
          <div className="mb-5 flex items-center justify-between border-b-2 border-red-600 pb-2">
            <h2 className="text-xl font-black text-gray-950">📰 ताज़ा भर्ती अपडेट</h2>
            <span className="text-xs font-bold text-gray-400">नई खबरें पहले</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {category?.news.map((item, index) => (
              <article key={item.id} className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <Link href={`/news/${item.id}`} prefetch aria-label={`${item.title} पढ़ें`}>
                  <div className="relative h-48 bg-gray-100">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        priority={index < 2}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-red-50 text-sm font-black text-red-600">
                        सरकारी नौकरी
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <time className="text-xs font-semibold text-gray-400">
                      {new Date(item.publishedAt || item.createdAt).toLocaleDateString("hi-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </time>
                    <h2 className="mt-2 font-black leading-6 text-gray-950 group-hover:text-red-600">
                      {item.title}
                    </h2>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-500">
                      {item.description || item.title}
                    </p>
                    <span className="mt-3 inline-block text-xs font-black text-red-600">पूरी जानकारी पढ़ें →</span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </section>

        {(!category || category.news.length === 0) && (
          <div className="mt-6 rounded-2xl bg-white p-12 text-center text-gray-500">
            अभी कोई भर्ती खबर उपलब्ध नहीं है।
          </div>
        )}

        <AdSlot className="my-5" />
      </div>
    </main>
  );
}
