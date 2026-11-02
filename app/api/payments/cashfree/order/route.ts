import { NextResponse } from "next/server";

// Cashfree is retired for new payments. Historical webhook reconciliation
// remains available at /api/payments/cashfree/webhook.
export async function POST() {
  return NextResponse.json(
    { error: "Cashfree payments are no longer available." },
    { status: 410 },
  );
}
