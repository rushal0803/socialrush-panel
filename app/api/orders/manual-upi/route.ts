import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isUuid, requireJson, requireSameOrigin, rateLimit } from "@/lib/security/request";
import { recordTrustedEvent } from "@/lib/analytics/server";

const UTR_PATTERN = /^[A-Za-z0-9-]{8,80}$/;
const PAYMENT_REF_PATTERN = /^SR-[A-Z0-9-]{8,40}$/;
const PAYMENT_METHODS = new Set(["upi", "bank_transfer", "usdt_trc20"]);

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const originError = requireSameOrigin(request); if (originError) return originError;
  const jsonError = requireJson(request); if (jsonError) return jsonError;
  const limited = rateLimit(request, "manual-payment-order", 8, 60_000, user.id); if (limited) return limited;

  const body = await request.json().catch(() => null) as {
    intentId?: string;
    clientRequestId?: string;
    paymentReference?: string;
    paymentMethod?: string;
    utr?: string;
    expectedWalletApplied?: number;
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
    const { data: existingOrder } = await admin.from("orders").select("id,public_order_id,status,payment_status").eq("id", intent.order_id).eq("user_id", user.id).maybeSingle();
    if (existingOrder) return NextResponse.json({ data: existingOrder, duplicate: true });
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

  const { data: existingByRequest } = await admin.from("orders").select("id,public_order_id,status,payment_status").eq("user_id", user.id).eq("client_request_id", clientRequestId).maybeSingle();
  if (existingByRequest) return NextResponse.json({ data: existingByRequest, duplicate: true });

  const { data: existingUtr, error: duplicateUtrError } = await admin.from("orders").select("id,user_id,public_order_id,client_request_id").ilike("customer_note", `%UTR: ${utr}.%`).limit(1).maybeSingle();
  if (duplicateUtrError) return NextResponse.json({ error: "Unable to verify this transaction ID right now. Please try again." }, { status: 503 });
  if (existingUtr) {
    if (existingUtr.user_id === user.id && existingUtr.client_request_id === clientRequestId) return NextResponse.json({ data: existingUtr, duplicate: true });
    return NextResponse.json({ error: "This UTR / Transaction ID has already been submitted for another order." }, { status: 409 });
  }
  const { data: existingWalletPayment, error: existingWalletPaymentError } = await admin.from("transactions").select("id").eq("provider_payment_id", utr).maybeSingle();
  if (existingWalletPaymentError) return NextResponse.json({ error: "Unable to verify this transaction ID right now. Please try again." }, { status: 503 });
  if (existingWalletPayment) return NextResponse.json({ error: "This UTR / Transaction ID has already been submitted for a wallet payment." }, { status: 409 });

  // The RPC locks the profile row, verifies the checkout and atomically debits the wallet.
  // expectedWalletApplied prevents a stale payment page from silently changing what the customer owes.
  const { data: walletResult, error: walletError } = await supabase.rpc("apply_wallet_to_manual_checkout", {
    p_intent_id: intentId,
    p_client_request_id: clientRequestId,
    p_expected_wallet_applied: expectedWalletApplied,
  });
  if (walletError) {
    const message = String(walletError.message || "").toLowerCase();
    const stale = message.includes("wallet balance changed");
    return NextResponse.json({ error: stale ? "Your wallet balance changed. Please return to checkout and refresh the payment amount before paying." : "Unable to apply your wallet balance right now. Please try again." }, { status: stale ? 409 : 503 });
  }
  const split = (walletResult || {}) as { wallet_applied?: number; remaining?: number };
  const walletApplied = Number(split.wallet_applied || 0);
  const remaining = Number(split.remaining || 0);
  if (!Number.isFinite(walletApplied) || !Number.isFinite(remaining) || remaining <= 0) {
    return NextResponse.json({ error: "This order no longer requires an external payment. Please return to checkout and place it using your wallet." }, { status: 409 });
  }

  const quantity = Number(intent.quantity);
  const charge = Number(intent.total_paise) / 100;
  const unitPrice = Math.round((charge * 1000 / quantity) * 10000) / 10000;
  const methodLabel = paymentMethod === "bank_transfer" ? "Bank transfer (IMPS/NEFT)" : paymentMethod === "usdt_trc20" ? "USDT (TRC20)" : "UPI";
  const customerNote = `${methodLabel} payment submitted for verification. Payment Ref: ${paymentReference}. UTR: ${utr}. Wallet applied: INR ${walletApplied.toFixed(2)}. External amount: INR ${remaining.toFixed(2)}.`;

  const { data: order, error: orderError } = await admin.from("orders").insert({
    user_id: user.id, service_id: service.id, service_name: service.name, platform: service.platform,
    link: intent.destination_link, quantity, unit_price: unitPrice, charge, status: "pending",
    payment_status: "verification_pending", package_name: intent.package_name || "Custom",
    client_request_id: clientRequestId, notes: intent.notes, customer_note: customerNote,
    client_id: intent.client_id, campaign_id: intent.campaign_id,
  }).select("id,public_order_id,status,payment_status").single();

  if (orderError || !order) {
    // Wallet debit is intentionally idempotent; support can safely retry this checkout without double-debiting.
    if (orderError?.code === "23505") {
      const { data: raced } = await admin.from("orders").select("id,public_order_id,status,payment_status").eq("user_id", user.id).eq("client_request_id", clientRequestId).maybeSingle();
      if (raced) return NextResponse.json({ data: raced, duplicate: true });
    }
    return NextResponse.json({ error: "Unable to save your payment verification request. Your wallet application is preserved; please retry this same checkout or contact support." }, { status: 503 });
  }

  const { error: completeError } = await admin.from("checkout_intents").update({ status: "completed", order_id: order.id, completed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", intent.id).eq("status", "created");
  if (completeError) console.error("[MANUAL_PAYMENT_INTENT_COMPLETE_ERROR]", completeError);

  revalidatePath("/dashboard/orders"); revalidatePath(`/dashboard/orders/${order.id}`); revalidatePath("/admin/orders");
  await recordTrustedEvent({ eventName: "order_created", customerId: user.id, pagePath: "/dashboard/direct-upi", eventId: `manual-payment-order:${order.id}`, metadata: { order_id: order.id, method: paymentMethod, currency: "INR", service_code: intent.service_code, platform: service.platform, value: charge, wallet_applied: walletApplied, external_payment: remaining, payment_status: "verification_pending" } });
  return NextResponse.json({ data: order, duplicate: false, payment: { orderTotal: charge, walletApplied, remaining } }, { status: 201, headers: { "Cache-Control": "no-store" } });
}
