import { NextResponse, type NextRequest } from "next/server";
import { cashfreeRequest, type CashfreeOrder, type CashfreePayment, verifyCashfreeWebhook } from "@/lib/payments/cashfree";
import { createAdminClient } from "@/lib/supabase/admin";

type CashfreeWebhook = { data?: { order?: { order_id?: string; order_amount?: number; order_currency?: string }; payment?: { cf_payment_id?: string; payment_status?: string; payment_amount?: number; payment_currency?: string } } };

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  if (!verifyCashfreeWebhook(rawBody, request.headers.get("x-webhook-timestamp") || "", request.headers.get("x-webhook-signature") || "")) return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
  let event: CashfreeWebhook;
  try { event = JSON.parse(rawBody) as CashfreeWebhook; } catch { return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 }); }
  const orderId = event.data?.order?.order_id;
  const webhookPayment = event.data?.payment;
  if (!orderId || !webhookPayment?.cf_payment_id || webhookPayment.payment_status !== "SUCCESS") return NextResponse.json({ received: true });
  const admin = createAdminClient();
  const { data: transaction } = await admin.from("transactions").select("amount,status,payment_method").eq("provider_order_id", orderId).maybeSingle();
  if (!transaction || transaction.payment_method !== "cashfree" || transaction.status === "completed") return NextResponse.json({ received: true });
  try {
    const [order, payments] = await Promise.all([cashfreeRequest<CashfreeOrder>(`/orders/${encodeURIComponent(orderId)}`), cashfreeRequest<CashfreePayment[]>(`/orders/${encodeURIComponent(orderId)}/payments`)]);
    const payment = payments.find((item) => item.cf_payment_id === webhookPayment.cf_payment_id && item.payment_status === "SUCCESS" && item.is_captured !== false);
    const expectedAmount = Number(transaction.amount);
    if (!payment || order.order_status !== "PAID" || order.order_currency !== "INR" || Number(order.order_amount) !== expectedAmount || payment.payment_currency !== "INR" || Number(payment.payment_amount) !== expectedAmount || Number(payment.order_amount) !== expectedAmount) return NextResponse.json({ error: "Payment details mismatch" }, { status: 409 });
    const { error } = await admin.rpc("credit_wallet_payment_system", { p_provider_order_id: orderId, p_provider_payment_id: payment.cf_payment_id });
    if (error) return NextResponse.json({ error: "Wallet settlement failed" }, { status: 500 });
    return NextResponse.json({ received: true });
  } catch { return NextResponse.json({ error: "Webhook verification pending" }, { status: 503 }); }
}
