import Link from "next/link";

export default function NewsNotFound() {
  return (
    <main className="min-h-[60vh] bg-gray-50 px-4 py-16">
      <div className="mx-auto max-w-xl rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-100 sm:p-12">
        <div className="text-6xl">📰</div>
        <h1 className="mt-5 text-3xl font-black text-gray-950">यह खबर उपलब्ध नहीं है</h1>
        <p className="mt-3 leading-7 text-gray-600">इस खबर का लिंक पुराना हो सकता है या खबर अभी उपलब्ध नहीं है। नीचे से ताज़ा खबरें देखें।</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/" className="rounded-xl bg-red-600 px-5 py-3 text-sm font-black text-white hover:bg-red-700">होम पर जाएँ</Link>
          <Link href="/search" className="rounded-xl bg-gray-100 px-5 py-3 text-sm font-black text-gray-800 hover:bg-gray-200">खबर खोजें</Link>
        </div>
      </div>
    </main>
  );
}
