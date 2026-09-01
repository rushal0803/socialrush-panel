import { randomUUID } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { CashfreeApiError, cashfreeMode, cashfreeRequest, type CashfreeOrder } from "@/lib/payments/cashfree";
import { cashfreeCustomerPhone } from "@/lib/payments/cashfree-customer";
import { calculateServiceTotalPaise, validateQuantity, type ServiceCode } from "@/lib/service-pricing";
import { getServiceById } from "@/lib/smm-service-catalog";
import { requireJson, requireSameOrigin, isUuid, rateLimit } from "@/lib/security/request";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const liveCatalogServiceCodes = new Set<ServiceCode>(["instagram-followers", "instagram-saves", "instagram-shares", "youtube-comments", "linkedin-followers", "x-followers"]);

function cashfreeAppBaseUrl() {
  const value = process.env.CASHFREE_APP_BASE_URL;
  if (!value) throw new Error("Cashfree application base URL is not configured");
  const url = new URL(value);
  if (url.protocol !== "https:") throw new Error("Cashfree application base URL must use HTTPS");
  if (process.env.VERCEL_ENV === "production" && url.origin !== "https://www.getsocialrush.com") {
    throw new Error("Cashfree production return URL must use the canonical site domain");
  }
  return url.origin;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const originError = requireSameOrigin(request); if (originError) return originError;
  const jsonError = requireJson(request); if (jsonError) return jsonError;
  const limited = rateLimit(request, "cashfree-order-checkout", 8, 60_000, user.id); if (limited) return limited;

  const body = await request.json().catch(() => null) as { intentId?: string; returnPath?: string } | null;
  if (!isUuid(body?.intentId)) return NextResponse.json({ error: "A valid checkout intent is required." }, { status: 422 });
  const returnPath = body?.returnPath;
  if (returnPath !== undefined && (!returnPath.startsWith("/dashboard/") || returnPath.startsWith("//"))) {
    return NextResponse.json({ error: "Invalid checkout return path." }, { status: 422 });
  }

  const admin = createAdminClient();
  const { data: intent } = await admin.from("checkout_intents")
    .select("id,user_id,service_id,service_code,quantity,destination_link,total_paise,currency,status,expires_at")
    .eq("id", body.intentId).maybeSingle();
  if (!intent || intent.user_id !== user.id) return NextResponse.json({ error: "Checkout intent not found." }, { status: 404 });
  if (intent.status !== "created" || new Date(intent.expires_at).getTime() <= Date.now()) {
    return NextResponse.json({ error: "This checkout intent is no longer available." }, { status: 409 });
  }
  if (intent.currency !== "INR") return NextResponse.json({ error: "Checkout currency is invalid." }, { status: 409 });

  const service = getServiceById(intent.service_code);
  const isLiveCatalogService = Boolean(service && liveCatalogServiceCodes.has(service.code));
  if (!service || (!service.isActive && !isLiveCatalogService)) return NextResponse.json({ error: "The saved checkout details are no longer valid. Please review your order." }, { status: 409 });
  const { data: databaseService } = await admin.from("services")
    .select("id,rate,min,max,accepts_new_orders,health_status,status")
    .eq("id", intent.service_id).maybeSingle();
  if (!databaseService || databaseService.status !== "active" || !databaseService.accepts_new_orders || databaseService.health_status === "paused") {
    return NextResponse.json({ error: "This service is temporarily unavailable. Please choose another service." }, { status: 409 });
  }
  const quantityError = isLiveCatalogService
    ? validateQuantity(Number(intent.quantity), { minQuantity: Number(databaseService.min), maxQuantity: Number(databaseService.max) })
    : validateQuantity(Number(intent.quantity), service);
  const recalculatedTotalPaise = isLiveCatalogService
    ? Math.round((Number(intent.quantity) * Number(databaseService.rate) * 100) / 1000)
    : calculateServiceTotalPaise(service.code as ServiceCode, Number(intent.quantity));
  if (quantityError || recalculatedTotalPaise <= 0 || recalculatedTotalPaise !== Number(intent.total_paise)) {
    return NextResponse.json({ error: "The saved checkout details are no longer valid. Please review your order." }, { status: 409 });
  }
  const { data: profile } = await admin.from("profiles").select("balance,phone").eq("id", user.id).maybeSingle();
  const phone = cashfreeCustomerPhone(profile?.phone);
  const walletBalancePaise = Math.max(Math.round(Number(profile?.balance || 0) * 100), 0);
  const requiredTopUpPaise = Math.max(recalculatedTotalPaise - walletBalancePaise, 0);
  if (requiredTopUpPaise === 0) return NextResponse.json({ error: "Your wallet already covers this order.", code: "WALLET_SUFFICIENT" }, { status: 409 });
  const appBaseUrl = cashfreeAppBaseUrl();
  const callback = new URL("/api/checkout/cashfree/return", appBaseUrl);
  callback.searchParams.set("order_id", "{order_id}");
  callback.searchParams.set("return_path", returnPath || "/dashboard/new-order");
  const returnUrl = callback.toString().replace("%7Border_id%7D", "{order_id}");

  const { data: existing } = await admin.from("cashfree_checkout_intent_payments")
    .select("provider_order_id,payment_session_id,status,required_top_up_paise")
    .eq("checkout_intent_id", intent.id).in("status", ["created", "pending"]).maybeSingle();
  if (existing) {
    if (existing.status === "pending" && existing.payment_session_id) {
      return NextResponse.json({ data: { orderId: existing.provider_order_id, paymentSessionId: existing.payment_session_id, returnUrl, amountPaise: Number(existing.required_top_up_paise), environment: cashfreeMode(), duplicate: true } });
    }
    return NextResponse.json({ error: "A payment is already being initialized for this checkout. Please wait before retrying." }, { status: 409 });
  }

  const { data: latestAttempt } = await admin.from("cashfree_checkout_intent_payments")
    .select("attempt_number,status").eq("checkout_intent_id", intent.id)
    .order("attempt_number", { ascending: false }).limit(1).maybeSingle();
  if (latestAttempt?.status === "completed") return NextResponse.json({ error: "This checkout was already completed." }, { status: 409 });

  const providerOrderId = `src_${randomUUID().replaceAll("-", "")}`;
  const { error: reservationError } = await admin.from("cashfree_checkout_intent_payments").insert({
    checkout_intent_id: intent.id, user_id: user.id, order_total_paise: recalculatedTotalPaise,
    wallet_balance_paise: walletBalancePaise, required_top_up_paise: requiredTopUpPaise,
    provider_order_id: providerOrderId, attempt_number: Number(latestAttempt?.attempt_number || 0) + 1, status: "created",
  });
  if (reservationError) {
    console.error("[CASHFREE_RESERVATION_ERROR]", {
      code: reservationError.code,
      message: reservationError.message,
      details: reservationError.details,
      hint: reservationError.hint,
    });
    if (reservationError.code === "23505") return NextResponse.json({ error: "A payment is already being initialized for this checkout. Please wait before retrying." }, { status: 409 });
    return NextResponse.json({ error: "Unable to prepare secure payment." }, { status: 503 });
  }

  try {
    const order = await cashfreeRequest<CashfreeOrder>("/orders", {
      method: "POST",
      headers: { "x-idempotency-key": providerOrderId },
      body: JSON.stringify({
        order_id: providerOrderId, order_amount: requiredTopUpPaise / 100, order_currency: "INR",
        customer_details: { customer_id: user.id, customer_email: user.email || undefined, customer_phone: phone },
        order_meta: { return_url: returnUrl, notify_url: new URL("/api/payments/cashfree/webhook", appBaseUrl).toString() },
        order_note: "SocialRUSH order balance payment", order_tags: { user_id: user.id, checkout_intent_id: intent.id },
      }),
    });
    if (order.order_id !== providerOrderId || order.order_currency !== "INR" || Number(order.order_amount) !== requiredTopUpPaise / 100 || !order.payment_session_id) throw new Error("Unexpected Cashfree order response");
    const { error: updateError } = await admin.from("cashfree_checkout_intent_payments")
      .update({ payment_session_id: order.payment_session_id, status: "pending", updated_at: new Date().toISOString() })
      .eq("checkout_intent_id", intent.id).eq("status", "created");
    if (updateError) throw updateError;
    return NextResponse.json({ data: { orderId: providerOrderId, paymentSessionId: order.payment_session_id, returnUrl, amountPaise: requiredTopUpPaise, environment: cashfreeMode(), duplicate: false } }, { status: 201 });
  } catch (error) {
    if (error instanceof CashfreeApiError) console.error("Cashfree direct checkout creation failed", { status: error.status, requestId: error.requestId });
    else console.error("Cashfree direct checkout creation failed", error);
    // Preserve the reservation on any ambiguous provider/network failure so a
    // retry cannot silently create a second payment for the same intent.
    return NextResponse.json({ error: "Unable to initialize secure payment. Please wait before retrying." }, { status: 503 });
  }
}
