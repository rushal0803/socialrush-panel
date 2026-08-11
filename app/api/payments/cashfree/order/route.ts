import { randomUUID } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { CashfreeApiError, cashfreeMode, cashfreeRequest, type CashfreeOrder } from "@/lib/payments/cashfree";
import { normalizePaymentMethod } from "@/lib/payments/methods";
import { createClient } from "@/lib/supabase/server";

function siteUrl(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const isPreview = process.env.VERCEL_ENV === "preview";
  if (isPreview && requestUrl.hostname.endsWith(".vercel.app")) {
    return requestUrl.origin;
  }

  const value = process.env.CASHFREE_APP_BASE_URL;
  if (!value) throw new Error("Cashfree application base URL is not configured");
  const url = new URL(value);
  if (url.protocol !== "https:") throw new Error("Cashfree application base URL must use HTTPS");
  if (process.env.VERCEL_ENV === "production" && url.origin !== "https://www.getsocialrush.com") {
    throw new Error("Cashfree production return URL must use the canonical site domain");
  }
  return url.origin;
}

function cashfreePhone(phone: string | null | undefined) {
  const digits = (phone || "").replace(/\D/g, "");
  // Cashfree's India checkout accepts a ten-digit customer phone number.
  return /^\d{10}$/.test(digits) ? digits : null;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null) as { amount?: number; method?: string; paymentMethod?: string; payment_method?: string; returnTo?: string } | null;
  const amount = Number(body?.amount);
  const method = normalizePaymentMethod(body?.method ?? body?.paymentMethod ?? body?.payment_method);
  if (!Number.isFinite(amount) || amount <= 0 || amount > 500000) return NextResponse.json({ error: "Enter an amount greater than ₹0 and up to ₹5,00,000" }, { status: 422 });
  if (!method || method === "wallet") return NextResponse.json({ error: "Choose UPI, card, or Net Banking for Cashfree checkout." }, { status: 400 });
  if (method === "international_card" && process.env.CASHFREE_INTERNATIONAL_ENABLED !== "true") return NextResponse.json({ error: "International Cashfree payments are not enabled for this account." }, { status: 409 });

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("phone")
    .eq("id", user.id)
    .maybeSingle();
  if (profileError) return NextResponse.json({ error: "Unable to load your account details. Please try again shortly." }, { status: 503 });
  const phone = cashfreePhone(profile?.phone);
  if (!phone) {
    return NextResponse.json({ error: "Add a valid 10-digit Indian mobile number in Account before using Cashfree." }, { status: 422 });
  }

  const orderId = `srw_${randomUUID().replaceAll("-", "")}`;
  try {
    const appBaseUrl = siteUrl(request);
    const returnUrl = new URL("/dashboard/add-funds", appBaseUrl);
    returnUrl.searchParams.set("cashfree_order_id", orderId);
    if (body?.returnTo?.startsWith("/") && !body.returnTo.startsWith("//")) returnUrl.searchParams.set("returnTo", body.returnTo);
    const order = await cashfreeRequest<CashfreeOrder>("/orders", {
      method: "POST",
      headers: { "x-idempotency-key": randomUUID() },
      body: JSON.stringify({
        order_id: orderId,
        order_amount: Number(amount.toFixed(2)),
        order_currency: "INR",
        customer_details: { customer_id: user.id, customer_email: user.email || undefined, customer_phone: phone },
        order_meta: { return_url: returnUrl.toString(), notify_url: new URL("/api/payments/cashfree/webhook", appBaseUrl).toString() },
        order_note: "SocialRUSH wallet funding",
        order_tags: { user_id: user.id, funding_method: method },
      }),
    });
    if (order.order_id !== orderId || order.order_currency !== "INR" || Number(order.order_amount) !== Number(amount.toFixed(2)) || !order.payment_session_id) throw new Error("Unexpected Cashfree order response");
    const { data: transactionId, error } = await supabase.rpc("create_wallet_payment", { p_amount: amount, p_method: "cashfree", p_provider_order_id: orderId });
    if (error) return NextResponse.json({ error: "Unable to create a pending wallet payment. Please try again shortly." }, { status: 400 });
    return NextResponse.json({ data: { orderId, paymentSessionId: order.payment_session_id, transactionId, environment: cashfreeMode() } }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Cashfree is not configured") {
      return NextResponse.json({ error: "Cashfree wallet payments are not configured. Please try again later." }, { status: 503 });
    }
    if (error instanceof CashfreeApiError) {
      console.error("Cashfree order creation failed", {
        status: error.status,
        requestId: error.requestId,
        response: error.response,
      });
    } else {
      console.error("Cashfree order creation failed", error);
    }
    return NextResponse.json({ error: "Unable to create a secure Cashfree payment right now. Please try again shortly." }, { status: 503 });
  }
}
