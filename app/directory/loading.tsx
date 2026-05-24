export default function DirectoryLoading() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="mb-8 max-w-2xl animate-pulse space-y-3">
          <div className="h-10 w-2/3 rounded-lg bg-zinc-800" />
          <div className="h-5 w-full rounded bg-zinc-800/80" />
          <div className="h-4 w-40 rounded bg-zinc-800/60" />
        </div>
        <div className="mb-6 h-12 max-w-xl animate-pulse rounded-xl bg-zinc-800" />
        <div className="flex flex-col gap-8 lg:flex-row">
          <aside className="lg:w-56">
            <div className="flex flex-wrap gap-2 lg:flex-col">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-10 w-28 animate-pulse rounded-lg bg-zinc-800"
                />
              ))}
            </div>
          </aside>
          <main className="min-w-0 flex-1">
            <div className="mb-4 h-4 w-48 animate-pulse rounded bg-zinc-800/70" />
            <ul className="grid list-none gap-4 p-0 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 9 }).map((_, index) => (
                <li
                  key={index}
                  className="h-56 animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900/60"
                />
              ))}
            </ul>
          </main>
        </div>
      </div>
    </div>
  );
}
