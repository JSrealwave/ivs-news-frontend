#!/usr/bin/env node
/**
 * Backfill missing ivs_articles.image using provider logos (URL host match).
 *
 * Requires service role (writes to ivs_articles):
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Usage:
 *   node scripts/backfill-article-images.mjs
 *   node scripts/backfill-article-images.mjs --dry-run
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dryRun = process.argv.includes("--dry-run");

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
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Set them in the environment or ivs_news/.env."
  );
  process.exit(1);
}

function extractHostname(url) {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return null;
  }
}

function buildLogoByHost(providers) {
  const map = {};
  for (const row of providers) {
    const logo = row.logo_url?.trim();
    if (!logo) continue;
    const host = extractHostname(row.website);
    if (host) map[host] = logo;
  }
  return map;
}

function resolveLogo(articleUrl, logoByHost) {
  const host = extractHostname(articleUrl);
  if (!host) return null;
  if (logoByHost[host]) return logoByHost[host];
  const parts = host.split(".");
  for (let i = 1; i < parts.length; i++) {
    const parent = parts.slice(i).join(".");
    if (logoByHost[parent]) return logoByHost[parent];
  }
  return null;
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
  .or("image.is.null,image.eq.");

if (articlesError) {
  console.error("Failed to load articles:", articlesError.message);
  process.exit(1);
}

let updated = 0;
let skipped = 0;

for (const article of articles ?? []) {
  if (article.image?.trim()) {
    skipped++;
    continue;
  }
  const logo = resolveLogo(article.url, logoByHost);
  if (!logo) {
    skipped++;
    continue;
  }
  if (dryRun) {
    console.log(`[dry-run] ${article.id} ← ${logo}`);
    updated++;
    continue;
  }
  const { error } = await supabase
    .from("ivs_articles")
    .update({ image: logo })
    .eq("id", article.id);
  if (error) {
    console.error(`Update failed for ${article.id}:`, error.message);
    continue;
  }
  console.log(`Updated ${article.id} (${article.title?.slice(0, 48) ?? "untitled"})`);
  updated++;
}

console.log(
  `${dryRun ? "Would update" : "Updated"} ${updated} article(s); skipped ${skipped}.`
);
