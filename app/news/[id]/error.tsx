"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function NewsDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[news-detail] render error", error);
  }, [error]);

  return (
    <main className="min-h-[60vh] bg-gray-50 px-4 py-16">
      <div className="mx-auto max-w-xl rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-100 sm:p-12">
        <div className="text-6xl">📰</div>
        <h1 className="mt-5 text-3xl font-black text-gray-950">खबर खोलने में समस्या हुई</h1>
        <p className="mt-3 text-gray-600">खबर उपलब्ध है, लेकिन उसे दिखाते समय एक अस्थायी समस्या आ गई।</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-xl bg-red-600 px-5 py-3 text-sm font-black text-white hover:bg-red-700"
          >
            दोबारा कोशिश करें
          </button>
          <Link href="/" className="rounded-xl bg-gray-100 px-5 py-3 text-sm font-black text-gray-800 hover:bg-gray-200">
            होम पर जाएँ
          </Link>
        </div>
      </div>
    </main>
  );
}
