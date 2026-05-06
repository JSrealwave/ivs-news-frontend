
"use client";
/* eslint-disable @next/next/no-img-element */

import { ExternalLink, ChevronDown, ChevronUp, Newspaper } from "lucide-react";
import { useState, type CSSProperties } from "react";

interface Article {
  id: string;
  title: string;
  summary: string | null;
  url: string;
  image: string | null;
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
  const [imageError, setImageError] = useState(false);

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

  const cardStyle: CSSProperties = isList
    ? {
        backgroundColor: "transparent",
        borderBottom: "1px solid #3f3f46",
        padding: "24px 0",
        display: "grid",
        gridTemplateColumns: "minmax(220px, 320px) minmax(0, 1fr)",
        gap: "22px",
        alignItems: "start",
        transition: "all 0.2s ease",
      }
    : {
        backgroundColor: "#18181b",
        border: "1px solid #3f3f46",
        borderRadius: "18px",
        padding: 0,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.2s ease",
      };

  const mediaWrapStyle: CSSProperties = isList
    ? {
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(145deg, #27272a 0%, #18181b 100%)",
        border: "1px solid rgba(82, 82, 91, 0.6)",
        boxShadow: "0 10px 24px -14px rgba(0, 0, 0, 0.7)",
        width: "100%",
        height: "clamp(170px, 22vw, 220px)",
        borderRadius: "16px",
        flexShrink: 0,
      }
    : {
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(145deg, #27272a 0%, #18181b 100%)",
        width: "100%",
        height: "clamp(190px, 18vw, 240px)",
        flexShrink: 0,
      };

  const contentStyle: CSSProperties = {
    flex: 1,
    minWidth: 0,
    padding: isList ? "0" : "22px 22px 24px",
    display: "flex",
    flexDirection: "column",
  };

  return (
    <>
      <article
        style={cardStyle}
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
        <div style={mediaWrapStyle}>
          {article.image && !imageError ? (
            <img
              src={article.image}
              alt={article.title}
              onError={() => setImageError(true)}
              style={{
                width: "100%",
                height: "100%",
                display: "block",
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              aria-hidden="true"
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#d4d4d8",
                position: "relative",
                background:
                  "radial-gradient(circle at top, rgba(96, 165, 250, 0.28), transparent 45%), radial-gradient(circle at bottom right, rgba(139, 92, 246, 0.25), transparent 40%), linear-gradient(145deg, rgba(39, 39, 42, 1) 0%, rgba(17, 24, 39, 1) 100%)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: "18%",
                  borderRadius: "9999px",
                  background: "rgba(255, 255, 255, 0.05)",
                  filter: "blur(18px)",
                }}
              />
              <Newspaper size={isList ? 48 : 58} />
            </div>
          )}
        </div>

        <div style={contentStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "12px",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                ...getCategoryStyle(article.category),
                padding: "4px 12px",
                borderRadius: "9999px",
                fontSize: "12px",
                fontWeight: "600",
              }}
            >
              {article.category.replace("_", " ")}
            </span>

            <div
              style={{
                fontSize: "13px",
                color: "#71717a",
                fontFamily: "monospace",
              }}
            >
              Rel {article.score_relevance} • Tech {article.score_technical}
            </div>
          </div>

          <h3
            style={{
              fontSize: isList ? "20px" : "22px",
              fontWeight: "600",
              lineHeight: "1.35",
              marginBottom: "12px",
              color: "#f4f4f5",
            }}
          >
            {article.title}
          </h3>

          {article.summary && (
            <div style={{ marginBottom: "16px", flexGrow: 1 }}>
              <p
                style={{
                  color: "#a3a3a3",
                  fontSize: "15px",
                  lineHeight: "1.55",
                }}
              >
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
                    padding: 0,
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
      </article>
    </>
  );
}