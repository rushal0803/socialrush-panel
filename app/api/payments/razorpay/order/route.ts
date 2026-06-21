import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { razorpayConfig, razorpayRequest } from "@/lib/payments/razorpay";

type RazorpayOrder = { id: string; amount: number; currency: string; status: string };

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null) as { amount?: number; method?: string } | null;
  const amount = Number(body?.amount); const method = String(body?.method || "razorpay");
  if (!Number.isFinite(amount) || amount < 100 || amount > 500000) return NextResponse.json({ error: "Enter an amount between ₹100 and ₹5,00,000" }, { status: 422 });
  try {
    const { keyId } = razorpayConfig();
    const order = await razorpayRequest<RazorpayOrder>("/orders", { method: "POST", body: JSON.stringify({ amount: Math.round(amount * 100), currency: "INR", receipt: `wallet_${user.id.slice(0, 8)}_${Date.now()}`, notes: { user_id: user.id, payment_method: method } }) });
    const { data: transactionId, error } = await supabase.rpc("create_wallet_payment", { p_amount: amount, p_method: method, p_provider_order_id: order.id });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ data: { keyId, orderId: order.id, amount: order.amount, currency: order.currency, transactionId, email: user.email } }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to initialize payment" }, { status: 503 });
  }
}
