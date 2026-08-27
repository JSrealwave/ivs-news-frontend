
"use client";

import { ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { useState, type CSSProperties } from "react";

import {
  formatArticlePublishedDate,
  isUsableNewsThumbnail,
  type Article,
} from "../lib/articles";
import SmartImage from "./SmartImage";

interface ArticleCardProps {
  article: Article;
  viewMode: "grid" | "list";
  /** Eager-load above-the-fold thumbnails on first paint. */
  priorityImage?: boolean;
}

const ASPECT_RATIO_16_9 = "16 / 9";

export default function ArticleCard({
  article,
  viewMode,
  priorityImage = false,
}: ArticleCardProps) {
  const [expanded, setExpanded] = useState(false);

  const isList = viewMode === "list";
  const thumbnail = isUsableNewsThumbnail(article.image) ? article.image : null;

  const getCategoryStyle = (category: string) => {
    switch (category) {
      case "CV_Technique": return { backgroundColor: "#1e40af", color: "white" };
      case "Customer_Implementation": return { backgroundColor: "#166534", color: "white" };
      case "Marketplace_News": return { backgroundColor: "#6b21a8", color: "white" };
      case "Market_Trend": return { backgroundColor: "#b45309", color: "white" };
      default: return { backgroundColor: "#3f3f46", color: "white" };
    }
  };

  const publishedLabel = formatArticlePublishedDate(article.published_at);

  const summaryPreviewLength = isList ? 120 : 120;
  const displaySummary = article.summary
    ? (expanded
        ? article.summary
        : article.summary.slice(0, summaryPreviewLength) + "...")
    : "";

  const cardStyle: CSSProperties = isList
    ? {
        backgroundColor: "transparent",
        borderBottom: "1px solid #3f3f46",
        padding: "24px 0",
        display: "grid",
        gridTemplateColumns: thumbnail
          ? "minmax(clamp(180px, 38vw, 280px), min(320px, 42vw)) minmax(0, 1fr)"
          : "minmax(0, 1fr)",
        gap: "clamp(16px, 3vw, 22px)",
        alignItems: "start",
        transition: "all 0.2s ease",
      }
    : {
        backgroundColor: "#18181b",
        border: "1px solid #3f3f46",
        borderRadius: "16px",
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
        width: "100%",
        aspectRatio: ASPECT_RATIO_16_9,
        flexShrink: 0,
        border: "1px solid rgba(82, 82, 91, 0.6)",
        borderRadius: "16px",
        boxShadow: "0 10px 24px -14px rgba(0, 0, 0, 0.7)",
      }
    : {
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(145deg, #27272a 0%, #18181b 100%)",
        width: "auto",
        height: 140,
        margin: "12px 12px 0",
        flexShrink: 0,
        border: "1px solid rgba(82, 82, 91, 0.55)",
        borderRadius: 12,
      };

  const contentStyle: CSSProperties = {
    flex: 1,
    minWidth: 0,
    padding: isList ? "0" : "14px 14px 16px",
    display: "flex",
    flexDirection: "column",
  };

  return (
    <article
      style={cardStyle}
      onMouseEnter={(e) => {
        if (!isList) {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 12px 20px -8px rgb(0 0 0 / 0.35)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isList) {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
        }
      }}
    >
      {thumbnail ? (
        <SmartImage
          src={thumbnail}
          fallbackSrc={null}
          placeholderSrc=""
          alt={article.title}
          style={mediaWrapStyle}
          objectFit="cover"
          showLoadingSkeleton
          priority={priorityImage}
        />
      ) : null}

      <div style={contentStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: isList ? "12px" : "8px",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              ...getCategoryStyle(article.category),
              padding: isList ? "4px 12px" : "3px 10px",
              borderRadius: "9999px",
              fontSize: "12px",
              fontWeight: "600",
            }}
          >
            {article.category.replace("_", " ")}
          </span>
        </div>

        <h3
          style={{
            fontSize: isList ? "20px" : "18px",
            fontWeight: "600",
            lineHeight: "1.35",
            marginBottom: publishedLabel ? "6px" : isList ? "12px" : "8px",
            color: "#f4f4f5",
          }}
        >
          {article.title}
        </h3>

        {publishedLabel && (
          <time
            dateTime={article.published_at ?? undefined}
            style={{
              display: "block",
              marginBottom: isList ? "12px" : "8px",
              fontSize: isList ? "14px" : "13px",
              color: "#a1a1aa",
            }}
          >
            {publishedLabel}
          </time>
        )}

        {article.summary && (
          <div style={{ marginBottom: isList ? "16px" : "12px", flexGrow: 1 }}>
            <p
              style={{
                color: "#a3a3a3",
                fontSize: isList ? "15px" : "14px",
                lineHeight: "1.55",
              }}
            >
              {displaySummary}
            </p>

            {article.summary.length > summaryPreviewLength && (
              <button
                onClick={() => setExpanded(!expanded)}
                style={{
                  marginTop: "8px",
                  color: "#60a5fa",
                  fontSize: isList ? "14px" : "13px",
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
          data-ivs-entity="article"
          data-ivs-id={article.id}
          style={{
            color: "#60a5fa",
            fontSize: isList ? "14.5px" : "13.5px",
            fontWeight: "500",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          Read full article
          <ExternalLink size={isList ? 17 : 15} />
        </a>
      </div>
    </article>
  );
}
