import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { clientAnalyticsEvents } from "@/lib/analytics/events";
import { requireJson, rateLimit } from "@/lib/security/request";

const safeKeys = new Set(["step", "link_type", "validation_passed", "error_category", "technical_reference", "currency", "method", "reorder", "metric", "value", "rating", "surface"]);
const trim = (value: unknown, length: number) => typeof value === "string" ? value.slice(0, length) : null;

export async function POST(request: NextRequest) {
  const jsonError = requireJson(request, 8_192); if (jsonError) return jsonError;
  const limited = rateLimit(request, "analytics", 120, 60_000); if (limited) return limited;
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body || !clientAnalyticsEvents.includes(body.event as never)) return new NextResponse(null, { status: 204 });
  const cookie = request.cookies.get("sr_analytics_session")?.value;
  const session = /^[0-9a-f-]{36}$/i.test(cookie || "") ? cookie! : crypto.randomUUID();
  const width = Number(request.headers.get("sec-ch-viewport-width") || 0);
  const mobile = request.headers.get("sec-ch-ua-mobile") === "?1";
  const device = mobile ? "mobile" : width && width < 1024 ? "tablet" : "desktop";
  const ua = request.headers.get("user-agent") || "";
  const browser = /Edg/i.test(ua) ? "Edge" : /Chrome/i.test(ua) ? "Chrome" : /Firefox/i.test(ua) ? "Firefox" : /Safari/i.test(ua) ? "Safari" : "Other";
  const rawMetadata = body.metadata && typeof body.metadata === "object" ? body.metadata : {};
  const metadata = Object.fromEntries(Object.entries(rawMetadata as Record<string, unknown>).filter(([key, value]) => safeKeys.has(key) && ["string", "number", "boolean"].includes(typeof value)).slice(0, 12));
  const ownUrl = new URL(request.url);
  const referrer = request.headers.get("referer");
  let attribution: URL | null = null;
  try { attribution = referrer ? new URL(referrer) : null; } catch { /* Untrusted Referer is optional attribution. */ }
  const db = await createClient();
  try {
    await db.rpc("record_analytics_event", {
      p_event_name: body.event, p_session_id: session, p_page_path: trim(body.pagePath, 300) || "/",
      p_platform: trim(body.platform, 40), p_service_code: trim(body.serviceCode, 100), p_package_id: trim(body.packageId, 100),
      p_device_category: device, p_browser_family: browser, p_screen_width_category: width ? width < 480 ? "compact" : width < 1024 ? "medium" : "wide" : "unknown",
      p_source: attribution?.searchParams.get("utm_source")?.slice(0, 100) || null, p_medium: attribution?.searchParams.get("utm_medium")?.slice(0, 100) || null,
      p_campaign: attribution?.searchParams.get("utm_campaign")?.slice(0, 150) || null, p_content: attribution?.searchParams.get("utm_content")?.slice(0, 150) || null,
      p_term: attribution?.searchParams.get("utm_term")?.slice(0, 150) || null, p_referring_domain: attribution && attribution.hostname !== ownUrl.hostname ? attribution.hostname.slice(0, 150) : null,
      p_metadata: metadata,
    });
  } catch { /* Analytics never blocks navigation. */ }
  const response = new NextResponse(null, { status: 204 });
  if (!cookie) response.cookies.set("sr_analytics_session", session, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 30, path: "/" });
  return response;
}
