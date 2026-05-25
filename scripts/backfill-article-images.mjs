#!/usr/bin/env node
/**
 * Backfill missing ivs_articles.image from provider logos and optional og:image.
 *
 * Resolution order per article:
 *   1. Provider logo (Supabase logo_url, then data/local-provider-logos.json)
 *   2. og:image from article URL (--fetch-og only)
 *
 * Requires service role (writes to ivs_articles):
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Usage:
 *   npm run articles:backfill-images:dry-run
 *   npm run articles:backfill-images:dry-run -- --fetch-og --limit=20
 *   npm run articles:backfill-images
 *   node scripts/backfill-article-images.mjs --dry-run --fetch-og --limit=10
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dryRun = process.argv.includes("--dry-run");
const fetchOg = process.argv.includes("--fetch-og");
const limitArg = process.argv.find((a) => a.startsWith("--limit="));
const limit = limitArg ? Number.parseInt(limitArg.split("=")[1], 10) : null;

const PLACEHOLDER_SUFFIX = "/article-surveillance.svg";
const OG_FETCH_TIMEOUT_MS = 12_000;
const OG_DELAY_MS = 400;

function loadEnvFile(path) {
  try {
    const text = readFileSync(path, "utf8");
    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  } catch {
    // optional
  }
}

loadEnvFile(join(__dirname, "../../ivs_news/.env"));
loadEnvFile(join(__dirname, "../.env.local"));
loadEnvFile(join(__dirname, "../.env"));

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Set them in the environment or ivs_news/.env.",
  );
  process.exit(1);
}

const localLogos = JSON.parse(
  readFileSync(join(__dirname, "../data/local-provider-logos.json"), "utf8"),
);

function extractHostname(url) {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return null;
  }
}

function normalizeLogoSrc(src) {
  const value = src?.trim();
  if (!value) return null;
  if (value.startsWith("/logos/")) return value;
  if (value.startsWith("logos/")) return `/${value}`;
  return value;
}

function resolveLocalLogoByHost(host) {
  if (!host) return null;
  const map = localLogos.byHost;
  if (map[host]) return map[host];
  const parts = host.split(".");
  for (let i = 1; i < parts.length; i++) {
    const parent = parts.slice(i).join(".");
    if (map[parent]) return map[parent];
  }
  return null;
}

function preferLocalProviderLogo(logoUrl, name, website) {
  const host = extractHostname(website);
  return (
    resolveLocalLogoByHost(host) ??
    localLogos.byName[name?.trim().toLowerCase()] ??
    normalizeLogoSrc(logoUrl)
  );
}

function buildLogoByHost(providers) {
  const map = { ...localLogos.byHost };
  for (const row of providers) {
    const logo = preferLocalProviderLogo(row.logo_url, row.name, row.website);
    const host = extractHostname(row.website);
    if (host && logo) map[host] = logo;
  }
  return map;
}

function resolveLogoFromHost(articleUrl, logoByHost) {
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

function isMissingImage(image) {
  const value = image?.trim();
  if (!value) return true;
  if (value.endsWith(PLACEHOLDER_SUFFIX)) return true;
  return false;
}

function parseOgImage(html, pageUrl) {
  const patterns = [
    /<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image(?::secure_url)?["']/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      try {
        return new URL(match[1].trim(), pageUrl).href;
      } catch {
        return match[1].trim();
      }
    }
  }
  return null;
}

async function fetchOgImage(articleUrl) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), OG_FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(articleUrl, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; IVSNewsBackfill/1.0; +https://ivs.news)",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    if (!response.ok) return null;
    const html = await response.text();
    return parseOgImage(html.slice(0, 250_000), articleUrl);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const { data: providers, error: providersError } = await supabase
  .from("providers")
  .select("name,website,logo_url")
  .eq("status", "active");

if (providersError) {
  console.error("Failed to load providers:", providersError.message);
  process.exit(1);
}

const logoByHost = buildLogoByHost(providers ?? []);

const { data: articles, error: articlesError } = await supabase
  .from("ivs_articles")
  .select("id,url,image,title")
  .order("created_at", { ascending: false });

if (articlesError) {
  console.error("Failed to load articles:", articlesError.message);
  process.exit(1);
}

const candidates = (articles ?? []).filter((a) => isMissingImage(a.image));
const toProcess = limit && limit > 0 ? candidates.slice(0, limit) : candidates;

console.log(
  `Found ${candidates.length} article(s) without a usable image` +
    (limit ? `; processing ${toProcess.length} (--limit=${limit})` : "") +
    (fetchOg ? "; og:image fetch enabled" : "") +
    (dryRun ? " [DRY RUN]" : "") +
    ".\n",
);

let updated = 0;
let skipped = 0;
let ogFetched = 0;

for (const article of toProcess) {
  let nextImage = resolveLogoFromHost(article.url, logoByHost);
  let source = nextImage ? "provider-logo" : null;

  if (!nextImage && fetchOg && article.url) {
    nextImage = await fetchOgImage(article.url);
    if (nextImage) {
      source = "og:image";
      ogFetched++;
    }
    await sleep(OG_DELAY_MS);
  }

  if (!nextImage) {
    skipped++;
    continue;
  }

  if (dryRun) {
    console.log(
      `[dry-run] ${article.id} ← ${nextImage} (${source}) — ${article.title?.slice(0, 56) ?? "untitled"}`,
    );
    updated++;
    continue;
  }

  const { error } = await supabase
    .from("ivs_articles")
    .update({ image: nextImage })
    .eq("id", article.id);

  if (error) {
    console.error(`Update failed for ${article.id}:`, error.message);
    continue;
  }

  console.log(
    `Updated ${article.id} (${source}) — ${article.title?.slice(0, 56) ?? "untitled"}`,
  );
  updated++;
}

console.log(
  `\n${dryRun ? "Would update" : "Updated"} ${updated} article(s); skipped ${skipped}.` +
    (fetchOg ? ` og:image resolved: ${ogFetched}.` : ""),
);
