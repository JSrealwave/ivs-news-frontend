
"use client";

import { useQuery } from "@tanstack/react-query";
import ArticleCard from "../components/ArticleCard";
import { useState } from "react";
import { Grid3X3, List } from "lucide-react";

interface Article {
  id: string;
  title: string;
  summary: string | null;
  url: string;
  category: string;
  score_relevance: number;
  score_technical: number;
  score_compelling: number;
}

const categories = ["All", "CV_Technique", "Customer_Implementation", "Marketplace_News", "Market_Trend", "Use_Case"];

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: articles, isLoading, error } = useQuery({
    queryKey: ["feed", selectedCategory],
    queryFn: async () => {
      const url = selectedCategory === "All" 
        ? "https://ivs-news-api.onrender.com/feed?limit=20"
        : `https://ivs-news-api.onrender.com/feed?limit=20&category=${selectedCategory}`;
      
      const res = await fetch(url, { cache: "force-cache" });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json() as Promise<Article[]>;
    },
    staleTime: 1000 * 60 * 30,   // 30 minutes
    gcTime: 1000 * 60 * 60,      // 1 hour
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
        </div>

        {/* Controls */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px", flexWrap: "wrap", gap: "16px" }}>
          {/* Category Filters */}
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

          {/* View Toggle */}
          <div style={{ 
            display: "flex", 
            gap: "6px", 
            backgroundColor: "#27272a", 
            padding: "4px", 
            borderRadius: "9999px" 
          }}>
            <button
              onClick={() => setViewMode("grid")}
              style={{
                padding: "6px 14px",
                borderRadius: "9999px",
                backgroundColor: viewMode === "grid" ? "#ffffff" : "transparent",
                color: viewMode === "grid" ? "#000000" : "#a1a1aa",
              }}
            >
              <Grid3X3 size={18} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              style={{
                padding: "6px 14px",
                borderRadius: "9999px",
                backgroundColor: viewMode === "list" ? "#ffffff" : "transparent",
                color: viewMode === "list" ? "#000000" : "#a1a1aa",
              }}
            >
              <List size={18} />
            </button>
          </div>
        </div>

        {/* Loading Skeleton */}
        {isLoading && (
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", 
            gap: "24px" 
          }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ 
                backgroundColor: "#18181b", 
                border: "1px solid #3f3f46", 
                borderRadius: "16px", 
                height: "420px" 
              }} />
            ))}
          </div>
        )}

        {error && <div style={{ textAlign: "center", padding: "80px 0", color: "#ef4444" }}>Failed to load articles.</div>}

        {/* Articles */}
        {!isLoading && articles && (
          <div style={{
            display: "grid",
            gridTemplateColumns: viewMode === "grid" ? "repeat(auto-fit, minmax(380px, 1fr))" : "1fr",
            gap: viewMode === "grid" ? "24px" : "2px",
          }}>
            {articles.map((article) => (
              <ArticleCard 
                key={article.id} 
                article={article} 
                viewMode={viewMode} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}