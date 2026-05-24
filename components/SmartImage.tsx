"use client";
/* eslint-disable @next/next/no-img-element */

import {
  useCallback,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

import {
  ARTICLE_PLACEHOLDER_SRC,
  uniqueImageSources,
} from "../lib/image-placeholders";

export type SmartImageProps = {
  src?: string | null;
  alt: string;
  /** Second choice (e.g. provider logo). */
  fallbackSrc?: string | null;
  placeholderSrc?: string;
  className?: string;
  style?: CSSProperties;
  imgStyle?: CSSProperties;
  objectFit?: "cover" | "contain";
  showLoadingSkeleton?: boolean;
  placeholder?: ReactNode;
};

type SmartImageInnerProps = Omit<SmartImageProps, "src" | "fallbackSrc" | "placeholderSrc"> & {
  chain: string[];
};

function SmartImageInner({
  chain,
  alt,
  className,
  style,
  imgStyle,
  objectFit = "cover",
  showLoadingSkeleton = true,
  placeholder,
}: SmartImageInnerProps) {
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  const activeSrc = chain[index] ?? null;

  const handleError = useCallback(() => {
    setLoaded(false);
    if (index < chain.length - 1) {
      setIndex((value) => value + 1);
      return;
    }
    setFailed(true);
  }, [chain.length, index]);

  const handleLoad = useCallback(() => {
    setLoaded(true);
    setFailed(false);
  }, []);

  if ((!activeSrc || failed) && placeholder) {
    return (
      <div className={className} style={style} role="img" aria-label={alt}>
        {placeholder}
      </div>
    );
  }

  if (!activeSrc) {
    return null;
  }

  const showSkeleton = showLoadingSkeleton && !loaded && !failed;

  return (
    <div
      className={className}
      style={{ position: "relative", overflow: "hidden", ...style }}
    >
      {showSkeleton ? (
        <div
          aria-hidden
          className="absolute inset-0 animate-pulse bg-zinc-800/80"
          style={{ zIndex: 0 }}
        />
      ) : null}
      <img
        key={activeSrc}
        src={activeSrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          objectFit,
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.2s ease",
          position: "relative",
          zIndex: 1,
          ...imgStyle,
        }}
      />
    </div>
  );
}

/** Article/provider images: thumbnail → fallback → placeholder. */
export default function SmartImage({
  src,
  alt,
  fallbackSrc,
  placeholderSrc = ARTICLE_PLACEHOLDER_SRC,
  ...rest
}: SmartImageProps) {
  const chain = useMemo(
    () => uniqueImageSources(src, fallbackSrc, placeholderSrc),
    [src, fallbackSrc, placeholderSrc],
  );

  return <SmartImageInner key={chain.join("|")} chain={chain} alt={alt} {...rest} />;
}
