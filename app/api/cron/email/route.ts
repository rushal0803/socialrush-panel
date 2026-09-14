import { NextRequest, NextResponse } from "next/server";
import { processCustomerEmailEvents } from "@/lib/email/service";

export const runtime="nodejs";
export const dynamic="force-dynamic";

function supabaseProjectRef(){
 try {
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  if(!url)return null;
  return new URL(url).hostname.split(".")[0]||null;
 } catch {
  return null;
 }
}

export async function GET(request:NextRequest) {
 if(!process.env.CRON_SECRET || request.headers.get("authorization")!==`Bearer ${process.env.CRON_SECRET}`) {
  return NextResponse.json({error:"Unauthorized"},{status:401});
 }
 try {
  const result=await processCustomerEmailEvents(5);
  return NextResponse.json({status:"ok",projectRef:supabaseProjectRef(),...result});
 } catch(error) {
  console.error("[email] cron failed",{error:error instanceof Error?error.message:"unknown"});
  return NextResponse.json({error:"Email processing failed",projectRef:supabaseProjectRef()},{status:503});
 }
}
