/** Static surveillance-themed fallback when no article thumbnail or provider logo. */
export const ARTICLE_PLACEHOLDER_SRC = "/placeholders/article-surveillance.svg";

export function isBlankImageSrc(src: string | null | undefined): boolean {
  return !src?.trim();
}

export function isArticlePlaceholderSrc(src: string): boolean {
  const value = src.trim();
  return (
    value === ARTICLE_PLACEHOLDER_SRC ||
    value.endsWith("/article-surveillance.svg")
  );
}

/** Drop empty, duplicate, and placeholder-only primary URLs. */
export function isUsableArticleThumbnail(
  src: string | null | undefined,
): src is string {
  const value = src?.trim();
  if (!value) return false;
  return !isArticlePlaceholderSrc(value);
}

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

/** Article thumbnail → provider logo → static placeholder. */
export function buildArticleImageChain(
  thumbnail: string | null | undefined,
  providerLogo: string | null | undefined,
  placeholderSrc: string = ARTICLE_PLACEHOLDER_SRC,
): string[] {
  const primary = isUsableArticleThumbnail(thumbnail) ? thumbnail.trim() : null;
  const logo = providerLogo?.trim() || null;
  return uniqueImageSources(primary, logo, placeholderSrc);
}
