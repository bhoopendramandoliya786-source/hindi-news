'use client';

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Student Update route error:", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-16">
      <section className="mx-auto max-w-xl rounded-3xl bg-white p-7 text-center shadow-sm ring-1 ring-gray-100 sm:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-2xl">⚠️</div>
        <p className="mt-5 text-xs font-black uppercase tracking-wider text-red-600">Student Update</p>
        <h1 className="mt-2 text-2xl font-black text-gray-950">अभी यह पेज खुल नहीं पाया</h1>
        <p className="mt-3 text-sm leading-6 text-gray-600">यह अस्थायी server/database समस्या हो सकती है। दोबारा कोशिश करें; जरूरी जानकारी के लिए होम या Search से भी आगे जा सकते हैं।</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button onClick={() => reset()} className="rounded-xl bg-red-600 px-5 py-3 text-sm font-black text-white">दोबारा खोलें</button>
          <Link href="/" className="rounded-xl bg-gray-950 px-5 py-3 text-sm font-black text-white">होम</Link>
          <Link href="/search" className="rounded-xl bg-gray-100 px-5 py-3 text-sm font-black text-gray-900">Search</Link>
        </div>
      </section>
    </main>
  );
}
