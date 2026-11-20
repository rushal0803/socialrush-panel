import { NextRequest, NextResponse } from "next/server";
import { consentDecision } from "@/lib/analytics/consent-authority";
import { consentRepository, consentEnvironment } from "@/lib/analytics/consent-runtime";
import { CONSENT_COOKIE, CHOICE_COOKIE } from "@/lib/analytics/privacy";
import { requireJson, rateLimit } from "@/lib/security/request";
export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin) return new NextResponse(null,{status:403});
  const error = requireJson(request,256) || rateLimit(request,"analytics-consent",20,60_000); if(error)return error;
  const body=await request.json().catch(()=>null);
  if(!body || !["granted","denied"].includes(body.choice))return new NextResponse(null,{status:422});
  const old=request.cookies.get(CONSENT_COOKIE)?.value;
  let result;
  try { result=await consentDecision(request,body.choice,old,consentRepository(),consentEnvironment()); }
  catch { return NextResponse.json({error:"Preference update could not be confirmed. Analytics remains stopped locally; retry withdrawal."},{status:503}); }
  const granted=result.choice==="granted";
  const response=NextResponse.json({choice:result.choice,confirmed:granted || result.reason!=="durable_adapter_unavailable"},{status:result.reason==="durable_adapter_unavailable"?503:200});
  response.headers.set("Cache-Control","no-store");
  response.cookies.set(CONSENT_COOKIE,granted?result.id!:"",{httpOnly:true,secure:true,sameSite:"strict",path:"/",maxAge:granted?86400:0});
  response.cookies.set(CHOICE_COOKIE,granted?"granted.v1":"denied.v1",{secure:true,sameSite:"lax",path:"/",maxAge:86400});
  response.cookies.set("sr_analytics_session","",{httpOnly:true,secure:true,sameSite:"lax",path:"/",maxAge:0});
  return response;
}
