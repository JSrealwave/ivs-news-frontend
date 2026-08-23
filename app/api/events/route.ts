import { NextResponse } from "next/server";

import { getSupabaseServerClient } from "../../../lib/supabase/server";

const EVENT_TYPES = new Set(["view", "dwell", "outbound"]);

function clip(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

function isBot(userAgent: string | null): boolean {
  if (!userAgent) return false;
  return /bot|crawl|spider|slurp|facebookexternalhit|preview/i.test(userAgent);
}

export async function POST(request: Request) {
  if (isBot(request.headers.get("user-agent"))) {
    return NextResponse.json({ ok: true });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventType = clip(body.event_type, 32);
  const sessionId = clip(body.session_id, 80);
  const path = clip(body.path, 500);

  if (!eventType || !EVENT_TYPES.has(eventType) || !sessionId || !path) {
    return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  }

  if (!path.startsWith("/") || path.startsWith("/analytics")) {
    return NextResponse.json({ ok: true });
  }

  const secondsRaw = body.seconds;
  const seconds =
    eventType === "dwell" && typeof secondsRaw === "number" && Number.isFinite(secondsRaw)
      ? Math.max(0, Math.min(Math.round(secondsRaw), 60 * 60 * 6))
      : null;

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const { error } = await supabase.from("page_events").insert({
    session_id: sessionId,
    path,
    referrer: clip(body.referrer, 500),
    event_type: eventType,
    seconds,
    target_url: clip(body.target_url, 1000),
    entity_type: clip(body.entity_type, 40),
    entity_id: clip(body.entity_id, 80),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
