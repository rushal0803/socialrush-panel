import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { razorpayConfig, razorpayRequest } from "@/lib/payments/razorpay";
import { normalizePaymentMethod } from "@/lib/payments/methods";

type RazorpayOrder = { id: string; amount: number; currency: string; status: string };
const allowedMethods = ["upi", "card", "netbanking", "wallet"] as const;

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 const body = await request.json().catch(() => null) as {
  amount?: number;
  method?: string;
  paymentMethod?: string;
  payment_method?: string;
} | null;

const amount = Number(body?.amount);

const rawMethod =
  body?.method ??
  body?.paymentMethod ??
  body?.payment_method;
  const method = normalizePaymentMethod(rawMethod);
  console.log("wallet payment method raw:", rawMethod);
  console.log("wallet payment method normalized:", method);
  console.log("allowed wallet methods:", allowedMethods);
  if (!Number.isFinite(amount) || amount <= 0 || amount > 500000) return NextResponse.json({ error: "Enter an amount greater than ₹0 and up to ₹5,00,000" }, { status: 422 });
  if (!method) {
    return NextResponse.json(
      { error: "Unsupported payment method" },
      { status: 400 },
    );
  }
  const isStandardMethod = allowedMethods.includes(
    method as (typeof allowedMethods)[number],
  );
  if (!isStandardMethod && method !== "international_card") {
    return NextResponse.json(
      { error: "Unsupported payment method" },
      { status: 400 },
    );
  }
  if (
    method === "international_card" &&
    process.env.RAZORPAY_INTERNATIONAL_ENABLED !== "true"
  ) {
    return NextResponse.json(
      { error: "International payments are currently being activated. Please contact WhatsApp support." },
      { status: 409 },
    );
  }
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
