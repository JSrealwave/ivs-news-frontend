import {
  ARTICLE_PLACEHOLDER_SRC,
  buildArticleImageChain,
} from "./image-placeholders";
import {
  LOCAL_PROVIDER_LOGOS,
  preferLocalProviderLogoUrl,
  resolveLocalLogoByHost,
} from "./local-provider-logos";

export {
  ARTICLE_PLACEHOLDER_SRC,
  buildArticleImageChain,
  uniqueImageSources,
} from "./image-placeholders";
export { isLocalLogoSrc, normalizeLogoSrc } from "./local-provider-logos";

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

export type ProviderLogoLookup = Map<string, string>;

export function extractHostname(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return null;
  }
}

function normalizeProviderLogo(
  provider: { name: string; website?: string | null; logoUrl?: string | null },
): string | null {
  const host = extractHostname(provider.website);
  return preferLocalProviderLogoUrl(
    provider.logoUrl,
    provider.name,
    provider.website,
    host,
  );
}

export function buildProviderLogoLookup(
  providers: { name: string; website?: string | null; logoUrl?: string | null }[],
): ProviderLogoLookup {
  const map = new Map<string, string>(
    Object.entries(LOCAL_PROVIDER_LOGOS.byName),
  );
  for (const provider of providers) {
    const logo = normalizeProviderLogo(provider);
    if (!logo) continue;
    map.set(provider.name.toLowerCase(), logo);
  }
  return map;
}

export function buildProviderLogoByName(
  providers: { name: string; logoUrl?: string | null }[],
): Record<string, string> {
  return Object.fromEntries(buildProviderLogoLookup(providers));
}

export function buildProviderLogoByHost(
  providers: {
    name?: string;
    website?: string | null;
    logoUrl?: string | null;
  }[],
): Record<string, string> {
  const map: Record<string, string> = { ...LOCAL_PROVIDER_LOGOS.byHost };
  for (const provider of providers) {
    const host = extractHostname(provider.website);
    const logo = normalizeProviderLogo({
      name: provider.name ?? "",
      website: provider.website,
      logoUrl: provider.logoUrl,
    });
    if (!logo || !host) continue;
    map[host] = logo;
  }
  return map;
}

export function resolveProviderLogoForUrl(
  articleUrl: string | null | undefined,
  logoByHost: Record<string, string>,
): string | null {
  const host = extractHostname(articleUrl);
  if (!host) return null;

  const local = resolveLocalLogoByHost(host);
  if (local) return local;

  if (logoByHost[host]) return logoByHost[host];
  const parts = host.split(".");
  for (let i = 1; i < parts.length; i++) {
    const parent = parts.slice(i).join(".");
    if (logoByHost[parent]) return logoByHost[parent];
  }
  return null;
}

export function findProviderLogoForArticle(
  article: {
    title: string;
    summary: string | null;
    url?: string | null;
    entities?: string[] | null;
  },
  logosByName: ProviderLogoLookup,
  logosByHost: Record<string, string> = {},
): string | null {
  const fromHost = resolveProviderLogoForUrl(article.url, logosByHost);
  if (fromHost) {
    return preferLocalProviderLogoUrl(fromHost, null, article.url, null);
  }

  if (logosByName.size === 0) return null;

  const entities = article.entities ?? [];
  for (const entity of entities) {
    const key = entity.trim().toLowerCase();
    const direct = logosByName.get(key);
    if (direct) {
      return preferLocalProviderLogoUrl(direct, entity, article.url, null);
    }
    for (const [name, logo] of logosByName) {
      if (key.includes(name) || name.includes(key)) {
        return preferLocalProviderLogoUrl(logo, name, article.url, null);
      }
    }
  }

  const haystack = `${article.title} ${article.summary ?? ""}`.toLowerCase();
  let best: { name: string; logo: string } | null = null;
  for (const [name, logo] of logosByName) {
    if (!haystack.includes(name)) continue;
    if (!best || name.length > best.name.length) {
      best = { name, logo };
    }
  }
  const logo = best?.logo ?? null;
  return logo
    ? preferLocalProviderLogoUrl(logo, best?.name ?? null, article.url, null)
    : null;
}

export function resolveArticleProviderLogo(
  article: {
    title: string;
    summary: string | null;
    url?: string | null;
    entities?: string[] | null;
  },
  logosByHost: Record<string, string> = {},
  logosByName: Record<string, string> = {},
): string | null {
  return findProviderLogoForArticle(
    article,
    new Map(Object.entries(logosByName)),
    logosByHost,
  );
}

export function resolveArticleImageSources(
  article: {
    image: string | null;
    title: string;
    summary: string | null;
    url?: string | null;
    entities?: string[] | null;
  },
  logosByName?: ProviderLogoLookup,
  logosByHost: Record<string, string> = {},
): string[] {
  const providerLogo = logosByName
    ? findProviderLogoForArticle(article, logosByName, logosByHost)
    : resolveProviderLogoForUrl(article.url, logosByHost);
  return buildArticleImageChain(
    article.image,
    providerLogo,
    ARTICLE_PLACEHOLDER_SRC,
  );
}
