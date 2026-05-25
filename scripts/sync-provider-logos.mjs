#!/usr/bin/env node
/**
 * Sync provider logo paths from public/logos/ into:
 *   - data/local-provider-logos.json
 *   - data/directory-providers.json (logoUrl)
 *   - ../ivs_news/providers.json (logo_url, full provider list)
 *
 * Usage: node scripts/sync-provider-logos.mjs
 */

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const logosDir = join(root, "public/logos");
const directoryPath = join(root, "data/directory-providers.json");
const localLogosPath = join(root, "data/local-provider-logos.json");
const ivsNewsPath = join(root, "../ivs_news/providers.json");

/** Provider id → logo filename (when id slug does not match the file). */
const LOGO_FILE_BY_ID = {
  "oosto-formerly-anyvision": "oosto.jpeg",
  "platesmart-technologies": "platesmart.png",
  "milestone-systems": "milestone.png",
  "genetec-inc": "genetec.jpeg",
  "avigilon-motorola-solutions": "avigilon.png",
  "rhombus-systems": "rhombus.png",
  "eagle-eye-networks": "eagle-eye.png",
  "axis-communications": "axis.png",
  "hikvision-digital-technology": "hikvision.png",
  "dahua-technology": "dahua.png",
  "ambient-ai": "ambient.jpeg", // file: public/logos/ambient.jpeg
  "evolv-technology": "evolv.png",
  "vivacity-labs": "viva_city.jpeg",
  "network-optix": "network_optix.png",
  "nec-corporation": "nec.png",
  "megvii-face": "megvii.png",
  "corsight-ai": "corsight_ai.png",
  "vigilant-solutions-motorola": "vigilant.jpeg",
  "kapsch-trafficcom": "kapsch.png",
  "ndi-recognition-systems": "NDI.jpeg",
  "google-coral": "coral.png",
  "agent-video-intelligence-agent-vi": "agentvi.png",
  "puretech-systems": "puretech.png",
  "digital-barriers": "digital_barriers.png",
  seequestor: "seequestor.png",
  "vca-technology": "vca.jpeg",
  "clearview-ai": "clearview.png",
};

function extractHost(website) {
  if (!website) return null;
  try {
    return new URL(website).hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return null;
  }
}

function resolveLogoFile(provider, logoFiles) {
  const byId = LOGO_FILE_BY_ID[provider.id];
  if (byId && logoFiles.includes(byId)) return byId;

  const slug = provider.id.replace(/-/g, "_");
  const candidates = [
    `${slug}.png`,
    `${slug}.jpeg`,
    `${slug}.jpg`,
    `${provider.id}.png`,
    `${provider.id}.jpeg`,
  ];
  for (const name of candidates) {
    if (logoFiles.includes(name)) return name;
  }

  const compact = provider.name.toLowerCase().replace(/[^a-z0-9]/g, "");
  for (const file of logoFiles) {
    const base = file.replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9]/g, "");
    if (base === compact) return file;
  }

  return null;
}

const directory = JSON.parse(readFileSync(directoryPath, "utf8"));
const logoFiles = readdirSync(logosDir).filter(
  (f) => !f.startsWith(".") && f !== "ambient",
);

const byName = {};
const byHost = {};
const providersWithLogos = [];

for (const provider of directory.providers) {
  const file = resolveLogoFile(provider, logoFiles);
  if (!file) {
    console.warn(`No logo file for: ${provider.name} (${provider.id})`);
    continue;
  }
  const logoPath = `/logos/${file}`;
  byName[provider.name.trim().toLowerCase()] = logoPath;
  const host = extractHost(provider.website);
  if (host) byHost[host] = logoPath;
  providersWithLogos.push({
    name: provider.name,
    category: provider.categories.join(", "),
    description: provider.description,
    website: provider.website,
    logo_url: logoPath,
    status: "active",
  });
}

const localOut = { byHost, byName };
writeFileSync(localLogosPath, `${JSON.stringify(localOut, null, 2)}\n`, "utf8");

const directoryOut = {
  ...directory,
  providers: directory.providers.map((p) => {
    const file = resolveLogoFile(p, logoFiles);
    return {
      ...p,
      logoUrl: file ? `/logos/${file}` : p.logoUrl ?? null,
    };
  }),
};
writeFileSync(
  directoryPath,
  `${JSON.stringify(directoryOut, null, 2)}\n`,
  "utf8",
);

const ivsOut = {
  providers: providersWithLogos,
  lastUpdated: directory.updatedAt ?? new Date().toISOString().slice(0, 10),
  total: providersWithLogos.length,
};
writeFileSync(ivsNewsPath, `${JSON.stringify(ivsOut, null, 2)}\n`, "utf8");

console.log(
  `Synced ${providersWithLogos.length} logos → local-provider-logos.json, directory-providers.json, ivs_news/providers.json`,
);
