import { NextResponse } from "next/server";
import { handleResendWebhook, verifyResendWebhook } from "@/lib/crm/resend";

export async function POST(request: Request) {
  const payload = await request.text();
  try {
    const event = verifyResendWebhook(payload, request.headers) as { type?: string };
    const eventId = request.headers.get("svix-id") || "";
    const result = await handleResendWebhook(event, eventId);
    return NextResponse.json(result, { status: "ignored" in result ? 202 : 200 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid Resend webhook." }, { status: 401 });
  }
}
