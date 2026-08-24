import { NextRequest, NextResponse } from "next/server";
import { processCustomerEmailEvents } from "@/lib/email/service";
export const runtime="nodejs"; export const dynamic="force-dynamic";
export async function GET(request:NextRequest) { if(!process.env.CRON_SECRET || request.headers.get("authorization")!==`Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({error:"Unauthorized"},{status:401}); try { return NextResponse.json({status:"ok",processed:await processCustomerEmailEvents()}); } catch(error) { console.error("[email] cron failed",{error:error instanceof Error?error.name:"unknown"}); return NextResponse.json({error:"Email processing failed"},{status:503}); } }
