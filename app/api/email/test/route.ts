import { NextRequest, NextResponse } from "next/server";
import { sendEmailTest } from "@/lib/email/service";
export const runtime="nodejs";
export async function POST(request:NextRequest) { if(!process.env.CRON_SECRET || request.headers.get("authorization")!==`Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({error:"Unauthorized"},{status:401}); try{return NextResponse.json({status:"sent",providerMessageId:await sendEmailTest()});}catch(error){console.error("[email] test failed",{error:error instanceof Error?error.name:"unknown"});return NextResponse.json({error:"Test email failed"},{status:503});} }
