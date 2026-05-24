#!/usr/bin/env node
/**
 * Seed Supabase `providers` from ivs_news/providers.json (upsert on name).
 *
 * Env (from ivs_news/.env or shell):
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Usage:
 *   node scripts/seed-providers.mjs
 *   node scripts/seed-providers.mjs /path/to/providers.json
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const defaultInput = join(__dirname, "../../ivs_news/providers.json");

function normalizeCategory(raw) {
  const value = raw.trim();
  if (!value) return null;
  if (/vms|video management/i.test(value)) return "VMS";
  if (/facial/i.test(value)) return "Facial Recognition";
  if (/lpr|ocr/i.test(value)) return "LPR/OCR";
  if (/edge ai/i.test(value)) return "Edge AI Hardware";
  if (
    /object recognition|video analytics|behavior analytics|anomaly detection/i.test(
      value
    )
  ) {
    return "Object Recognition";
  }
  return value;
}

function parseCategories(raw) {
  if (!raw || typeof raw !== "string") return [];
  return [...new Set(raw.split(",").map(normalizeCategory).filter(Boolean))];
}

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
    // optional .env
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

const inputPath = resolve(process.argv[2] ?? defaultInput);
const payload = JSON.parse(readFileSync(inputPath, "utf8"));
const sourceProviders = payload.providers ?? payload;

if (!Array.isArray(sourceProviders)) {
  console.error("Expected providers array in JSON.");
  process.exit(1);
}

const rows = sourceProviders.map((provider) => ({
  name: provider.name,
  category: parseCategories(provider.category),
  description: provider.description ?? null,
  website: provider.website ?? null,
  logo_url: provider.logo_url ?? provider.logoUrl ?? null,
  thumbnail_url: provider.thumbnail_url ?? provider.thumbnailUrl ?? null,
  status: provider.status ?? "active",
}));

const supabase = createClient(supabaseUrl, serviceRoleKey);

const { data, error } = await supabase
  .from("providers")
  .upsert(rows, { onConflict: "name" })
  .select("id,name");

if (error) {
  console.error("Upsert failed:", error.message);
  process.exit(1);
}

console.log(`Upserted ${data?.length ?? rows.length} providers from ${inputPath}`);
