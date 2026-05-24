#!/usr/bin/env node
/**
 * One-time / repeatable converter: ivs_news provider list → frontend JSON.
 * Usage: node scripts/parse-directory-providers.mjs [inputPath] [outputPath]
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const defaultInput = join(__dirname, "../../ivs_news/ivsnews-directory-providers.txt");
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
  if (/object recognition|video analytics/i.test(value)) return "Object Recognition";
  return value;
}

function parseCategories(raw) {
  return [...new Set(raw.split(",").map(normalizeCategory).filter(Boolean))];
}

function parseProviders(text) {
  const blocks = text.split(/\n(?=\d+\.\s)/).filter((block) => /^\d+\./.test(block.trim()));
  const providers = [];

  for (const block of blocks) {
    const lines = block.trim().split("\n");
    const nameMatch = lines[0].match(/^\d+\.\s*(.+)$/);
    if (!nameMatch) continue;

    const name = nameMatch[1].trim();
    const categoryLine = lines.find((line) => line.trim().startsWith("Primary Category:"));
    const descriptionLine = lines.find((line) => line.trim().startsWith("Description:"));
    const websiteLine = lines.find((line) => line.trim().startsWith("Website:"));

    if (!categoryLine || !descriptionLine || !websiteLine) continue;

    providers.push({
      id: slugify(name),
      name,
      categories: parseCategories(categoryLine.replace("Primary Category:", "").trim()),
      description: descriptionLine.replace("Description:", "").trim(),
      website: websiteLine.replace("Website:", "").trim(),
    });
  }

  return providers;
}

const inputPath = resolve(process.argv[2] ?? defaultInput);
const outputPath = resolve(process.argv[3] ?? defaultOutput);
const source = readFileSync(inputPath, "utf8");
const providers = parseProviders(source);
const payload = {
  updatedAt: new Date().toISOString().slice(0, 10),
  providers,
};

writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
console.log(`Wrote ${providers.length} providers to ${outputPath}`);
