import { shouldIgnoreAnalyticsCollection } from "@/lib/analytics/collection-environment";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
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
    const db=await createClient();
    const raw=body.attribution && typeof body.attribution==="object"?body.attribution:{};
    const attribution=coarseAttribution(raw);
    await db.rpc("record_analytics_event",{
      p_event_name:body.event,p_session_id:receipt,
      p_page_path:analyticsPathBucket(typeof body.pagePath==="string"?body.pagePath:"/other"),
      p_service_code:activeSmmServices.some(s=>s.code===body.serviceCode)?body.serviceCode:null,
      p_platform:["instagram","youtube","linkedin","facebook","tiktok","telegram","x"].includes(body.platform)?body.platform:null,
      p_package_id:null,p_device_category:request.headers.get("sec-ch-ua-mobile")==="?1"?"mobile":"unknown",
      p_browser_family:"unknown",p_screen_width_category:"unknown",p_source:attribution.source,p_medium:attribution.medium,
      p_campaign:null,p_content:null,p_term:null,p_referring_domain:null,
      p_metadata:privateSafeMetadata(body.metadata && typeof body.metadata==="object"?body.metadata:{}),
    });
  } catch { /* Optional telemetry cannot block a customer action; no unsafe fallback. */ }
  const response=new NextResponse(null,{status:204});response.headers.set("Cache-Control","no-store");return response;
}
