export type TrackEventType = "view" | "dwell" | "outbound";

export type TrackPayload = {
  session_id: string;
  path: string;
  referrer?: string | null;
  event_type: TrackEventType;
  seconds?: number | null;
  target_url?: string | null;
  entity_type?: string | null;
  entity_id?: string | null;
};

const SESSION_KEY = "ivs-session-id";

export function getOrCreateSessionId(): string {
  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing && existing.length >= 8) return existing;
    const next = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, next);
    return next;
  } catch {
    return "anon-session";
  }
}

export function looksLikeBot(): boolean {
  if (typeof navigator === "undefined") return true;
  if (navigator.webdriver) return true;
  const ua = navigator.userAgent.toLowerCase();
  return /bot|crawl|spider|slurp|facebookexternalhit|preview/i.test(ua);
}

export function sendTrackEvent(payload: TrackPayload): void {
  if (typeof window === "undefined") return;
  if (looksLikeBot()) return;

  const body = JSON.stringify(payload);
  const blob = new Blob([body], { type: "application/json" });

  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/events", blob);
      return;
    }
  } catch {
    // fall through to fetch
  }

  void fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  });
}
