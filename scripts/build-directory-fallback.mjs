#!/usr/bin/env node
/**
 * Build static fallback JSON for /directory from ivs_news/providers.json.
 * Usage: node scripts/build-directory-fallback.mjs [inputPath] [outputPath]
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const defaultInput = join(__dirname, "../../ivs_news/providers.json");
const defaultOutput = join(__dirname, "../data/directory-providers.json");

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

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

const inputPath = resolve(process.argv[2] ?? defaultInput);
const outputPath = resolve(process.argv[3] ?? defaultOutput);
const payload = JSON.parse(readFileSync(inputPath, "utf8"));
const sourceProviders = payload.providers ?? payload;

const providers = sourceProviders.map((provider) => ({
  id: slugify(provider.name),
  name: provider.name,
  categories: parseCategories(provider.category),
  description: provider.description ?? "",
  website: provider.website ?? "",
  logoUrl: provider.logo_url ?? provider.logoUrl ?? null,
  thumbnailUrl: provider.thumbnail_url ?? provider.thumbnailUrl ?? null,
}));

const out = {
  updatedAt: payload.last_updated ?? new Date().toISOString().slice(0, 10),
  providers,
};

writeFileSync(outputPath, `${JSON.stringify(out, null, 2)}\n`, "utf8");
console.log(`Wrote ${providers.length} providers to ${outputPath}`);
