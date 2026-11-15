import { shouldIgnoreAnalyticsCollection } from "@/lib/analytics/collection-environment";
import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { clientAnalyticsEvents } from "@/lib/analytics/events";
import { authorizeOptionalEvent } from "@/lib/analytics/consent-authority";
import { consentRepository, consentEnvironment } from "@/lib/analytics/consent-runtime";
import { CONSENT_COOKIE, analyticsPathBucket, coarseAttribution, privateSafeMetadata, productionCollectionAllowed } from "@/lib/analytics/privacy";
import { activeSmmServices } from "@/lib/smm-service-catalog";
import { requireJson, rateLimit } from "@/lib/security/request";

export async function POST(request: NextRequest) {
  // Deny before parsing, optional session allocation, auth or database access.
  if (shouldIgnoreAnalyticsCollection(request.nextUrl.hostname, process.env.VERCEL_ENV) || !productionCollectionAllowed(request.nextUrl.origin,consentEnvironment())) return new NextResponse(null,{status:204});
  const repo=consentRepository(); if(!repo)return new NextResponse(null,{status:204});
  if(request.headers.get("origin")!==request.nextUrl.origin)return new NextResponse(null,{status:403});
  const error=requireJson(request,8192)||rateLimit(request,"analytics",120,60_000);if(error)return error;
  const body=await request.json().catch(()=>null);
  if(!body || !clientAnalyticsEvents.includes(body.event))return new NextResponse(null,{status:204});
  try {
    const receipt=request.cookies.get(CONSENT_COOKIE)?.value;
    if(!await authorizeOptionalEvent(request,receipt,body.eventId,repo,consentEnvironment()))return new NextResponse(null,{status:204});
    const db=createAdminClient();
    const raw=body.attribution && typeof body.attribution==="object"?body.attribution:{};
    const attribution=coarseAttribution(raw);
    await db.from("analytics_events").insert({
      customer_id:null,event_id:"client:"+createHash("sha256").update(body.eventId).digest("hex"),
      event_name:body.event,anonymous_session_id:receipt,
      page_path:analyticsPathBucket(typeof body.pagePath==="string"?body.pagePath:"/other"),
      service_code:activeSmmServices.some(s=>s.code===body.serviceCode)?body.serviceCode:null,
      platform:["instagram","youtube","linkedin","facebook","tiktok","telegram","x"].includes(body.platform)?body.platform:null,
      package_id:null,device_category:request.headers.get("sec-ch-ua-mobile")==="?1"?"mobile":"unknown",
      browser_family:"unknown",screen_width_category:"unknown",source:attribution.source,medium:attribution.medium,
      campaign:null,content:null,term:null,referring_domain:null,
      safe_metadata:privateSafeMetadata(body.metadata && typeof body.metadata==="object"?body.metadata:{}),
    });
  } catch { /* Optional telemetry cannot block a customer action; no unsafe fallback. */ }
  const response=new NextResponse(null,{status:204});response.headers.set("Cache-Control","no-store");return response;
}
