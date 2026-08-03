import "server-only";
import { NextResponse, type NextRequest } from "next/server";

const recentRequests = new Map<string, { count: number; resetAt: number }>();

export function requireSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return null; // Native clients and same-site form posts may omit Origin.
  try {
    if (new URL(origin).origin === request.nextUrl.origin) return null;
  } catch { /* Fall through to a safe denial. */ }
  return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
}

export function requireJson(request: NextRequest, maxBytes = 16_384) {
  const contentType = request.headers.get("content-type") || "";
  const length = Number(request.headers.get("content-length") || 0);
  if (!contentType.toLowerCase().startsWith("application/json")) {
    return NextResponse.json({ error: "Content-Type must be application/json." }, { status: 415 });
  }
  if (!Number.isSafeInteger(length) || length > maxBytes) {
    return NextResponse.json({ error: "Request body is too large." }, { status: 413 });
  }
  return null;
}

/** Best-effort local abuse control. Persistent rate limiting belongs at the edge when deployed. */
export function rateLimit(request: NextRequest, scope: string, limit: number, windowMs: number, subject = "anonymous") {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const key = `${scope}:${subject}:${forwarded}`;
  const now = Date.now();
  const entry = recentRequests.get(key);
  if (!entry || entry.resetAt <= now) {
    recentRequests.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }
  entry.count += 1;
  if (entry.count <= limit) return null;
  return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429, headers: { "Retry-After": String(Math.ceil((entry.resetAt - now) / 1000)) } });
}

export function isUuid(value: unknown) {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
