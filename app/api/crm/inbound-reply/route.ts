import { NextResponse } from "next/server";
import { ingestInboundReply } from "@/lib/crm/reply-ingestion";
export const runtime="nodejs";
export async function POST(request:Request) {
  const secret=process.env.CRM_INBOUND_WEBHOOK_SECRET;
  if(!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({error:"Mailbox webhook is not configured."},{status:401});
  try { const body=await request.json(); const reply=await ingestInboundReply({provider:String(body.provider||""),messageId:String(body.messageId||""),threadId:body.threadId?String(body.threadId):null,fromEmail:String(body.fromEmail||""),toEmail:body.toEmail?String(body.toEmail):null,subject:body.subject?String(body.subject):null,bodyText:String(body.bodyText||""),receivedAt:body.receivedAt?String(body.receivedAt):null}); return NextResponse.json(reply,{status:reply.unmatched?202:200}); } catch { return NextResponse.json({error:"Invalid inbound reply."},{status:400}); }
}
