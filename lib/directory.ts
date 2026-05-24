export type DirectoryProvider = {
  id: string;
  name: string;
  categories: string[];
  description: string;
  website: string;
  logoUrl?: string | null;
  thumbnailUrl?: string | null;
};

export type DirectoryData = {
  updatedAt: string;
  providers: DirectoryProvider[];
};

/** Sidebar filter labels (stable order). */
export const DIRECTORY_CATEGORIES = [
  "All",
  "Facial Recognition",
  "LPR/OCR",
  "Object Recognition",
  "VMS",
  "Edge AI Hardware",
] as const;

export type DirectoryCategoryFilter = (typeof DIRECTORY_CATEGORIES)[number];

export function providerMatchesCategory(
  provider: DirectoryProvider,
  filter: DirectoryCategoryFilter
): boolean {
  if (filter === "All") return true;
  return provider.categories.includes(filter);
}

export function providerMatchesSearch(
  provider: DirectoryProvider,
  query: string
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    provider.name,
    provider.description,
    ...provider.categories,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}
