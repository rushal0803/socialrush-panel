import { consentRepository, consentEnvironment } from "@/lib/analytics/consent-runtime";
import { CONSENT_COOKIE, CONSENT_VERSION, productionCollectionAllowed, privacyOptOut } from "@/lib/analytics/privacy";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { recordTrustedEvent, type TrustedAnalyticsEvent } from "@/lib/analytics/server";
import { requireJson, requireSameOrigin, rateLimit } from "@/lib/security/request";

const allowed = new Set<TrustedAnalyticsEvent>(["sign_up_completed", "login_completed"]);
export async function POST(request: NextRequest) {
  const repo=consentRepository();
  if(!repo || !productionCollectionAllowed(request.nextUrl.origin,consentEnvironment()) || privacyOptOut(request.headers.get("dnt"),request.headers.get("sec-gpc")))return new NextResponse(null,{status:204});
  try {
    const receipt=request.cookies.get(CONSENT_COOKIE)?.value;
    const consent=receipt ? await repo.read(receipt):null;
    if(!consent || consent.choice!=="granted" || consent.version!==CONSENT_VERSION || consent.expiresAt<=Date.now() || !await repo.isPublicActivity(request))return new NextResponse(null,{status:204});
  } catch { return new NextResponse(null,{status:204}); }

  const originError = requireSameOrigin(request); if (originError) return originError;
  const jsonError = requireJson(request, 512); if (jsonError) return jsonError;
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return new NextResponse(null, { status: 204 });
  const limited = rateLimit(request, "analytics-auth", 10, 60_000, user.id); if (limited) return limited;
  const body = await request.json().catch(() => null) as { type?: TrustedAnalyticsEvent } | null;
  if (!body?.type || !allowed.has(body.type)) return new NextResponse(null, { status: 204 });
  await recordTrustedEvent({ eventName: body.type, customerId: user.id, pagePath: body.type === "login_completed" ? "/login" : "/register", eventId: `${body.type}:${user.id}:${new Date().toISOString().slice(0, 10)}` });
  return new NextResponse(null, { status: 204 });
}
