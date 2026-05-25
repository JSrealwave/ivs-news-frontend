"use client";
/* eslint-disable @next/next/no-img-element */

import {
  useCallback,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
  type SyntheticEvent,
} from "react";

import {
  ARTICLE_PLACEHOLDER_SRC,
  buildArticleImageChain,
} from "../lib/image-placeholders";
import { isLocalLogoSrc } from "../lib/local-provider-logos";

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
  /** Used when the chain advances past the primary thumbnail (e.g. provider logos). */
  fallbackObjectFit?: "cover" | "contain";
  showLoadingSkeleton?: boolean;
  placeholder?: ReactNode;
  /** Above-the-fold images: eager load + high fetch priority. */
  priority?: boolean;
};

type SmartImageInnerProps = Omit<
  SmartImageProps,
  "src" | "fallbackSrc" | "placeholderSrc"
> & {
  chain: string[];
};

function srcMatchesAttempt(element: HTMLImageElement, expected: string): boolean {
  const current = element.currentSrc || element.src;
  if (!current || !expected) return false;
  return current === expected || current.endsWith(expected);
}

const MAX_LOAD_RETRIES = 1;

function isExternalImageSrc(src: string): boolean {
  return /^https?:\/\//i.test(src);
}

function isLocalAssetSrc(src: string): boolean {
  return src.startsWith("/");
}

type SmartImageAttemptProps = {
  src: string;
  alt: string;
  imgStyle?: CSSProperties;
  objectFit: "cover" | "contain";
  showLoadingSkeleton: boolean;
  priority: boolean;
  onLoad: () => void;
  onError: (event: SyntheticEvent<HTMLImageElement>) => void;
};

/** Keyed by `src` so load state resets when the fallback chain advances. */
function SmartImageAttempt({
  src,
  alt,
  imgStyle,
  objectFit,
  showLoadingSkeleton,
  priority,
  onLoad,
  onError,
}: SmartImageAttemptProps) {
  const [loaded, setLoaded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const markLoaded = useCallback(() => {
    setLoaded(true);
    onLoad();
  }, [onLoad]);

  const syncLoadedFromElement = useCallback(
    (img: HTMLImageElement) => {
      if (img.naturalWidth > 0) {
        markLoaded();
        return;
      }

      if (typeof img.decode === "function") {
        void img.decode().then(markLoaded).catch(() => {
          // Broken or blocked image — native onError handles fallback.
        });
      }
    },
    [markLoaded],
  );

  const handleImgRef = useCallback(
    (img: HTMLImageElement | null) => {
      if (!img) return;
      if (img.complete) {
        syncLoadedFromElement(img);
      }
    },
    [syncLoadedFromElement],
  );

  const handleLoad = useCallback(() => {
    markLoaded();
  }, [markLoaded]);

  const handleError = useCallback(
    (event: SyntheticEvent<HTMLImageElement>) => {
      if (retryCount < MAX_LOAD_RETRIES) {
        setRetryCount((count) => count + 1);
        return;
      }
      onError(event);
    },
    [onError, retryCount],
  );

  const showSkeleton = showLoadingSkeleton && !loaded;

  return (
    <>
      {showSkeleton ? (
        <div
          aria-hidden
          className="absolute inset-0 animate-pulse bg-zinc-800/80"
          style={{ zIndex: 0 }}
        />
      ) : null}
      <img
        key={`${src}:${retryCount}`}
        ref={handleImgRef}
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        referrerPolicy={
          isExternalImageSrc(src) && !isLocalAssetSrc(src)
            ? "no-referrer"
            : undefined
        }
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
    </>
  );
}

function SmartImageInner({
  chain,
  alt,
  className,
  style,
  imgStyle,
  objectFit = "cover",
  fallbackObjectFit = "contain",
  showLoadingSkeleton = true,
  placeholder,
  priority = false,
}: SmartImageInnerProps & { fallbackObjectFit?: "cover" | "contain" }) {
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  const activeSrc = chain[index] ?? null;
  const activeObjectFit =
    index > 0 ? fallbackObjectFit : objectFit;
  const activeImgStyle: CSSProperties | undefined =
    index > 0 && activeSrc && isLocalLogoSrc(activeSrc)
      ? { padding: "14%", objectPosition: "center", ...imgStyle }
      : imgStyle;

  const handleError = useCallback(
    (event: SyntheticEvent<HTMLImageElement>) => {
      const img = event.currentTarget;

      setIndex((current) => {
        const expected = chain[current];
        if (!expected || !srcMatchesAttempt(img, expected)) {
          return current;
        }
        if (current < chain.length - 1) {
          return current + 1;
        }
        setFailed(true);
        return current;
      });
    },
    [chain],
  );

  const handleLoad = useCallback(() => {
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

  return (
    <div
      className={className}
      style={{ position: "relative", overflow: "hidden", ...style }}
    >
      <SmartImageAttempt
        key={activeSrc}
        src={activeSrc}
        alt={alt}
        imgStyle={activeImgStyle}
        objectFit={activeObjectFit}
        showLoadingSkeleton={showLoadingSkeleton}
        priority={priority}
        onLoad={handleLoad}
        onError={handleError}
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
  fallbackObjectFit = "contain",
  ...rest
}: SmartImageProps) {
  const chain = useMemo(
    () => buildArticleImageChain(src, fallbackSrc, placeholderSrc),
    [src, fallbackSrc, placeholderSrc],
  );

  return (
    <SmartImageInner
      key={chain.join("|")}
      chain={chain}
      alt={alt}
      fallbackObjectFit={fallbackObjectFit}
      {...rest}
    />
  );
}
