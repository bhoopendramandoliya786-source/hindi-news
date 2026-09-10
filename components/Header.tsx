"use client";

import Link from "next/link";
import { useState } from "react";

const navigation = [
  { name: "होम", href: "/" },
  { name: "भारत", href: "/category/india" },
  { name: "राजस्थान", href: "/category/rajasthan" },
  { name: "दुनिया", href: "/category/world" },
  { name: "बिज़नेस", href: "/category/business" },
  { name: "टेक्नोलॉजी", href: "/category/technology" },
  { name: "खेल", href: "/category/sports" },
  { name: "मनोरंजन", href: "/category/entertainment" }
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="bg-red-600 text-white">
        <div className="container flex min-h-16 items-center justify-between gap-4">
          <Link href="/" className="text-2xl font-extrabold">
            📰 Hindi News
          </Link>

          <div className="hidden items-center gap-2 sm:flex">
            <button className="rounded-md bg-white px-3 py-1.5 text-sm font-bold text-red-600">
              हिंदी
            </button>

            <button className="rounded-md border border-white px-3 py-1.5 text-sm">
              English
            </button>
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-md border border-white px-3 py-2 text-xl sm:hidden"
            aria-label="Menu"
          >
            ☰
          </button>
        </div>
      </div>

      <nav className="hidden overflow-x-auto border-b bg-white sm:block">
        <div className="container flex min-h-12 items-center gap-6 whitespace-nowrap">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-semibold text-gray-700 transition hover:text-red-600"
            >
              {item.name}
            </Link>
          ))}
        </div>
      </nav>

      {menuOpen && (
        <div className="border-b bg-white shadow-md sm:hidden">
          <div className="container flex flex-col py-2">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="border-b py-3 font-semibold text-gray-700 last:border-0"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
