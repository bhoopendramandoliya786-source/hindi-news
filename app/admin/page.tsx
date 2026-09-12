import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session?.value) redirect("/admin/login");
  const user = await db.user.findUnique({ where: { id: session.value }, select: { id: true, name: true, email: true, role: true } });
  if (!user || user.role !== "ADMIN") redirect("/admin/login");
  const [published, drafts, breaking, original, sponsored, views, categories, recentNews] = await Promise.all([
    db.news.count({ where: { status: "PUBLISHED" } }),
    db.news.count({ where: { status: "DRAFT" } }),
    db.news.count({ where: { status: "PUBLISHED", isBreaking: true } }),
    db.news.count({ where: { status: "PUBLISHED", isOriginal: true } }),
    db.news.count({ where: { status: "PUBLISHED", isSponsored: true } }),
    db.news.aggregate({ _sum: { viewCount: true } }),
    db.category.count(),
    db.news.findMany({ orderBy: { createdAt: "desc" }, take: 8, include: { category: true }, select: { id: true, title: true, slug: true, status: true, isOriginal: true, isBreaking: true, viewCount: true, createdAt: true, category: { select: { name: true } } } }),
  ]);
  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5"><div><h1 className="text-2xl font-black text-gray-950">📰 Hindi News Admin</h1><p className="mt-1 text-sm text-gray-500">Publishing, analytics और website management</p></div><div className="flex flex-wrap gap-2"><Link href="/" className="rounded-lg bg-gray-100 px-3 py-2 text-xs font-bold text-gray-700">साइट देखें</Link><Link href="/admin/login" className="rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white">Login</Link></div></div></header>
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 p-6 text-white shadow-lg"><p className="text-sm font-semibold text-red-100">Welcome back</p><h2 className="mt-1 text-3xl font-black">{user.name || "Admin"} 👋</h2><p className="mt-2 text-sm text-red-100">{user.email}</p></div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5"><Stat label="Published" value={published} icon="🟢" /><Stat label="Drafts" value={drafts} icon="📝" /><Stat label="Original" value={original} icon="✍️" /><Stat label="Breaking" value={breaking} icon="🔴" /><Stat label="Total views" value={views._sum.viewCount || 0} icon="👁️" /></div>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4"><Action title="📰 News" text="नई खबर लिखें, edit करें, publish या draft रखें।" href="/admin/news" label="Manage News" /><Action title="📂 Categories" text={`${categories} categories active हैं।`} href="/admin/categories" label="Manage Categories" /><Action title="📈 Trending" text="Most-read articles और views देखें।" href="/trending" label="Open Trending" /><Action title="💼 Jobs" text="Government Jobs portal खोलें और promote करें।" href="/jobs" label="Open Jobs" /></div>
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200"><div className="flex items-center justify-between gap-3"><div><h3 className="text-xl font-black text-gray-950">🕒 Recent News</h3><p className="mt-1 text-xs text-gray-500">सबसे हाल में बनाई या अपडेट की गई खबरें</p></div><Link href="/admin/news" className="text-xs font-black text-red-600">सभी देखें →</Link></div><div className="mt-5 divide-y divide-gray-100">{recentNews.map((item) => <Link key={item.id} href={`/news/${item.slug}`} className="flex items-center justify-between gap-4 py-4 hover:bg-red-50/50"><div className="min-w-0"><div className="flex flex-wrap gap-2 text-[10px] font-black"><span className="rounded-full bg-gray-100 px-2 py-1 text-gray-600">{item.category.name}</span>{item.status === "DRAFT" && <span className="rounded-full bg-yellow-100 px-2 py-1 text-yellow-800">DRAFT</span>}{item.isOriginal && <span className="rounded-full bg-blue-100 px-2 py-1 text-blue-700">ORIGINAL</span>}{item.isBreaking && <span className="rounded-full bg-red-100 px-2 py-1 text-red-700">BREAKING</span>}</div><h4 className="mt-2 line-clamp-2 text-sm font-bold text-gray-900">{item.title}</h4></div><span className="shrink-0 text-xs font-bold text-gray-400">{item.viewCount.toLocaleString("hi-IN")} views</span></Link>)}{!recentNews.length && <p className="py-8 text-center text-sm text-gray-500">अभी कोई खबर नहीं है।</p>}</div></section>
          <aside className="space-y-5"><section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200"><h3 className="font-black text-gray-950">⚡ Quick Actions</h3><div className="mt-4 grid gap-2"><Link href="/admin/news" className="rounded-lg bg-red-600 px-4 py-3 text-sm font-bold text-white">➕ नई खबर publish करें</Link><Link href="/admin/news" className="rounded-lg bg-gray-100 px-4 py-3 text-sm font-bold text-gray-800">📝 Draft manage करें</Link><Link href="/advertise" className="rounded-lg bg-gray-100 px-4 py-3 text-sm font-bold text-gray-800">💰 Advertising page</Link><Link href="/contact" className="rounded-lg bg-gray-100 px-4 py-3 text-sm font-bold text-gray-800">📩 Contact / inquiries</Link></div></section><section className="rounded-2xl bg-gray-950 p-6 text-white"><h3 className="font-black">📊 Content status</h3><div className="mt-4 space-y-3 text-sm"><div className="flex justify-between"><span className="text-gray-400">Sponsored</span><strong>{sponsored}</strong></div><div className="flex justify-between"><span className="text-gray-400">Breaking</span><strong>{breaking}</strong></div><div className="flex justify-between"><span className="text-gray-400">Categories</span><strong>{categories}</strong></div></div></section></aside>
        </div>
        <div className="mt-8 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200"><h3 className="text-xl font-black text-gray-950">Account Information</h3><div className="mt-4 grid gap-3 text-sm sm:grid-cols-3"><div><span className="block text-xs font-semibold text-gray-500">Name</span><strong>{user.name || "-"}</strong></div><div><span className="block text-xs font-semibold text-gray-500">Email</span><strong>{user.email}</strong></div><div><span className="block text-xs font-semibold text-gray-500">Role</span><strong className="text-red-600">{user.role}</strong></div></div></div>
      </section>
    </main>
  );
}
function Stat({ label, value, icon }: { label: string; value: number; icon: string }) { return <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200"><div className="text-2xl">{icon}</div><div className="mt-2 text-2xl font-black text-gray-950">{value.toLocaleString("hi-IN")}</div><div className="text-xs font-bold text-gray-500">{label}</div></div>; }
function Action({ title, text, href, label }: { title: string; text: string; href: string; label: string }) { return <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200"><h3 className="font-black text-gray-950">{title}</h3><p className="mt-2 min-h-10 text-xs leading-5 text-gray-500">{text}</p><Link href={href} className="mt-4 inline-block rounded-lg bg-gray-900 px-4 py-2 text-xs font-bold text-white">{label}</Link></div>; }
