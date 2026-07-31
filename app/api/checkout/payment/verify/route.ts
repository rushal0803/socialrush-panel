import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { razorpayConfig, razorpayRequest, verifyHmac } from "@/lib/payments/razorpay";
import { recordTrustedEvent } from "@/lib/analytics/server";

type RazorpayPayment = {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: string;
};

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null) as {
    checkoutPaymentId?: string;
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
  } | null;
  if (!body?.checkoutPaymentId || !body.razorpay_order_id || !body.razorpay_payment_id || !body.razorpay_signature) {
    return NextResponse.json({ error: "Incomplete checkout payment verification data." }, { status: 422 });
  }

  const admin = createAdminClient();
  const { data: checkoutPayment } = await admin
    .from("checkout_intent_payments")
    .select("id, user_id, provider_order_id, provider_payment_id, amount_paise, currency, status, order_id")
    .eq("id", body.checkoutPaymentId)
    .maybeSingle();
  if (!checkoutPayment || checkoutPayment.user_id !== user.id) {
    return NextResponse.json({ error: "Checkout payment not found." }, { status: 404 });
  }
  if (checkoutPayment.provider_order_id !== body.razorpay_order_id) {
    return NextResponse.json({ error: "Razorpay order mismatch." }, { status: 409 });
  }
  if (checkoutPayment.status === "completed") {
    if (checkoutPayment.provider_payment_id !== body.razorpay_payment_id) {
      return NextResponse.json({ error: "Checkout payment was already consumed." }, { status: 409 });
    }
    const { data: profile } = await admin.from("profiles").select("balance").eq("id", user.id).single();
    return NextResponse.json({ data: { orderId: checkoutPayment.order_id, balance: Number(profile?.balance ?? 0), duplicate: true } });
  }

  try {
    const { keySecret } = razorpayConfig();
    if (!verifyHmac(`${body.razorpay_order_id}|${body.razorpay_payment_id}`, body.razorpay_signature, keySecret)) {
      return NextResponse.json({ error: "Payment signature verification failed." }, { status: 400 });
    }
    const providerPayment = await razorpayRequest<RazorpayPayment>(`/payments/${encodeURIComponent(body.razorpay_payment_id)}`);
    const matches =
      providerPayment.id === body.razorpay_payment_id &&
      providerPayment.order_id === checkoutPayment.provider_order_id &&
      providerPayment.amount === Number(checkoutPayment.amount_paise) &&
      providerPayment.currency === checkoutPayment.currency &&
      providerPayment.status === "captured";
    if (!matches) return NextResponse.json({ error: "Captured payment details do not match this checkout." }, { status: 409 });

    const { data, error } = await admin.rpc("complete_checkout_intent_payment_system", {
      p_checkout_payment_id: checkoutPayment.id,
      p_provider_payment_id: providerPayment.id,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 409 });
    await recordTrustedEvent({eventName:"payment_successful",customerId:user.id,pagePath:"/dashboard/new-order",metadata:{method:"razorpay"}});

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/orders");
    revalidatePath("/dashboard/order-history");
    revalidatePath("/dashboard/wallet");
    return NextResponse.json({ data }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to verify checkout payment." }, { status: 503 });
  }
}
