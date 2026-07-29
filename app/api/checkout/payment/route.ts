import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSafeCustomerDestination } from "@/lib/auth/destination";
import { razorpayConfig, razorpayRequest } from "@/lib/payments/razorpay";

type RazorpayOrder = { id: string; amount: number; currency: string };
type RazorpayPaymentList = {
  items?: Array<{ id: string; order_id: string; amount: number; currency: string; status: string }>;
};

const PAYMENT_COLUMNS = "id, checkout_intent_id, client_request_id, provider_order_id, amount_paise, currency, return_url, status, order_id";

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
      const providerPayments = await razorpayRequest<RazorpayPaymentList>(
        `/orders/${encodeURIComponent(data.provider_order_id)}/payments`,
      );
      const captured = providerPayments.items?.find((payment) =>
        payment.order_id === data.provider_order_id &&
        payment.amount === Number(data.amount_paise) &&
        payment.currency === data.currency &&
        payment.status === "captured"
      );
      if (captured) {
        const admin = createAdminClient();
        const { data: completed, error: completionError } = await admin.rpc(
          "complete_checkout_intent_payment_system",
          { p_checkout_payment_id: data.id, p_provider_payment_id: captured.id },
        );
        if (!completionError) {
          const result = completed as { orderId?: string } | null;
          return NextResponse.json({
            data: {
              id: data.id,
              intentId: data.checkout_intent_id,
              amount: Number(data.amount_paise) / 100,
              amountPaise: Number(data.amount_paise),
              currency: data.currency,
              status: "completed",
              orderId: result?.orderId,
              returnUrl: data.return_url,
            },
          }, { headers: { "Cache-Control": "no-store" } });
        }
      }
    } catch {
      // Status reads remain available if Razorpay is temporarily unreachable.
    }
  }

  return NextResponse.json({
    data: {
      id: data.id,
      intentId: data.checkout_intent_id,
      amount: Number(data.amount_paise) / 100,
      amountPaise: Number(data.amount_paise),
      currency: data.currency,
      status: data.status,
      orderId: data.order_id,
      returnUrl: data.return_url,
    },
  }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null) as {
    intentId?: string;
    clientRequestId?: string;
    returnUrl?: string;
  } | null;
  if (!body?.intentId || !body.clientRequestId || !body.returnUrl) {
    return NextResponse.json({ error: "Checkout intent, request ID, and return URL are required." }, { status: 422 });
  }
  const returnUrl = getSafeCustomerDestination(body.returnUrl);
  if (returnUrl !== body.returnUrl || !returnUrl.startsWith("/dashboard/")) {
    return NextResponse.json({ error: "Invalid checkout return URL." }, { status: 422 });
  }

  const admin = createAdminClient();
  const { data: intent, error: intentError } = await admin
    .from("checkout_intents")
    .select("id, user_id, client_request_id, total_paise, currency, status, expires_at, order_id")
    .eq("id", body.intentId)
    .maybeSingle();
  if (intentError) return NextResponse.json({ error: intentError.message }, { status: 400 });
  if (!intent || intent.user_id !== user.id) return NextResponse.json({ error: "Checkout intent not found." }, { status: 404 });
  if (intent.client_request_id !== body.clientRequestId) {
    return NextResponse.json({ error: "Checkout intent request ID mismatch." }, { status: 409 });
  }
  if (intent.status === "completed") {
    return NextResponse.json({ data: { completed: true, orderId: intent.order_id } }, { status: 200 });
  }
  if (intent.status === "cancelled") return NextResponse.json({ error: "Checkout intent is cancelled." }, { status: 409 });
  if (intent.status === "expired" || new Date(intent.expires_at).getTime() <= Date.now()) {
    return NextResponse.json({ error: "Checkout intent is expired." }, { status: 410 });
  }
  if (intent.status !== "created") return NextResponse.json({ error: "Checkout intent cannot be paid." }, { status: 409 });

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("balance")
    .eq("id", user.id)
    .single();
  if (profileError) return NextResponse.json({ error: "Wallet balance is unavailable." }, { status: 503 });

  const balancePaise = Math.round(Number(profile.balance) * 100);
  const shortfallPaise = Math.max(Number(intent.total_paise) - balancePaise, 0);
  if (shortfallPaise === 0) {
    return NextResponse.json({ error: "Your wallet already covers this order.", code: "WALLET_SUFFICIENT" }, { status: 409 });
  }

  const { data: existing, error: existingError } = await admin
    .from("checkout_intent_payments")
    .select(PAYMENT_COLUMNS)
    .eq("checkout_intent_id", intent.id)
    .maybeSingle();
  if (existingError) return NextResponse.json({ error: existingError.message }, { status: 400 });
  if (existing) {
    const matches =
      existing.client_request_id === body.clientRequestId &&
      Number(existing.amount_paise) === shortfallPaise &&
      existing.currency === intent.currency &&
      existing.return_url === returnUrl;
    if (!matches) return NextResponse.json({ error: "Checkout payment request conflicts with the existing payment." }, { status: 409 });
    if (existing.status === "completed") {
      return NextResponse.json({ data: { completed: true, orderId: existing.order_id } });
    }
    if (existing.status === "failed" || existing.status === "cancelled") {
      const { error: retryError } = await admin
        .from("checkout_intent_payments")
        .update({ status: "created", provider_payment_id: null, updated_at: new Date().toISOString() })
        .eq("id", existing.id)
        .in("status", ["failed", "cancelled"]);
      if (retryError) return NextResponse.json({ error: "Unable to retry this checkout payment." }, { status: 409 });
    } else if (existing.status !== "created") {
      return NextResponse.json({ error: `Checkout payment is ${existing.status}.` }, { status: 409 });
    }
    const { keyId } = razorpayConfig();
    return NextResponse.json({
      data: {
        id: existing.id,
        keyId,
        orderId: existing.provider_order_id,
        amount: Number(existing.amount_paise),
        currency: existing.currency,
        email: user.email,
        duplicate: true,
      },
    });
  }

  try {
    const { keyId } = razorpayConfig();
    const order = await razorpayRequest<RazorpayOrder>("/orders", {
      method: "POST",
      body: JSON.stringify({
        amount: shortfallPaise,
        currency: "INR",
        receipt: `checkout_${intent.id.replaceAll("-", "").slice(0, 24)}`,
        notes: { user_id: user.id, checkout_intent_id: intent.id },
      }),
    });
    if (order.amount !== shortfallPaise || order.currency !== "INR") {
      return NextResponse.json({ error: "Payment provider returned an invalid checkout amount." }, { status: 502 });
    }

    const { data: inserted, error: insertError } = await admin
      .from("checkout_intent_payments")
      .insert({
        checkout_intent_id: intent.id,
        user_id: user.id,
        client_request_id: body.clientRequestId,
        provider_order_id: order.id,
        amount_paise: shortfallPaise,
        currency: "INR",
        return_url: returnUrl,
        status: "created",
      })
      .select(PAYMENT_COLUMNS)
      .single();
    if (insertError || !inserted) {
      if (insertError?.code === "23505") {
        const { data: raced } = await admin
          .from("checkout_intent_payments")
          .select(PAYMENT_COLUMNS)
          .eq("checkout_intent_id", intent.id)
          .maybeSingle();
        if (raced) {
          const matches =
            raced.client_request_id === body.clientRequestId &&
            Number(raced.amount_paise) === shortfallPaise &&
            raced.currency === "INR" &&
            raced.return_url === returnUrl &&
            raced.status === "created";
          if (!matches) {
            return NextResponse.json({ error: "Checkout payment request conflicts with the existing payment." }, { status: 409 });
          }
          return NextResponse.json({
            data: {
              id: raced.id, keyId, orderId: raced.provider_order_id,
              amount: Number(raced.amount_paise), currency: raced.currency,
              email: user.email, duplicate: true,
            },
          });
        }
      }
      return NextResponse.json({ error: insertError?.message || "Unable to save checkout payment." }, { status: 400 });
    }

    return NextResponse.json({
      data: {
        id: inserted.id, keyId, orderId: inserted.provider_order_id,
        amount: Number(inserted.amount_paise), currency: inserted.currency,
        email: user.email, duplicate: false,
      },
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to initialize payment." }, { status: 503 });
  }
}
