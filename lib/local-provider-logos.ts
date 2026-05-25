import localLogos from "../data/local-provider-logos.json";

export type LocalProviderLogos = {
  byHost: Record<string, string>;
  byName: Record<string, string>;
};

export const LOCAL_PROVIDER_LOGOS: LocalProviderLogos = localLogos;

/** Normalize `/logos/...` paths from DB or seed data. */
export function normalizeLogoSrc(
  src: string | null | undefined,
): string | null {
  const value = src?.trim();
  if (!value) return null;
  if (value.startsWith("/logos/")) return value;
  if (value.startsWith("logos/")) return `/${value}`;
  return value;
}

export function isLocalLogoSrc(src: string | null | undefined): boolean {
  const normalized = normalizeLogoSrc(src);
  return Boolean(normalized?.startsWith("/logos/"));
}

export function resolveLocalLogoForHost(
  host: string | null | undefined,
): string | null {
  if (!host) return null;
  const map = LOCAL_PROVIDER_LOGOS.byHost;
  if (map[host]) return map[host];
  const parts = host.split(".");
  for (let i = 1; i < parts.length; i++) {
    const parent = parts.slice(i).join(".");
    if (map[parent]) return map[parent];
  }
  return null;
}

export const resolveLocalLogoByHost = resolveLocalLogoForHost;

export function resolveLocalLogoForName(
  name: string | null | undefined,
): string | null {
  if (!name) return null;
  return LOCAL_PROVIDER_LOGOS.byName[name.trim().toLowerCase()] ?? null;
}

export const resolveLocalLogoByName = resolveLocalLogoForName;

function extractHostname(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return null;
  }
}

/** Prefer bundled `/public/logos` assets over remote logo URLs that often 403. */
export function preferLocalProviderLogoUrl(
  logoUrl: string | null | undefined,
  name?: string | null,
  website?: string | null,
  host?: string | null,
): string | null {
  const resolvedHost = host ?? extractHostname(website);
  const local =
    resolveLocalLogoForHost(resolvedHost) ?? resolveLocalLogoForName(name);
  if (local) return local;
  return normalizeLogoSrc(logoUrl);
}
