import { getSupabaseServerClient } from "./supabase/server";

/** One item inside an IVS brief `items` jsonb array. */
export type IvsBriefItem = {
  title?: string;
  summary?: string;
  key_point?: string;
  why_it_matters?: string;
  url?: string;
  source?: string;
  entities?: string[];
  signal_level?: string;
  [key: string]: unknown;
};

/** Row shape for public.ivs_briefs (Supabase select). */
export type IvsBriefRow = {
  id: string;
  brief_date: string; // YYYY-MM-DD
  title: string;
  source: string;
  markdown: string;
  signal_level: string | null;
  assessment_md: string | null;
  items: IvsBriefItem[];
  entity_names: string[] | null;
  published: boolean;
  created_at: string | null;
  updated_at: string | null;
};

export const IVS_BRIEF_SELECT_FIELDS =
  "id,brief_date,title,source,markdown,signal_level,assessment_md,items,entity_names,published,created_at,updated_at";

export type GetLatestBriefResult = {
  brief: IvsBriefRow | null;
  error: string | null;
};

export function formatBriefDate(briefDate: string): string {
  const date = new Date(`${briefDate}T12:00:00`);
  if (Number.isNaN(date.getTime())) return briefDate;
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function normalizeBriefItems(items: unknown): IvsBriefItem[] {
  if (!Array.isArray(items)) return [];
  return items.filter(
    (item): item is IvsBriefItem =>
      item != null && typeof item === "object" && !Array.isArray(item),
  );
}

export function briefItemKeyPoint(item: IvsBriefItem): string {
  const keyPoint =
    typeof item.key_point === "string" ? item.key_point.trim() : "";
  if (keyPoint) return keyPoint;
  const summary = typeof item.summary === "string" ? item.summary.trim() : "";
  return summary;
}

function normalizeBriefRow(row: IvsBriefRow): IvsBriefRow {
  return {
    ...row,
    items: normalizeBriefItems(row.items),
  };
}

export async function getLatestBrief(): Promise<GetLatestBriefResult> {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return {
      brief: null,
      error:
        "Supabase is not configured. Add SUPABASE_URL/SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_URL/NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    };
  }

  const { data, error } = await supabase
    .from("ivs_briefs")
    .select(IVS_BRIEF_SELECT_FIELDS)
    .eq("published", true)
    .order("brief_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return { brief: null, error: error.message };
  }

  if (!data) {
    return { brief: null, error: null };
  }

  return {
    brief: normalizeBriefRow(data as IvsBriefRow),
    error: null,
  };
}

export type GetPublishedBriefsResult = {
  briefs: IvsBriefRow[];
  error: string | null;
};

export async function getPublishedBriefs(options?: {
  sinceDate?: string;
}): Promise<GetPublishedBriefsResult> {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return {
      briefs: [],
      error:
        "Supabase is not configured. Add SUPABASE_URL/SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_URL/NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    };
  }

  let query = supabase
    .from("ivs_briefs")
    .select(IVS_BRIEF_SELECT_FIELDS)
    .eq("published", true)
    .order("brief_date", { ascending: false });

  if (options?.sinceDate) {
    query = query.gte("brief_date", options.sinceDate);
  }

  const { data, error } = await query;

  if (error) {
    return { briefs: [], error: error.message };
  }

  return {
    briefs: ((data ?? []) as IvsBriefRow[]).map(normalizeBriefRow),
    error: null,
  };
}

export type GetBriefByDateResult = {
  brief: IvsBriefRow | null;
  error: string | null;
};

export async function getBriefByDate(
  briefDate: string,
): Promise<GetBriefByDateResult> {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return {
      brief: null,
      error:
        "Supabase is not configured. Add SUPABASE_URL/SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_URL/NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    };
  }

  const { data, error } = await supabase
    .from("ivs_briefs")
    .select(IVS_BRIEF_SELECT_FIELDS)
    .eq("published", true)
    .eq("brief_date", briefDate)
    .maybeSingle();

  if (error) {
    return { brief: null, error: error.message };
  }

  if (!data) {
    return { brief: null, error: null };
  }

  return {
    brief: normalizeBriefRow(data as IvsBriefRow),
    error: null,
  };
}

export function briefSignalPillClass(signalLevel: string | null): string {
  const level = (signalLevel ?? "").toLowerCase();
  if (
    level.includes("critical") ||
    level.includes("high") ||
    level.includes("elevated")
  ) {
    return "border-amber-500/40 bg-amber-500/15 text-amber-200";
  }
  if (level.includes("medium") || level.includes("moderate")) {
    return "border-sky-500/40 bg-sky-500/15 text-sky-200";
  }
  if (level.includes("low")) {
    return "border-emerald-500/40 bg-emerald-500/15 text-emerald-200";
  }
  return "border-zinc-600 bg-zinc-800 text-zinc-300";
}

/** Strip common markdown chrome for clean UI text. */
export function stripBriefMarkdown(text: string): string {
  let out = text;
  out = out.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, "$1");
  out = out.replace(/\*\*(.+?)\*\*/g, "$1");
  out = out.replace(/\*(.+?)\*/g, "$1");
  out = out.replace(/`([^`]+)`/g, "$1");
  out = out.replace(/^>\s?/gm, "");
  out = out.replace(/\s+/g, " ").trim();
  return out;
}

/** Remove tool/product sample references from user-visible assessment copy. */
export function sanitizeAssessmentCopy(text: string): string {
  let out = text;
  out = out.replace(/\bin the Tavily sample\b/gi, "in this brief");
  out = out.replace(/\bin this Tavily sample\b/gi, "in this brief");
  out = out.replace(/\bthe Tavily sample\b/gi, "this brief");
  out = out.replace(/\ba Tavily sample\b/gi, "this brief");
  out = out.replace(/\bTavily sample\b/gi, "this brief");
  out = out.replace(/\bTavily\b/gi, "");
  out = out.replace(/\s{2,}/g, " ");
  out = out.replace(/\s+([.,;:!?])/g, "$1");
  return out.trim();
}

function cleanAssessmentText(text: string): string {
  return sanitizeAssessmentCopy(stripBriefMarkdown(text));
}

/**
 * Split inline numbered points ("1) … 2) …") into separate items.
 * Returns a single-item array when no numbered list is detected.
 */
export function splitNumberedAssessmentPoints(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const parts = trimmed
    .split(/(?=\b\d+\)\s)/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length >= 2 && parts.every((part) => /^\d+\)\s/.test(part))) {
    return parts.map((part) => part.replace(/^\d+\)\s*/, "").trim()).filter(Boolean);
  }

  return [trimmed];
}

export type BriefAssessmentSections = {
  signalLevel?: string;
  notableTrends?: string;
  gaps?: string;
  other: { label: string; body: string }[];
  plainFallback?: string;
};

/**
 * Parse Overall assessment markdown (usually a 2-column table) into
 * labeled prose sections with no markdown syntax left for the UI.
 */
export function parseAssessmentMd(md: string): BriefAssessmentSections {
  const raw = md.trim();
  if (!raw) {
    return { other: [] };
  }

  const rows: { label: string; body: string }[] = [];
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("|")) continue;
    if (/^\|\s*[-:|\s]+\|$/.test(trimmed)) continue; // separator
    if (/^\|\s*\|\s*\|$/.test(trimmed)) continue; // empty header row

    const cells = trimmed
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((cell) => cleanAssessmentText(cell));

    if (cells.length < 2) continue;
    const label = cells[0] ?? "";
    const body = cells.slice(1).join(" ").trim();
    if (!label && !body) continue;
    // Skip decorative empty-label rows without content
    if (!body) continue;
    rows.push({ label: label || "Note", body });
  }

  const result: BriefAssessmentSections = { other: [] };

  for (const row of rows) {
    const key = row.label.toLowerCase();
    if (key.includes("signal")) {
      result.signalLevel = row.body;
    } else if (key.includes("trend")) {
      result.notableTrends = row.body;
    } else if (key.includes("gap")) {
      result.gaps = row.body;
    } else {
      result.other.push(row);
    }
  }

  if (
    !result.signalLevel &&
    !result.notableTrends &&
    !result.gaps &&
    result.other.length === 0
  ) {
    // Non-table assessment: strip markdown and keep as paragraphs.
    const plain = raw
      .split(/\n{2,}/)
      .map((block) => cleanAssessmentText(block.replace(/\n/g, " ")))
      .filter(Boolean)
      .join("\n\n");
    result.plainFallback = plain || cleanAssessmentText(raw);
  }

  return result;
}

export function briefItemSourceLabel(item: IvsBriefItem): string | null {
  if (typeof item.source === "string" && item.source.trim()) {
    return stripBriefMarkdown(item.source);
  }
  return null;
}
