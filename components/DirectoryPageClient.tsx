"use client";

import { Search } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";

import {
  DIRECTORY_CATEGORIES,
  type DirectoryCategoryFilter,
  type DirectoryProvider,
  providerMatchesCategory,
  providerMatchesSearch,
} from "../lib/directory";
import ProviderCard from "./ProviderCard";

export default function DirectoryPageClient({
  providers,
  updatedAt,
  dataSource = "static",
  loadError = null,
}: {
  providers: DirectoryProvider[];
  updatedAt: string;
  dataSource?: "supabase" | "static";
  loadError?: string | null;
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<DirectoryCategoryFilter>("All");
  const deferredSearch = useDeferredValue(search);

  const filtered = useMemo(() => {
    return providers.filter(
      (provider) =>
        providerMatchesCategory(provider, category) &&
        providerMatchesSearch(provider, deferredSearch)
    );
  }, [providers, category, deferredSearch]);

  const isFiltering = deferredSearch !== search;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="mb-8 max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Video Analytics Directory
          </h1>
          <p className="mt-3 text-base text-zinc-400 sm:text-lg">
            Curated providers across facial recognition, LPR, object analytics,
            VMS, and edge AI hardware for the intelligent video surveillance
            ecosystem.
          </p>
          <p className="mt-2 text-xs text-zinc-500">
            Last updated{" "}
            {new Date(updatedAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
            {dataSource === "supabase" ? " · Live from database" : null}
          </p>
        </div>

        {loadError ? (
          <div
            className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100"
            role="status"
          >
            {loadError}
          </div>
        ) : null}

        <div className="mb-6">
          <label htmlFor="directory-search" className="sr-only">
            Search providers
          </label>
          <div className="relative max-w-xl">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-zinc-500"
              aria-hidden
            />
            <input
              id="directory-search"
              type="search"
              placeholder="Search by name, category, or description…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-3 pl-11 pr-4 text-sm text-zinc-100 placeholder:text-zinc-500 focus-visible:border-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-blue-500/40"
            />
          </div>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
          <aside className="lg:w-56 lg:shrink-0">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Categories
            </h2>
            <nav
              aria-label="Filter by category"
              className="flex flex-wrap gap-2 lg:flex-col lg:gap-1"
            >
              {DIRECTORY_CATEGORIES.map((cat) => {
                const selected = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    aria-pressed={selected}
                    className={[
                      "rounded-lg px-3 py-2 text-left text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400",
                      selected
                        ? "bg-white text-zinc-950"
                        : "text-zinc-300 hover:bg-zinc-800",
                    ].join(" ")}
                  >
                    {cat}
                  </button>
                );
              })}
            </nav>
          </aside>

          <main className="min-w-0 flex-1">
            {isFiltering && (
              <p className="mb-4 text-sm text-zinc-500" role="status">
                Updating results…
              </p>
            )}

            {filtered.length === 0 ? (
              <div
                className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/40 px-6 py-16 text-center"
                role="status"
              >
                <p className="text-lg font-medium text-zinc-200">
                  No providers match your filters
                </p>
                <p className="mt-2 text-sm text-zinc-500">
                  Try a different search term or category.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setCategory("All");
                  }}
                  className="mt-6 rounded-lg border border-zinc-600 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                <p className="mb-4 text-sm text-zinc-500">
                  Showing {filtered.length} of {providers.length} providers
                </p>
                <ul className="grid list-none gap-4 p-0 sm:grid-cols-2 xl:grid-cols-3">
                  {filtered.map((provider) => (
                    <li key={provider.id}>
                      <ProviderCard provider={provider} />
                    </li>
                  ))}
                </ul>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
