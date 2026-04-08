
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

export default function ArticleCard({ article }: { article: Article }) {
  const [expanded, setExpanded] = useState(false);

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
    ? (expanded ? article.summary : article.summary.slice(0, 160) + "...") 
    : "";

  return (
    <div 
      style={{
        backgroundColor: "#18181b",
        border: "1px solid #3f3f46",
        borderRadius: "16px",
        padding: "24px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-6px)";
        e.currentTarget.style.boxShadow = "0 20px 25px -5px rgb(0 0 0 / 0.3)";
        e.currentTarget.style.borderColor = "#52525b";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.borderColor = "#3f3f46";
      }}
    >
      {/* Category + Scores */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
        <span 
          style={{
            ...getCategoryStyle(article.category),
            padding: "6px 16px",
            borderRadius: "9999px",
            fontSize: "13px",
            fontWeight: "600",
          }}
        >
          {article.category.replace("_", " ")}
        </span>
        
        <div style={{ fontSize: "13px", color: "#71717a", fontFamily: "monospace" }}>
          Rel {article.score_relevance} • Tech {article.score_technical}
        </div>
      </div>

      {/* Title */}
      <h3 style={{ 
        fontSize: "18px", 
        fontWeight: "600", 
        lineHeight: "1.35", 
        marginBottom: "16px",
        color: "#f4f4f5"
      }}>
        {article.title}
      </h3>

      {/* Summary with toggle */}
      {article.summary && (
        <div style={{ marginBottom: "24px", flexGrow: 1 }}>
          <p style={{ 
            color: "#a3a3a3", 
            fontSize: "15px", 
            lineHeight: "1.55" 
          }}>
            {displaySummary}
          </p>
          
          {article.summary.length > 160 && (
            <button
              onClick={() => setExpanded(!expanded)}
              style={{
                marginTop: "12px",
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

      {/* Read full article link */}
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          marginTop: "auto",
          paddingTop: "16px",
          borderTop: "1px solid #3f3f46",
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          color: "#60a5fa",
          fontSize: "14.5px",
          fontWeight: "500",
          textDecoration: "none",
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = "#93c5fd"}
        onMouseLeave={(e) => e.currentTarget.style.color = "#60a5fa"}
      >
        Read full article
        <ExternalLink size={17} />
      </a>
    </div>
  );
}