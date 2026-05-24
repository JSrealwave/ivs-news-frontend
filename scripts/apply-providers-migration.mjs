#!/usr/bin/env node
/**
 * Apply providers table migration to Supabase Postgres.
 *
 * Env (from ivs_news/.env, .env.local, or shell):
 *   DATABASE_URL or SUPABASE_DB_URL — direct Postgres connection (Dashboard → Settings → Database)
 *   SUPABASE_ACCESS_TOKEN — optional; runs SQL via Supabase Management API
 *   SUPABASE_URL — used with access token to resolve project ref
 *
 * Usage:
 *   npm run directory:migrate
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationPath = join(
  __dirname,
  "../supabase/migrations/20260524120000_create_providers.sql"
);

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

const sql = readFileSync(migrationPath, "utf8");
const databaseUrl =
  process.env.DATABASE_URL ?? process.env.SUPABASE_DB_URL ?? null;

function projectRefFromSupabaseUrl(url) {
  if (!url) return null;
  try {
    const host = new URL(url).hostname;
    const ref = host.split(".")[0];
    return ref || null;
  } catch {
    return null;
  }
}

async function applyViaManagementApi() {
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  const ref =
    process.env.SUPABASE_PROJECT_REF ??
    projectRefFromSupabaseUrl(process.env.SUPABASE_URL);

  if (!token || !ref) return false;

  const response = await fetch(
    `https://api.supabase.com/v1/projects/${ref}/database/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: sql }),
    }
  );

  if (!response.ok) {
    const body = await response.text();
    console.error(
      `Management API failed (${response.status}): ${body.slice(0, 500)}`
    );
    process.exit(1);
  }

  console.log(`Applied migration via Supabase Management API (project ${ref}).`);
  return true;
}

async function applyViaPg() {
  let pg;
  try {
    pg = await import("pg");
  } catch {
    return false;
  }

  const client = new pg.default.Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    await client.query(sql);
    console.log("Applied migration via DATABASE_URL (node pg).");
    return true;
  } finally {
    await client.end();
  }
}

function applyViaPsql() {
  const result = spawnSync("psql", [databaseUrl, "-v", "ON_ERROR_STOP=1", "-f", migrationPath], {
    stdio: "inherit",
    encoding: "utf8",
  });
  if (result.status === 0) {
    console.log("Applied migration via psql.");
    return true;
  }
  if (result.error?.code === "ENOENT") {
    return false;
  }
  process.exit(result.status ?? 1);
}

async function main() {
  if (databaseUrl) {
    if (applyViaPsql()) return;
    if (await applyViaPg()) return;
    console.error(
      "DATABASE_URL is set but migration failed. Install `pg` (`npm i -D pg`) or ensure `psql` is on PATH."
    );
    process.exit(1);
  }

  if (await applyViaManagementApi()) return;

  console.error(`
Could not apply migration automatically.

Option A — Supabase Dashboard (recommended)
  1. Open https://supabase.com/dashboard/project/${projectRefFromSupabaseUrl(process.env.SUPABASE_URL) ?? "<your-project>"}/sql/new
  2. Paste the contents of:
     ${migrationPath}
  3. Run the query

Option B — CLI (if linked)
  supabase db push

Option C — This script with Postgres URL
  Add DATABASE_URL to ivs_news/.env (Settings → Database → connection string), then:
  npm run directory:migrate

After migration:
  npm run directory:seed
`);
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
