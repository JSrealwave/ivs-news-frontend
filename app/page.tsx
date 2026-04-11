
"use client";

import { useQuery } from "@tanstack/react-query";
import ArticleCard from "../components/ArticleCard";
import { useState } from "react";

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

  const { data: articles, isLoading, error } = useQuery({
    queryKey: ["feed", selectedCategory],
    queryFn: async () => {
      const url = selectedCategory === "All" 
        ? "https://ivs-news-api.onrender.com/feed?limit=20"
        : `https://ivs-news-api.onrender.com/feed?limit=20&category=${selectedCategory}`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json() as Promise<Article[]>;
    },
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
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

        {/* Category Filters */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center", marginBottom: "64px" }}>
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
                boxShadow: selectedCategory === cat ? "0 10px 15px -3px rgb(0 0 0 / 0.1)" : "none",
                transform: selectedCategory === cat ? "scale(1.05)" : "scale(1)",
              }}
              onMouseEnter={(e) => {
                if (selectedCategory !== cat) {
                  e.currentTarget.style.backgroundColor = "#3f3f46";
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCategory !== cat) {
                  e.currentTarget.style.backgroundColor = "#27272a";
                }
              }}
            >
              {cat.replace("_", " ")}
            </button>
          ))}
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
                height: "420px",
                animation: "pulse 1.5s infinite" 
              }} />
            ))}
          </div>
        )}

        {/* Error */}
        {error && <div style={{ textAlign: "center", padding: "80px 0", color: "#ef4444" }}>Failed to load articles.</div>}

        {/* Articles Grid */}
        {!isLoading && articles && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
            gap: "24px"
          }}>
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}