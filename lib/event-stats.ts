import { getSupabaseServiceClient } from "./supabase/service";

export type NamedCount = {
  label: string;
  count: number;
};

export type TrafficStats = {
  windowDays: number;
  views: number;
  uniqueSessions: number;
  avgDwellSeconds: number | null;
  topPaths: NamedCount[];
  topOutbound: NamedCount[];
  error: string | null;
};

const WINDOW_DAYS = 14;

type PageEventRow = {
  session_id: string;
  path: string;
  event_type: string;
  seconds: number | null;
  target_url: string | null;
};

function topCounts(
  values: Array<string | null | undefined>,
  limit: number,
): NamedCount[] {
  const counts = new Map<string, number>();
  for (const value of values) {
    const key = (value ?? "").trim();
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, count]) => ({ label, count }));
}

export async function getTrafficStats(): Promise<TrafficStats> {
  const empty: TrafficStats = {
    windowDays: WINDOW_DAYS,
    views: 0,
    uniqueSessions: 0,
    avgDwellSeconds: null,
    topPaths: [],
    topOutbound: [],
    error: null,
  };

  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return {
      ...empty,
      error:
        "SUPABASE_SERVICE_ROLE_KEY is not set. Events can still insert; the dashboard cannot read them.",
    };
  }

  const since = new Date();
  since.setUTCDate(since.getUTCDate() - WINDOW_DAYS);

  const { data, error } = await supabase
    .from("page_events")
    .select("session_id,path,event_type,seconds,target_url")
    .gte("created_at", since.toISOString())
    .limit(5000);

  if (error) {
    return {
      ...empty,
      error:
        error.message.includes("page_events") || error.code === "42P01"
          ? "Apply supabase/migrations/20260823120000_create_page_events.sql in the SQL editor."
          : error.message,
    };
  }

  const rows = (data ?? []) as PageEventRow[];
  const views = rows.filter((row) => row.event_type === "view");
  const dwells = rows.filter(
    (row) =>
      row.event_type === "dwell" &&
      typeof row.seconds === "number" &&
      row.seconds >= 0,
  );
  const outbound = rows.filter((row) => row.event_type === "outbound");

  const dwellTotal = dwells.reduce((sum, row) => sum + (row.seconds ?? 0), 0);

  return {
    windowDays: WINDOW_DAYS,
    views: views.length,
    uniqueSessions: new Set(views.map((row) => row.session_id)).size,
    avgDwellSeconds:
      dwells.length > 0 ? Math.round(dwellTotal / dwells.length) : null,
    topPaths: topCounts(
      views.map((row) => row.path),
      8,
    ),
    topOutbound: topCounts(
      outbound.map((row) => row.target_url),
      8,
    ),
    error: null,
  };
}
