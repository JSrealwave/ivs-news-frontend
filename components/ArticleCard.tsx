
"use client";

import { ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
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

interface ArticleCardProps {
  article: Article;
  viewMode: "grid" | "list";
}

export default function ArticleCard({ article, viewMode }: ArticleCardProps) {
  const [expanded, setExpanded] = useState(false);

  const isList = viewMode === "list";

  const getCategoryStyle = (category: string) => {
    switch (category) {
      case "CV_Technique": return { backgroundColor: "#1e40af", color: "white" };
      case "Customer_Implementation": return { backgroundColor: "#166534", color: "white" };
      case "Marketplace_News": return { backgroundColor: "#6b21a8", color: "white" };
      case "Market_Trend": return { backgroundColor: "#b45309", color: "white" };
      default: return { backgroundColor: "#3f3f46", color: "white" };
    }
  };

  const displaySummary = article.summary 
    ? (expanded ? article.summary : article.summary.slice(0, isList ? 120 : 160) + "...") 
    : "";

  return (
    <div 
      style={{
        backgroundColor: isList ? "transparent" : "#18181b",
        border: isList ? "none" : "1px solid #3f3f46",
        borderBottom: isList ? "1px solid #3f3f46" : "none",
        borderRadius: isList ? "0" : "16px",
        padding: isList ? "20px 0" : "24px",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        if (!isList) {
          e.currentTarget.style.transform = "translateY(-4px)";
          e.currentTarget.style.boxShadow = "0 20px 25px -5px rgb(0 0 0 / 0.3)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isList) {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
        }
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
        <span style={{
          ...getCategoryStyle(article.category),
          padding: "4px 12px",
          borderRadius: "9999px",
          fontSize: "12px",
          fontWeight: "600",
        }}>
          {article.category.replace("_", " ")}
        </span>
        
        <div style={{ fontSize: "13px", color: "#71717a", fontFamily: "monospace" }}>
          Rel {article.score_relevance} • Tech {article.score_technical}
        </div>
      </div>

      <h3 style={{ 
        fontSize: isList ? "18px" : "18px", 
        fontWeight: "600", 
        lineHeight: "1.35", 
        marginBottom: "12px",
        color: "#f4f4f5"
      }}>
        {article.title}
      </h3>

      {article.summary && (
        <div style={{ marginBottom: "16px", flexGrow: 1 }}>
          <p style={{ 
            color: "#a3a3a3", 
            fontSize: "15px", 
            lineHeight: "1.55" 
          }}>
            {displaySummary}
          </p>
          
          {article.summary.length > (isList ? 120 : 160) && (
            <button
              onClick={() => setExpanded(!expanded)}
              style={{
                marginTop: "8px",
                color: "#60a5fa",
                fontSize: "14px",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              {expanded ? "Show less" : "Read more"}
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          )}
        </div>
      )}

      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: "#60a5fa",
          fontSize: "14.5px",
          fontWeight: "500",
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        Read full article
        <ExternalLink size={17} />
      </a>
    </div>
  );
}