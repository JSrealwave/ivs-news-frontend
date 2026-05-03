
"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Grid3X3, List } from "lucide-react";
import ArticleCard from "./ArticleCard";
import { getSupabaseClient } from "../lib/supabase/client";

export interface Article {
  id: string;
  title: string;
  summary: string | null;
  url: string;
  image?: string;
  category: string;
  score_relevance: number;
  score_technical: number;
  score_compelling: number;
  created_at: string;
}

const categories = [
  "All",
  "CV_Technique",
  "Customer_Implementation",
  "Marketplace_News",
  "Market_Trend",
  "Use_Case",
];

async function fetchArticles(selectedCategory: string): Promise<Article[]> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase client not initialized. Check your env vars.");
  }

  let query = supabase
    .from("ivs_articles")
    .select(
      "id,title,summary,url,image,category,score_relevance,score_technical,score_compelling,created_at"
    )
    .order("created_at", { ascending: false })
    .limit(20);

  if (selectedCategory !== "All") {
    query = query.eq("category", selectedCategory);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []) as Article[];
}

export default function HomePageClient({
  initialArticles,
  initialLoadError,
}: {
  initialArticles: Article[];
  initialLoadError: string | null;
}) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [todayViews, setTodayViews] = useState<number | null>(null);

  // Simple local views counter
  useEffect(() => {
    window.requestAnimationFrame(() => {
      const todayKey = "ivsnews-today-views";
      const dateKey = "ivsnews-today-date";
      const today = new Date().toISOString().slice(0, 10);

      const storedDate = localStorage.getItem(dateKey);
      const storedViews = Number(localStorage.getItem(todayKey) ?? "0");
      const nextViews = storedDate === today ? storedViews + 1 : 1;

      localStorage.setItem(dateKey, today);
      localStorage.setItem(todayKey, String(nextViews));
      setTodayViews(nextViews);
    });
  }, []);

  const { data: articles, isLoading, error } = useQuery({
    queryKey: ["feed", selectedCategory],
    queryFn: () => fetchArticles(selectedCategory),
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
    initialData: selectedCategory === "All" ? initialArticles : undefined,
  });

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#09090b", color: "#e4e4e7" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "48px 24px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <h1 style={{ fontSize: "48px", fontWeight: "700", letterSpacing: "-0.025em", marginBottom: "16px", color: "#ffffff" }}>
            IVS News
          </h1>
          <p style={{ fontSize: "20px", color: "#a1a1aa", maxWidth: "672px", margin: "0 auto" }}>
            Technical news and analysis for intelligent video surveillance
          </p>
          {todayViews !== null && (
            <p style={{ marginTop: "14px", fontSize: "13px", color: "#71717a", fontFamily: "monospace" }}>
              {todayViews.toLocaleString()} today{todayViews === 1 ? "" : "s"} view{todayViews === 1 ? "" : "s"}
            </p>
          )}
        </div>

        {/* Controls */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: "10px 24px",
                  borderRadius: "9999px",
                  fontSize: "14px",
                  fontWeight: "500",
                  transition: "all 0.2s ease",
                  backgroundColor: selectedCategory === cat ? "#ffffff" : "#27272a",
                  color: selectedCategory === cat ? "#000000" : "#d4d4d8",
                }}
              >
                {cat.replace("_", " ")}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: "6px", backgroundColor: "#27272a", padding: "4px", borderRadius: "9999px" }}>
            <button onClick={() => setViewMode("grid")} style={{ padding: "6px 14px", borderRadius: "9999px", backgroundColor: viewMode === "grid" ? "#ffffff" : "transparent", color: viewMode === "grid" ? "#000000" : "#a1a1aa" }}>
              <Grid3X3 size={18} />
            </button>
            <button onClick={() => setViewMode("list")} style={{ padding: "6px 14px", borderRadius: "9999px", backgroundColor: viewMode === "list" ? "#ffffff" : "transparent", color: viewMode === "list" ? "#000000" : "#a1a1aa" }}>
              <List size={18} />
            </button>
          </div>
        </div>

        {isLoading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: "24px" }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ backgroundColor: "#18181b", border: "1px solid #3f3f46", borderRadius: "16px", height: "420px" }} />
            ))}
          </div>
        )}

        {initialLoadError && (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#ef4444" }}>{initialLoadError}</div>
        )}

        {error && (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#ef4444" }}>
            Failed to load articles: {error.message}
          </div>
        )}

        {!isLoading && articles && (
          <div style={{
            display: "grid",
            gridTemplateColumns: viewMode === "grid" ? "repeat(auto-fit, minmax(380px, 1fr))" : "1fr",
            gap: viewMode === "grid" ? "24px" : "2px",
          }}>
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} viewMode={viewMode} />
            ))}
          </div>
        )}

        <footer style={{ marginTop: "80px", textAlign: "center", color: "#71717a", fontSize: "13px" }}>
          Fresh technical coverage for the IVS ecosystem • Built with Grok
        </footer>
      </div>
    </div>
  );
}