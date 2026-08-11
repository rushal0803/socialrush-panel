import { NextResponse, type NextRequest } from "next/server";
import { cashfreeRequest, type CashfreeOrder, type CashfreePayment } from "@/lib/payments/cashfree";
import { recordTrustedEvent } from "@/lib/analytics/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null) as { orderId?: string } | null;
  const orderId = body?.orderId;
  if (!orderId || !/^srw_[a-f0-9]{32}$/.test(orderId)) return NextResponse.json({ error: "Invalid payment reference." }, { status: 422 });
  const { data: transaction } = await supabase.from("transactions").select("amount,status,payment_method").eq("provider_order_id", orderId).eq("user_id", user.id).maybeSingle();
  if (!transaction || transaction.payment_method !== "cashfree") return NextResponse.json({ error: "We could not find this Cashfree payment for your account." }, { status: 404 });
  if (transaction.status === "completed") return NextResponse.json({ data: { status: "success", balance: null, paymentId: null } });
  if (transaction.status !== "pending") return NextResponse.json({ data: { status: "failed" } });
  try {
    const [order, payments] = await Promise.all([
      cashfreeRequest<CashfreeOrder>(`/orders/${encodeURIComponent(orderId)}`),
      cashfreeRequest<CashfreePayment[]>(`/orders/${encodeURIComponent(orderId)}/payments`),
    ]);
    const payment = payments.find((item) => item.payment_status === "SUCCESS" && item.is_captured !== false);
    if (!payment || order.order_status !== "PAID") return NextResponse.json({ data: { status: order.order_status === "ACTIVE" ? "pending" : "failed" } });
    const expectedAmount = Number(transaction.amount);
    if (order.order_id !== orderId || order.order_currency !== "INR" || Number(order.order_amount) !== expectedAmount || payment.order_id !== orderId || payment.payment_currency !== "INR" || payment.order_currency !== "INR" || Number(payment.order_amount) !== expectedAmount || Number(payment.payment_amount) !== expectedAmount) return NextResponse.json({ error: "Payment details did not match the pending wallet funding request." }, { status: 409 });
    const { data: balance, error } = await supabase.rpc("credit_verified_payment", { p_provider_order_id: orderId, p_provider_payment_id: payment.cf_payment_id });
    if (error) return NextResponse.json({ error: "Payment confirmation is delayed. Do not pay again; check Wallet shortly." }, { status: 409 });
    await recordTrustedEvent({ eventName: "payment_completed", customerId: user.id, pagePath: "/dashboard/add-funds", eventId: `cashfree_payment:${payment.cf_payment_id}`, metadata: { method: "cashfree" } });
    await recordTrustedEvent({ eventName: "wallet_topup_completed", customerId: user.id, pagePath: "/dashboard/wallet", eventId: `cashfree_wallet_credit:${payment.cf_payment_id}`, metadata: { method: "cashfree" } });
    return NextResponse.json({ data: { status: "success", balance, paymentId: payment.cf_payment_id } });
  } catch {
    return NextResponse.json({ data: { status: "pending" } });
  }
}
