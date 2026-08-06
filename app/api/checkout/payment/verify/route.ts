import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { razorpayConfig, razorpayRequest, verifyHmac } from "@/lib/payments/razorpay";
import { recordTrustedEvent } from "@/lib/analytics/server";
import { requireJson, requireSameOrigin, rateLimit } from "@/lib/security/request";
import { recordIncident } from "@/lib/monitoring/incidents";

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
  const originError = requireSameOrigin(request); if (originError) return originError;
  const jsonError = requireJson(request); if (jsonError) return jsonError;
  const limited = rateLimit(request, "checkout-verify", 15, 60_000, user.id); if (limited) return limited;

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
      void recordIncident({ type: "razorpay_signature_verification", severity: "high", title: "Razorpay signature verification failed", summary: "A trusted checkout verification signature did not match.", source: "checkout_verify", fingerprint: `razorpay-signature:${body.checkoutPaymentId}`, relatedPaymentReference: body.razorpay_payment_id });
      return NextResponse.json({ error: "Payment signature verification failed." }, { status: 400 });
    }
    const providerPayment = await razorpayRequest<RazorpayPayment>(`/payments/${encodeURIComponent(body.razorpay_payment_id)}`);
    const matches =
      providerPayment.id === body.razorpay_payment_id &&
      providerPayment.order_id === checkoutPayment.provider_order_id &&
      providerPayment.amount === Number(checkoutPayment.amount_paise) &&
      providerPayment.currency === checkoutPayment.currency &&
      providerPayment.status === "captured";
    if (!matches) { void recordIncident({ type: "razorpay_payment_mismatch", severity: "critical", title: "Verified payment details mismatch", summary: "A captured payment did not match its expected checkout details.", source: "checkout_verify", fingerprint: `razorpay-mismatch:${checkoutPayment.id}`, relatedPaymentReference: body.razorpay_payment_id }); return NextResponse.json({ error: "Captured payment details do not match this checkout." }, { status: 409 }); }

    const { data, error } = await admin.rpc("complete_checkout_intent_payment_system", {
      p_checkout_payment_id: checkoutPayment.id,
      p_provider_payment_id: providerPayment.id,
    });
    if (error) { void recordIncident({ type: "verified_payment_without_order", severity: "critical", title: "Verified payment could not create an order", summary: "A verified checkout payment could not complete order creation and needs reconciliation.", source: "checkout_verify", fingerprint: `verified-payment-order:${checkoutPayment.id}`, relatedPaymentReference: providerPayment.id }); return NextResponse.json({ error: "Checkout settlement could not be completed." }, { status: 409 }); }
    await recordTrustedEvent({ eventName: "payment_completed", customerId: user.id, pagePath: "/dashboard/new-order", eventId: `payment:${providerPayment.id}`, metadata: { method: "razorpay", amount_minor: Number(checkoutPayment.amount_paise), currency: checkoutPayment.currency, checkout_intent_id: checkoutPayment.id } });
    const completed = data as { orderId?: string } | null;
    if (completed?.orderId) await recordTrustedEvent({ eventName: "order_created", customerId: user.id, pagePath: "/dashboard/new-order", eventId: `order:${completed.orderId}`, metadata: { order_id: completed.orderId, method: "razorpay" } });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/orders");
    revalidatePath("/dashboard/order-history");
    revalidatePath("/dashboard/wallet");
    return NextResponse.json({ data }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    void recordIncident({ type: "checkout_verification_error", severity: "high", title: "Checkout payment verification failed", summary: "The trusted checkout verification flow failed unexpectedly.", source: "checkout_verify", fingerprint: `checkout-verify:${body.checkoutPaymentId}`, relatedPaymentReference: body.razorpay_payment_id });
    return NextResponse.json({ error: "Unable to verify checkout payment." }, { status: 503 });
  }
}
