import { NextResponse } from "next/server";
import { RAZORPAY_NEW_PAYMENT_DISABLED_MESSAGE } from "@/lib/payments/gateway";

// Kept only as a compatibility endpoint for old URLs. It can never create a
// payment order; historical verification, webhook, and refund routes remain separate.
export async function POST() {
  return NextResponse.json({ error: RAZORPAY_NEW_PAYMENT_DISABLED_MESSAGE }, { status: 410 });
}
