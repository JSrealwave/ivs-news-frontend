/** Static surveillance-themed fallback when no article thumbnail or provider logo. */
export const ARTICLE_PLACEHOLDER_SRC = "/placeholders/article-surveillance.svg";

export function uniqueImageSources(
  ...candidates: (string | null | undefined)[]
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const candidate of candidates) {
    const value = candidate?.trim();
    if (!value || seen.has(value)) continue;
    seen.add(value);
    out.push(value);
  }
  return out;
}
