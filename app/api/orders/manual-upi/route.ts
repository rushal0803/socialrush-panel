import { requireActiveAccountApi } from "@/lib/security/active-account-api";
import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isUuid, requireJson, requireSameOrigin, rateLimit } from "@/lib/security/request";
import { recordTrustedEvent } from "@/lib/analytics/server";
import { isSameManualPayment } from "@/lib/payments/manual-payment-replay";

const UTR_PATTERN = /^[A-Za-z0-9-]{8,80}$/;
const PAYMENT_REF_PATTERN = /^SR-[A-Z0-9-]{8,40}$/;
const PAYMENT_METHODS = new Set(["upi", "bank_transfer", "usdt_trc20"]);

function replayConflict() {
  return NextResponse.json(
    { error: "This checkout was already submitted with different payment details. Please contact support." },
    { status: 409, headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await requireActiveAccountApi(supabase, user.id);
  if (denied) return denied;

  const originError = requireSameOrigin(request); if (originError) return originError;
  const jsonError = requireJson(request); if (jsonError) return jsonError;
  const limited = rateLimit(request, "manual-payment-order", 8, 60_000, user.id); if (limited) return limited;

  const body = await request.json().catch(() => null) as {
    intentId?: string; clientRequestId?: string; paymentReference?: string; paymentMethod?: string; utr?: string; expectedWalletApplied?: number;
  } | null;

  const intentId = String(body?.intentId || "").trim();
  const clientRequestId = String(body?.clientRequestId || "").trim();
  const paymentReference = String(body?.paymentReference || "").trim().toUpperCase();
  const paymentMethod = String(body?.paymentMethod || "upi").trim().toLowerCase();
  const utr = String(body?.utr || "").trim().replace(/\s+/g, "");
  const expectedWalletApplied = Number(body?.expectedWalletApplied ?? 0);

  if (!isUuid(intentId) || !isUuid(clientRequestId)) return NextResponse.json({ error: "Your checkout session is invalid. Please review the order and try again." }, { status: 422 });
  if (!PAYMENT_REF_PATTERN.test(paymentReference)) return NextResponse.json({ error: "Payment reference is invalid." }, { status: 422 });
  if (!PAYMENT_METHODS.has(paymentMethod)) return NextResponse.json({ error: "Unsupported payment method." }, { status: 422 });
  if (!UTR_PATTERN.test(utr)) return NextResponse.json({ error: "Enter a valid UTR / transaction ID from your successful payment." }, { status: 422 });
  if (!Number.isFinite(expectedWalletApplied) || expectedWalletApplied < 0) return NextResponse.json({ error: "Wallet amount is invalid. Please refresh checkout." }, { status: 422 });

  const admin = createAdminClient();
  const { data: intent, error: intentError } = await admin.from("checkout_intents").select("id,user_id,client_request_id,service_id,service_code,quantity,destination_link,package_name,notes,total_paise,currency,status,order_id,expires_at,client_id,campaign_id").eq("id", intentId).maybeSingle();
  if (intentError) return NextResponse.json({ error: "Unable to load checkout details." }, { status: 503 });
  if (!intent || intent.user_id !== user.id || intent.client_request_id !== clientRequestId) return NextResponse.json({ error: "Checkout details do not match this account." }, { status: 404 });
  if (intent.status === "completed" && intent.order_id) {
    const { data: existingOrder, error: replayError } = await admin.from("orders").select("id,public_order_id,status,payment_status,customer_note").eq("id", intent.order_id).eq("user_id", user.id).maybeSingle();
    if (replayError) return NextResponse.json({ error: "Unable to verify the existing checkout." }, { status: 503 });
    if (!existingOrder || !isSameManualPayment(existingOrder, paymentReference, utr, paymentMethod)) return replayConflict();
    const { customer_note: _note, ...safeOrder } = existingOrder;
    return NextResponse.json({ data: safeOrder, duplicate: true }, { headers: { "Cache-Control": "no-store" } });
  }
  if (intent.status !== "created" || new Date(intent.expires_at).getTime() <= Date.now()) return NextResponse.json({ error: "This checkout session has expired. Please review the order again." }, { status: 409 });
  if (intent.currency !== "INR" || Number(intent.total_paise) <= 0) return NextResponse.json({ error: "Checkout amount is invalid." }, { status: 409 });

  if (intent.client_id) {
    const { data: client } = await admin.from("customer_clients").select("id").eq("id", intent.client_id).eq("user_id", user.id).maybeSingle();
    if (!client) return NextResponse.json({ error: "This client workspace is no longer available." }, { status: 409 });
  }
  if (intent.campaign_id) {
    const { data: campaign } = await admin.from("campaigns").select("id,client_id").eq("id", intent.campaign_id).eq("user_id", user.id).maybeSingle();
    if (!campaign) return NextResponse.json({ error: "This campaign workspace is no longer available." }, { status: 409 });
    if (campaign.client_id && intent.client_id && campaign.client_id !== intent.client_id) return NextResponse.json({ error: "The checkout client and campaign no longer match." }, { status: 409 });
  }

  const { data: service } = await admin.from("services").select("id,name,platform,rate,min,max,status,is_active,accepts_new_orders,health_status").eq("id", intent.service_id).maybeSingle();
  if (!service || service.status !== "active" || service.accepts_new_orders === false || service.health_status === "paused") return NextResponse.json({ error: "This service is temporarily unavailable. Please contact support before paying again." }, { status: 409 });

  const { data: existingByRequest, error: existingByRequestError } = await admin.from("orders").select("id,public_order_id,status,payment_status,customer_note").eq("user_id", user.id).eq("client_request_id", clientRequestId).maybeSingle();
  if (existingByRequestError) return NextResponse.json({ error: "Unable to verify the existing checkout." }, { status: 503 });
  if (existingByRequest) {
    if (!isSameManualPayment(existingByRequest, paymentReference, utr, paymentMethod)) return replayConflict();
    const { customer_note: _note, ...safeOrder } = existingByRequest;
    return NextResponse.json({ data: safeOrder, duplicate: true }, { headers: { "Cache-Control": "no-store" } });
  }

  const { data: existingUtr, error: duplicateUtrError } = await admin.from("orders").select("id,user_id,public_order_id,client_request_id,status,payment_status,customer_note").ilike("customer_note", `%UTR: ${utr}.%`).limit(1).maybeSingle();
  if (duplicateUtrError) return NextResponse.json({ error: "Unable to verify this transaction ID right now. Please try again." }, { status: 503 });
  if (existingUtr) {
    if (existingUtr.user_id === user.id && existingUtr.client_request_id === clientRequestId) {
      if (!isSameManualPayment(existingUtr, paymentReference, utr, paymentMethod)) return replayConflict();
      const { customer_note: _note, user_id: _userId, client_request_id: _clientRequestId, ...safeOrder } = existingUtr;
      return NextResponse.json({ data: safeOrder, duplicate: true }, { headers: { "Cache-Control": "no-store" } });
    }
    return NextResponse.json({ error: "This UTR / Transaction ID has already been submitted for another order." }, { status: 409 });
  }
  const { data: existingWalletPayment, error: existingWalletPaymentError } = await admin.from("transactions").select("id").eq("provider_payment_id", utr).maybeSingle();
  if (existingWalletPaymentError) return NextResponse.json({ error: "Unable to verify this transaction ID right now. Please try again." }, { status: 503 });
  if (existingWalletPayment) return NextResponse.json({ error: "This UTR / Transaction ID has already been submitted for a wallet payment." }, { status: 409 });

  // A single database transaction now applies wallet funds, inserts the
  // verification-pending order and completes the intent together. If any
  // operation fails, PostgreSQL rolls back the wallet movement as well.
  const { data: submission, error: submitError } = await admin.rpc("submit_manual_payment_order_atomic", {
    p_user_id: user.id,
    p_intent_id: intentId,
    p_client_request_id: clientRequestId,
    p_payment_reference: paymentReference,
    p_payment_method: paymentMethod,
    p_utr: utr,
    p_expected_wallet: expectedWalletApplied,
  });
  if (submitError) {
    const message = String(submitError.message || "").toLowerCase();
    const stale = message.includes("wallet balance changed");
    const conflict = stale || message.includes("already") || message.includes("expired") ||
      message.includes("requires manual reconciliation") || message.includes("wallet covers full order") ||
      message.includes("unavailable") || message.includes("mismatch");
    const feedback = stale
      ? "Your wallet balance changed. Please return to checkout and refresh the payment amount before paying."
      : message.includes("requires manual reconciliation")
        ? "A previous wallet deduction needs support review. No additional wallet balance was deducted."
        : message.includes("wallet covers full order")
          ? "Your wallet covers the full order. Please return to checkout and use wallet-only payment."
          : conflict ? "Your checkout details changed or the payment reference was already used. Please review your order."
            : "Unable to submit payment for verification. No new wallet deduction was made.";
    return NextResponse.json({ error: feedback }, { status: conflict ? 409 : 503 });
  }
  const saved = submission as {
    id: string; public_order_id: string; status: string; payment_status: string;
    wallet_applied?: number; remaining?: number; duplicate?: boolean;
  } | null;
  if (!saved?.id) return NextResponse.json({ error: "Unable to confirm order submission." }, { status: 503 });
  const order = { id: saved.id, public_order_id: saved.public_order_id, status: saved.status, payment_status: saved.payment_status };
  const walletApplied = Number(saved.wallet_applied ?? 0);
  const remaining = Number(saved.remaining ?? (Number(intent.total_paise) / 100 - walletApplied));
  const charge = Number(intent.total_paise) / 100;
  if (saved.duplicate) return NextResponse.json({ data: order, duplicate: true }, { headers: { "Cache-Control": "no-store" } });
  revalidatePath("/dashboard/orders"); revalidatePath(`/dashboard/orders/${order.id}`); revalidatePath("/admin/orders");
  await recordTrustedEvent({ eventName: "order_created", customerId: user.id, pagePath: "/dashboard/direct-upi", eventId: `manual-payment-order:${order.id}`, metadata: { order_id: order.id, method: paymentMethod, currency: "INR", service_code: intent.service_code, platform: service.platform, value: charge, wallet_applied: walletApplied, external_payment: remaining, payment_status: "verification_pending" } });
  return NextResponse.json({ data: order, duplicate: false, payment: { orderTotal: charge, walletApplied, remaining } }, { status: 201, headers: { "Cache-Control": "no-store" } });
}
