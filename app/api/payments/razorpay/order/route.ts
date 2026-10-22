import { NextResponse } from "next/server";
import { RAZORPAY_NEW_PAYMENT_DISABLED_MESSAGE } from "@/lib/payments/gateway";

// Kept only as a compatibility endpoint for old URLs. It can never create a
// payment order; historical verification/webhooks remain separate and refunds are retired.
export async function POST() {
  return NextResponse.json({ error: RAZORPAY_NEW_PAYMENT_DISABLED_MESSAGE }, { status: 410 });
}
