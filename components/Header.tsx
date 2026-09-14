"use client";

import Link from "next/link";
import { useState } from "react";

const navigation = [
  { name: "होम", href: "/" },
  { name: "सरकारी नौकरी", href: "/category/jobs" },
  { name: "परीक्षा", href: "/category/exams" },
  { name: "एडमिट कार्ड", href: "/category/admit-card" },
  { name: "आंसर की", href: "/category/answer-key" },
  { name: "रिजल्ट", href: "/category/results" },
  { name: "स्कॉलरशिप", href: "/category/scholarship" },
  { name: "एडमिशन", href: "/category/admission" },
  { name: "डॉक्यूमेंट", href: "/category/documents" },
  { name: "सरकारी योजनाएं", href: "/category/schemes" },
  { name: "करंट अफेयर्स", href: "/category/current-affairs" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="bg-red-700 text-white">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4">
          <Link href="/" className="shrink-0 text-xl font-black sm:text-2xl">🎓 Student Update</Link>
          <form action="/search" className="hidden max-w-xl flex-1 sm:flex">
            <input name="q" placeholder="नौकरी, परीक्षा, रिजल्ट या स्कॉलरशिप खोजें..." className="w-full rounded-l-lg border-0 px-4 py-2 text-sm text-gray-900 outline-none" />
            <button className="rounded-r-lg bg-gray-950 px-4 text-sm font-bold">काम खोजें</button>
          </form>
          <div className="hidden items-center gap-2 sm:flex">
            <Link href="/search" className="rounded-lg border border-white px-3 py-2 text-sm font-bold">🔎</Link>
            <Link href="/category/jobs" className="rounded-lg bg-white px-3 py-2 text-sm font-bold text-red-700">नौकरी</Link>
          </div>
          <button onClick={() => setMenuOpen(!menuOpen)} className="rounded-md border border-white px-3 py-2 text-xl sm:hidden" aria-label="Menu">☰</button>
        </div>
      </div>
      <nav className="hidden overflow-x-auto border-b bg-white sm:block">
        <div className="mx-auto flex min-h-12 max-w-7xl items-center gap-6 px-4 whitespace-nowrap">
          {navigation.map((item) => <Link key={item.href} href={item.href} className="text-sm font-semibold text-gray-700 hover:text-red-700">{item.name}</Link>)}
        </div>
      </nav>
      {menuOpen && <div className="border-b bg-white shadow-md sm:hidden"><div className="px-4 py-2">{navigation.map((item) => <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="block border-b py-3 font-semibold text-gray-700 last:border-0">{item.name}</Link>)}<Link href="/search" onClick={() => setMenuOpen(false)} className="block py-3 font-semibold text-red-700">🔎 अपना काम खोजें</Link></div></div>}
    </header>
  );
}
