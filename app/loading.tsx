export default function Loading() {
  return (
    <main className="min-h-screen bg-gray-50 py-6 sm:py-8" aria-busy="true" aria-label="पेज लोड हो रहा है">
      <div className="mx-auto max-w-7xl space-y-5 px-4">
        <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
        <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
          <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
          <div className="mt-4 h-9 w-2/3 animate-pulse rounded bg-gray-200" />
          <div className="mt-3 h-4 w-full animate-pulse rounded bg-gray-100" />
          <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-gray-100" />
        </section>
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <div key={item} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
              <div className="mt-4 h-5 w-full animate-pulse rounded bg-gray-100" />
              <div className="mt-2 h-5 w-4/5 animate-pulse rounded bg-gray-100" />
              <div className="mt-5 h-9 w-28 animate-pulse rounded bg-gray-200" />
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
