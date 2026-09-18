import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireJson, requireSameOrigin, rateLimit } from "@/lib/security/request";

const UTR_PATTERN = /^[A-Za-z0-9-]{8,80}$/;

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const originError = requireSameOrigin(request); if (originError) return originError;
  const jsonError = requireJson(request); if (jsonError) return jsonError;
  const limited = rateLimit(request, "manual-upi-wallet", 6, 60_000, user.id); if (limited) return limited;

  const body = await request.json().catch(() => null) as { amount?: number; utr?: string; paymentReference?: string; paymentMethod?: string; usdtAmount?: number } | null;
  const amount = Number(body?.amount);
  const utr = String(body?.utr || "").trim().replace(/\s+/g, "");
  const paymentReference = String(body?.paymentReference || "").trim().toUpperCase();
  const paymentMethod = body?.paymentMethod === "usdt_trc20" ? "usdt_trc20" : "upi";
  const usdtAmount = Number(body?.usdtAmount);

  if (!Number.isFinite(amount) || amount < 100 || amount > 500000 || Math.round(amount * 100) !== amount * 100) {
    return NextResponse.json({ error: "Enter an amount between ₹100 and ₹5,00,000." }, { status: 422 });
  }
  if (!UTR_PATTERN.test(utr)) {
    return NextResponse.json({ error: "Enter a valid payment transaction ID." }, { status: 422 });
  }
  if (!/^SRW-[A-Z0-9-]{8,40}$/.test(paymentReference)) {
    return NextResponse.json({ error: "Payment reference is invalid. Please restart the payment." }, { status: 422 });
  }

  const admin = createAdminClient();
  const { data: existing } = await admin.from("transactions").select("id,user_id,status").eq("provider_payment_id", utr).maybeSingle();
  if (existing) return NextResponse.json({ error: "This UTR / Transaction ID has already been submitted." }, { status: 409 });

  const { data: existingRef } = await admin.from("transactions").select("id,status").eq("provider_order_id", paymentReference).eq("user_id", user.id).maybeSingle();
  if (existingRef) return NextResponse.json({ data: existingRef, duplicate: true });

  const { data: transaction, error } = await admin.from("transactions").insert({
    user_id: user.id,
    amount,
    type: "credit",
    status: "pending",
    payment_method: paymentMethod === "usdt_trc20" ? "manual_usdt_trc20" : "manual_upi",
    provider_order_id: paymentReference,
    provider_payment_id: utr,
    description: `${paymentMethod === "usdt_trc20" ? "USDT TRC20" : "UPI"} wallet top-up submitted for verification · Ref ${paymentReference} · Transaction ${utr}`,
    metadata: { source: paymentMethod === "usdt_trc20" ? "manual_usdt_trc20_wallet" : "manual_upi_wallet", payment_reference: paymentReference, transaction_id: utr, payment_method: paymentMethod, ...(paymentMethod === "usdt_trc20" && Number.isFinite(usdtAmount) ? { submitted_usdt_amount: usdtAmount } : {}) },
  }).select("id,status,amount,provider_order_id").single();

  if (error || !transaction) {
    if (error?.code === "23505") return NextResponse.json({ error: "This payment reference or UTR has already been submitted." }, { status: 409 });
    console.error("[MANUAL_UPI_WALLET_CREATE_ERROR]", error);
    return NextResponse.json({ error: "We could not save your payment for verification. Please contact support and do not pay again." }, { status: 503 });
  }

  return NextResponse.json({ data: transaction, duplicate: false }, { status: 201, headers: { "Cache-Control": "no-store" } });
}
