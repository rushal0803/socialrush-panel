import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { razorpayRequest } from "@/lib/payments/razorpay";
import { RAZORPAY_NEW_PAYMENT_DISABLED_MESSAGE } from "@/lib/payments/gateway";

type RazorpayPaymentList = {
  items?: Array<{ id: string; order_id: string; amount: number; currency: string; status: string }>;
};

// Reads are retained solely to reconcile checkout payments created before the
// Cashfree-only policy. POST used to create Razorpay orders and is now blocked.
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const intentId = request.nextUrl.searchParams.get("intentId");
  if (!intentId) return NextResponse.json({ error: "Checkout intent is required." }, { status: 422 });
  const { data, error } = await supabase
    .from("checkout_intent_payments")
    .select("id, checkout_intent_id, provider_order_id, amount_paise, currency, status, order_id, return_url")
    .eq("checkout_intent_id", intentId)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!data) return NextResponse.json({ error: "Checkout payment not found." }, { status: 404 });

  if (data.status === "created") {
    try {
      const providerPayments = await razorpayRequest<RazorpayPaymentList>(`/orders/${encodeURIComponent(data.provider_order_id)}/payments`);
      const captured = providerPayments.items?.find((payment) =>
        payment.order_id === data.provider_order_id && payment.amount === Number(data.amount_paise) &&
        payment.currency === data.currency && payment.status === "captured",
      );
      if (captured) {
        const admin = createAdminClient();
        const { data: completed, error: completionError } = await admin.rpc(
          "complete_checkout_intent_payment_system", { p_checkout_payment_id: data.id, p_provider_payment_id: captured.id },
        );
        if (!completionError) {
          const result = completed as { orderId?: string } | null;
          return NextResponse.json({ data: {
            id: data.id, intentId: data.checkout_intent_id, amount: Number(data.amount_paise) / 100,
            amountPaise: Number(data.amount_paise), currency: data.currency, status: "completed",
            orderId: result?.orderId, returnUrl: data.return_url,
          } }, { headers: { "Cache-Control": "no-store" } });
        }
      }
    } catch {
      // Historical status reads remain available if Razorpay is unreachable.
    }
  }

  return NextResponse.json({ data: {
    id: data.id, intentId: data.checkout_intent_id, amount: Number(data.amount_paise) / 100,
    amountPaise: Number(data.amount_paise), currency: data.currency, status: data.status,
    orderId: data.order_id, returnUrl: data.return_url,
  } }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST() {
  return NextResponse.json({ error: RAZORPAY_NEW_PAYMENT_DISABLED_MESSAGE }, { status: 410 });
}
