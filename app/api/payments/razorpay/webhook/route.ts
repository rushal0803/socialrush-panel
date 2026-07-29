import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyHmac } from "@/lib/payments/razorpay";

type WebhookPayload = {
  event?: string;
  payload?: {
    payment?: {
      entity?: { id?: string; order_id?: string; amount?: number; currency?: string; status?: string };
    };
  };
};

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature") || "";
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "";
  if (!secret || !verifyHmac(rawBody, signature, secret)) return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
  let event: WebhookPayload;
  try {
    event = JSON.parse(rawBody) as WebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
  }

  const admin = createAdminClient();
  if (event.event === "payment.captured") {
    const payment = event.payload?.payment?.entity;
    if (payment?.order_id && payment.id) {
      const { data: checkoutPayment } = await admin
        .from("checkout_intent_payments")
        .select("id, amount_paise, currency")
        .eq("provider_order_id", payment.order_id)
        .maybeSingle();
      if (checkoutPayment) {
        if (
          payment.amount !== Number(checkoutPayment.amount_paise) ||
          payment.currency !== checkoutPayment.currency ||
          payment.status !== "captured"
        ) {
          return NextResponse.json({ error: "Checkout payment details mismatch" }, { status: 409 });
        }
        const { error } = await admin.rpc("complete_checkout_intent_payment_system", {
          p_checkout_payment_id: checkoutPayment.id,
          p_provider_payment_id: payment.id,
        });
        if (error) return NextResponse.json({ error: "Checkout settlement failed" }, { status: 500 });
        return NextResponse.json({ received: true });
      }
      const { error } = await admin.rpc("credit_wallet_payment_system", {
        p_provider_order_id: payment.order_id,
        p_provider_payment_id: payment.id,
      });
      if (error) return NextResponse.json({ error: "Wallet settlement failed" }, { status: 500 });
    }
  }
  if (event.event === "payment.failed") {
    const payment = event.payload?.payment?.entity;
    if (payment?.order_id) {
      const { data: checkoutPayment } = await admin
        .from("checkout_intent_payments")
        .select("id")
        .eq("provider_order_id", payment.order_id)
        .maybeSingle();
      if (checkoutPayment) {
        const { error } = await admin
          .from("checkout_intent_payments")
          .update({ status: "failed", provider_payment_id: payment.id || null, updated_at: new Date().toISOString() })
          .eq("id", checkoutPayment.id)
          .eq("status", "created");
        if (error) return NextResponse.json({ error: "Checkout payment status update failed" }, { status: 500 });
        return NextResponse.json({ received: true });
      }
      const { error } = await admin
        .from("transactions")
        .update({ status: "failed", provider_payment_id: payment.id || null })
        .eq("provider_order_id", payment.order_id)
        .eq("status", "pending");
      if (error) return NextResponse.json({ error: "Payment status update failed" }, { status: 500 });
    }
  }
  return NextResponse.json({ received: true });
}
