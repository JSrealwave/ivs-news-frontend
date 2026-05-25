import { PageContainer } from "../../components/PageContainer";

export default function DirectoryLoading() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200">
      <PageContainer>
        <div className="mb-10 max-w-3xl animate-pulse space-y-3 sm:mb-12">
          <div className="h-10 w-2/3 rounded-lg bg-zinc-800" />
          <div className="h-5 w-full rounded bg-zinc-800/80" />
          <div className="h-4 w-40 rounded bg-zinc-800/60" />
        </div>
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
          <aside className="space-y-6 lg:w-64 lg:shrink-0">
            <div className="h-12 animate-pulse rounded-xl bg-zinc-800" />
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
            <ul className="directory-grid">
              {Array.from({ length: 10 }).map((_, index) => (
                <li
                  key={index}
                  className="h-56 animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900/60"
                />
              ))}
            </ul>
          </main>
        </div>
      </PageContainer>
    </div>
  );
}
