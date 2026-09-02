import { NextResponse } from "next/server";
import { handleResendWebhook, resendWebhookVerificationConfigured, verifyResendWebhook } from "@/lib/crm/resend";

export async function POST(request: Request) {
  if (!resendWebhookVerificationConfigured()) return NextResponse.json({ error: "Resend webhook processing is not configured." }, { status: 500 });
  const payload = await request.text();
  let event: { type?: string };
  try {
    event = verifyResendWebhook(payload, request.headers) as { type?: string };
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid Resend webhook." }, { status: 401 });
  }
  const eventId = request.headers.get("svix-id") || "";
  try {
    const result = await handleResendWebhook(event, eventId);
    if ("ignored" in result) return NextResponse.json(result, { status: 202 });
    if ("inProgress" in result) return NextResponse.json(result, { status: 500 });
    return NextResponse.json(result, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Resend webhook processing failed." }, { status: 500 });
  }
}
