import Link from "next/link";
import type { CSSProperties } from "react";

import type { Article } from "../../lib/articles";
import { getTrafficStats, type TrafficStats } from "../../lib/event-stats";
import { getSupabaseServerClient } from "../../lib/supabase/server";

export const revalidate = 60;

type AnalyticsData = {
  totalArticles: number;
  articlesWithImages: number;
  imageCoveragePercent: number;
  lastPipelineRun: string;
  recentArticles: Pick<Article, "id" | "title" | "category" | "created_at" | "image">[];
  traffic: TrafficStats;
};

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "Unknown";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Unknown";
  return parsed.toLocaleString();
}

async function getAnalyticsData(): Promise<AnalyticsData> {
  const supabase = getSupabaseServerClient();
  const traffic = await getTrafficStats();

  if (!supabase) {
    return {
      totalArticles: 0,
      articlesWithImages: 0,
      imageCoveragePercent: 0,
      lastPipelineRun: "Unknown",
      recentArticles: [],
      traffic,
    };
  }

  const [totalCountRes, imageCountRes, recentRes, latestRunRes] = await Promise.all([
    supabase
      .from("ivs_articles")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("ivs_articles")
      .select("id", { count: "exact", head: true })
      .not("image", "is", null),
    supabase
      .from("ivs_articles")
      .select("id,title,category,created_at,image")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("ivs_articles")
      .select("run_at,created_at")
      .order("run_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const totalArticles = totalCountRes.count ?? 0;
  const articlesWithImages = imageCountRes.count ?? 0;
  const imageCoveragePercent =
    totalArticles > 0 ? Math.round((articlesWithImages / totalArticles) * 100) : 0;

  const lastPipelineRun = formatDateTime(
    latestRunRes.data?.run_at ?? latestRunRes.data?.created_at
  );

  return {
    totalArticles,
    articlesWithImages,
    imageCoveragePercent,
    lastPipelineRun,
    recentArticles: (recentRes.data ?? []) as AnalyticsData["recentArticles"],
    traffic,
  };
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const providedPw = Array.isArray(params.pw) ? params.pw[0] : params.pw;
  const expectedPw = process.env.ANALYTICS_PASSWORD;

  if (!expectedPw || !providedPw || providedPw !== expectedPw) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          backgroundColor: "#09090b",
          color: "#f4f4f5",
          padding: "24px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "560px",
            border: "1px solid #3f3f46",
            borderRadius: "16px",
            padding: "28px",
            background: "linear-gradient(145deg, #18181b 0%, #111827 100%)",
          }}
        >
          <h1 style={{ marginTop: 0, marginBottom: "12px", fontSize: "28px" }}>
            Access Denied
          </h1>
          <p style={{ margin: 0, color: "#a1a1aa" }}>
            Missing or invalid password.
          </p>
        </div>
      </main>
    );
  }

  const data = await getAnalyticsData();

  const metricCardStyle: CSSProperties = {
    border: "1px solid #3f3f46",
    borderRadius: "16px",
    backgroundColor: "#18181b",
    padding: "20px",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#09090b",
        color: "#e4e4e7",
        padding: "40px 20px",
      }}
    >
      <div style={{ width: "100%" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
            marginBottom: "28px",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "36px",
                color: "#fff",
                letterSpacing: "-0.03em",
              }}
            >
              IVS News Analytics
            </h1>
            <p style={{ marginTop: "8px", marginBottom: 0, color: "#a1a1aa" }}>
              Internal dashboard
            </p>
          </div>
          <Link
            href="/"
            style={{
              textDecoration: "none",
              color: "#60a5fa",
              border: "1px solid #3f3f46",
              padding: "8px 14px",
              borderRadius: "10px",
            }}
          >
            Back to Site
          </Link>
        </div>

        <section
          style={{
            display: "grid",
            gap: "14px",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            marginBottom: "22px",
          }}
        >
          <article style={metricCardStyle}>
            <p style={{ marginTop: 0, marginBottom: "8px", color: "#a1a1aa" }}>
              Total Articles in DB
            </p>
            <h2 style={{ margin: 0, fontSize: "30px", color: "#fff" }}>
              {data.totalArticles.toLocaleString()}
            </h2>
          </article>
          <article style={metricCardStyle}>
            <p style={{ marginTop: 0, marginBottom: "8px", color: "#a1a1aa" }}>
              Articles With Images
            </p>
            <h2 style={{ margin: 0, fontSize: "30px", color: "#fff" }}>
              {data.articlesWithImages.toLocaleString()} ({data.imageCoveragePercent}%)
            </h2>
          </article>
          <article style={metricCardStyle}>
            <p style={{ marginTop: 0, marginBottom: "8px", color: "#a1a1aa" }}>
              Page views ({data.traffic.windowDays}d)
            </p>
            <h2 style={{ margin: 0, fontSize: "30px", color: "#fff" }}>
              {data.traffic.views.toLocaleString()}
            </h2>
          </article>
          <article style={metricCardStyle}>
            <p style={{ marginTop: 0, marginBottom: "8px", color: "#a1a1aa" }}>
              Unique sessions ({data.traffic.windowDays}d)
            </p>
            <h2 style={{ margin: 0, fontSize: "30px", color: "#fff" }}>
              {data.traffic.uniqueSessions.toLocaleString()}
            </h2>
          </article>
          <article style={metricCardStyle}>
            <p style={{ marginTop: 0, marginBottom: "8px", color: "#a1a1aa" }}>
              Avg dwell ({data.traffic.windowDays}d)
            </p>
            <h2 style={{ margin: 0, fontSize: "30px", color: "#fff" }}>
              {data.traffic.avgDwellSeconds == null
                ? "—"
                : `${data.traffic.avgDwellSeconds}s`}
            </h2>
          </article>
          <article style={metricCardStyle}>
            <p style={{ marginTop: 0, marginBottom: "8px", color: "#a1a1aa" }}>
              Last Pipeline Run
            </p>
            <h2 style={{ margin: 0, fontSize: "20px", color: "#fff", lineHeight: 1.35 }}>
              {data.lastPipelineRun}
            </h2>
          </article>
        </section>

        {data.traffic.error ? (
          <p style={{ marginTop: 0, marginBottom: "22px", color: "#fbbf24" }}>
            Traffic: {data.traffic.error}
          </p>
        ) : null}

        <section
          style={{
            display: "grid",
            gap: "14px",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            marginBottom: "22px",
          }}
        >
          <article style={metricCardStyle}>
            <h3 style={{ marginTop: 0, marginBottom: "12px", fontSize: "18px", color: "#fff" }}>
              Top paths ({data.traffic.windowDays}d)
            </h3>
            {data.traffic.topPaths.length === 0 ? (
              <p style={{ margin: 0, color: "#a1a1aa" }}>No views yet.</p>
            ) : (
              <ul style={{ margin: 0, paddingLeft: "18px", color: "#d4d4d8" }}>
                {data.traffic.topPaths.map((row) => (
                  <li key={row.label} style={{ marginBottom: "6px" }}>
                    <span style={{ fontFamily: "monospace" }}>{row.label}</span>
                    {" · "}
                    {row.count}
                  </li>
                ))}
              </ul>
            )}
          </article>
          <article style={metricCardStyle}>
            <h3 style={{ marginTop: 0, marginBottom: "12px", fontSize: "18px", color: "#fff" }}>
              Top outbound ({data.traffic.windowDays}d)
            </h3>
            {data.traffic.topOutbound.length === 0 ? (
              <p style={{ margin: 0, color: "#a1a1aa" }}>No outbound clicks yet.</p>
            ) : (
              <ul style={{ margin: 0, paddingLeft: "18px", color: "#d4d4d8" }}>
                {data.traffic.topOutbound.map((row) => (
                  <li key={row.label} style={{ marginBottom: "6px", overflowWrap: "anywhere" }}>
                    {row.label} · {row.count}
                  </li>
                ))}
              </ul>
            )}
          </article>
        </section>

        <section
          style={{
            border: "1px solid #3f3f46",
            borderRadius: "16px",
            backgroundColor: "#18181b",
            padding: "20px",
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: "14px", fontSize: "22px", color: "#fff" }}>
            Top 5 Most Recent Articles
          </h3>
          {data.recentArticles.length === 0 ? (
            <p style={{ margin: 0, color: "#a1a1aa" }}>No articles available.</p>
          ) : (
            <div style={{ display: "grid", gap: "10px" }}>
              {data.recentArticles.map((article) => (
                <article
                  key={article.id}
                  style={{
                    border: "1px solid #3f3f46",
                    borderRadius: "12px",
                    padding: "12px 14px",
                    display: "grid",
                    gap: "6px",
                  }}
                >
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#93c5fd",
                        backgroundColor: "rgba(59,130,246,0.12)",
                        border: "1px solid rgba(59,130,246,0.35)",
                        borderRadius: "9999px",
                        padding: "2px 10px",
                      }}
                    >
                      {article.category.replace("_", " ")}
                    </span>
                    <span style={{ fontSize: "12px", color: "#a1a1aa" }}>
                      {formatDateTime(article.created_at)}
                    </span>
                  </div>
                  <p style={{ margin: 0, color: "#f4f4f5", fontWeight: 500 }}>{article.title}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
