import { NextResponse } from "next/server";
import { BrevoError, EmailConfigError } from "@/lib/brevo";

/* ---------- tiny in-memory rate limiter (best effort, per server process) ---------- */

const hits = new Map<string, number[]>();

/** True if `key` already made `max` requests within the last `windowMs`. */
export function rateLimited(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);

  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (!v.some((t) => now - t < windowMs)) hits.delete(k);
    }
  }
  return false;
}

export function clientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

/* ---------- input helpers ---------- */

export function isEmail(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length <= 254 &&
    /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/.test(value)
  );
}

/** Trim, collapse to a safe length. Returns "" for non-strings. */
export function clean(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/** Single-line version (for names that end up in email subjects). */
export function oneLine(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export async function readJson(req: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await req.json();
    return body && typeof body === "object" ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/* ---------- responses ---------- */

export function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function tooMany() {
  return bad("Too many requests. Please try again in a few minutes.", 429);
}

/** Turn an email-service failure into a safe response (details go to the server log only). */
export function emailFailure(err: unknown) {
  if (err instanceof EmailConfigError) {
    console.error("[email] not configured:", err.message);
    return bad("Our email service is not available right now.", 503);
  }
  if (err instanceof BrevoError) {
    console.error(`[brevo] ${err.status}:`, err.detail);
  } else {
    console.error("[email] unexpected error:", err);
  }
  return bad("We couldn't send that. Please try again in a moment.", 502);
}
