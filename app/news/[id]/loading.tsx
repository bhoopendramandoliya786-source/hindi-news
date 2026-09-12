export default function NewsLoading() {
  return (
    <main className="min-h-screen bg-gray-50 py-6 md:py-10" aria-busy="true" aria-label="खबर खुल रही है">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-5 h-4 w-48 animate-pulse rounded bg-gray-200" />
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-8">
            <div className="h-6 w-32 animate-pulse rounded-full bg-gray-200" />
            <div className="mt-5 h-10 w-full animate-pulse rounded bg-gray-200" />
            <div className="mt-3 h-10 w-4/5 animate-pulse rounded bg-gray-200" />
            <div className="mt-6 h-[280px] animate-pulse rounded-2xl bg-gray-200 sm:h-[420px]" />
            <div className="mt-8 space-y-4">
              <div className="h-5 w-full animate-pulse rounded bg-gray-200" />
              <div className="h-5 w-11/12 animate-pulse rounded bg-gray-200" />
              <div className="h-5 w-4/5 animate-pulse rounded bg-gray-200" />
            </div>
          </article>
          <aside className="hidden space-y-4 lg:block">
            <div className="h-32 animate-pulse rounded-2xl bg-gray-200" />
            <div className="h-64 animate-pulse rounded-2xl bg-gray-200" />
          </aside>
        </div>
      </div>
    </main>
  );
}
