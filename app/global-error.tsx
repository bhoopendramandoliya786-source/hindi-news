'use client';

import { useEffect } from "react";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Keep production failures diagnosable without exposing server details.
    console.error("Student Update global error");
  }, []);

  return (
    <html lang="hi">
      <body className="bg-gray-50 text-gray-950">
        <main className="min-h-screen px-4 py-16">
          <section className="mx-auto max-w-xl rounded-3xl bg-white p-7 text-center shadow-sm ring-1 ring-gray-100 sm:p-10">
            <div className="text-3xl">⚠️</div>
            <p className="mt-4 text-xs font-black uppercase tracking-wider text-red-600">Student Update</p>
            <h1 className="mt-2 text-2xl font-black">अभी server व्यस्त है</h1>
            <p className="mt-3 text-sm leading-6 text-gray-600">पेज को दोबारा खोलें। आपकी जानकारी सुरक्षित है और जरूरी काम के लिए कुछ सेकंड बाद फिर कोशिश की जा सकती है।</p>
            <button onClick={() => reset()} className="mt-6 rounded-xl bg-red-600 px-5 py-3 text-sm font-black text-white">दोबारा कोशिश करें</button>
          </section>
        </main>
      </body>
    </html>
  );
}
