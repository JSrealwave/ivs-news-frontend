"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { getOrCreateSessionId, looksLikeBot, sendTrackEvent } from "../lib/track";

function shouldSkipPath(path: string): boolean {
  return path.startsWith("/analytics") || path.startsWith("/api/");
}

function isOutboundUrl(href: string): boolean {
  try {
    const url = new URL(href, window.location.origin);
    return url.origin !== window.location.origin;
  } catch {
    return false;
  }
}

export default function PageTracker() {
  const pathname = usePathname();
  const startedAtRef = useRef(0);
  const pathRef = useRef(pathname);

  useEffect(() => {
    if (looksLikeBot()) return;
    if (shouldSkipPath(pathname)) return;

    const sessionId = getOrCreateSessionId();
    startedAtRef.current = Date.now();
    pathRef.current = pathname;

    sendTrackEvent({
      session_id: sessionId,
      path: pathname,
      referrer: document.referrer || null,
      event_type: "view",
    });

    const flushDwell = () => {
      if (shouldSkipPath(pathRef.current)) return;
      const seconds = Math.round((Date.now() - startedAtRef.current) / 1000);
      startedAtRef.current = Date.now();
      if (seconds < 1) return;
      sendTrackEvent({
        session_id: sessionId,
        path: pathRef.current,
        referrer: document.referrer || null,
        event_type: "dwell",
        seconds,
      });
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") flushDwell();
      if (document.visibilityState === "visible") {
        startedAtRef.current = Date.now();
      }
    };

    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      const href = anchor.href;
      if (!href || !isOutboundUrl(href)) return;

      sendTrackEvent({
        session_id: sessionId,
        path: pathRef.current,
        referrer: document.referrer || null,
        event_type: "outbound",
        target_url: href,
        entity_type: anchor.dataset.ivsEntity ?? null,
        entity_id: anchor.dataset.ivsId ?? null,
      });
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", flushDwell);
    document.addEventListener("click", onClick, true);

    return () => {
      flushDwell();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flushDwell);
      document.removeEventListener("click", onClick, true);
    };
  }, [pathname]);

  return null;
}
