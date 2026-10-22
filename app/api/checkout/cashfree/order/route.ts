import { NextResponse, type NextRequest } from "next/server";
import { validateQuantity } from "@/lib/service-pricing";
import { requireJson, requireSameOrigin, isUuid, rateLimit } from "@/lib/security/request";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const DIRECT_UPI_PREFIX = "socialrush_direct_upi:";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const originError = requireSameOrigin(request); if (originError) return originError;
  const jsonError = requireJson(request); if (jsonError) return jsonError;
  const limited = rateLimit(request, "direct-upi-order-checkout", 12, 60_000, user.id); if (limited) return limited;

  const body = await request.json().catch(() => null) as { intentId?: string; returnPath?: string } | null;
  if (!isUuid(body?.intentId)) {
    return NextResponse.json({ error: "A valid checkout intent is required." }, { status: 422 });
  }

  const admin = createAdminClient();
  const { data: intent, error: intentError } = await admin
    .from("checkout_intents")
    .select("id,user_id,service_id,service_code,quantity,destination_link,total_paise,currency,status,expires_at")
    .eq("id", body.intentId)
    .maybeSingle();

  if (intentError) return NextResponse.json({ error: "Unable to load checkout details." }, { status: 503 });
  if (!intent || intent.user_id !== user.id) {
    return NextResponse.json({ error: "Checkout intent not found." }, { status: 404 });
  }
  if (intent.status !== "created" || new Date(intent.expires_at).getTime() <= Date.now()) {
    return NextResponse.json({ error: "This checkout intent is no longer available." }, { status: 409 });
  }
  if (intent.currency !== "INR") {
    return NextResponse.json({ error: "Checkout currency is invalid." }, { status: 409 });
  }

  const { data: databaseService } = await admin
    .from("services")
    .select("id,min,max,is_active,accepts_new_orders,health_status,status")
    .eq("id", intent.service_id)
    .maybeSingle();

  if (!databaseService || databaseService.status !== "active" || databaseService.is_active === false || !databaseService.accepts_new_orders || databaseService.health_status === "paused") {
    return NextResponse.json({ error: "This service is temporarily unavailable. Please choose another service." }, { status: 409 });
  }

  const quantityError = validateQuantity(Number(intent.quantity), { minQuantity: Number(databaseService.min), maxQuantity: Number(databaseService.max) });
  // Only trusted server-created, owner-scoped intents supply prices. Preserve the
  // immutable quote until expiry; do not reprice it with a static/current rate.
  const quotedTotalPaise = Number(intent.total_paise);
  if (quantityError || !Number.isSafeInteger(quotedTotalPaise) || quotedTotalPaise <= 0) {
    return NextResponse.json({ error: "The saved checkout details are no longer valid. Please review your order." }, { status: 409 });
  }

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("balance")
    .eq("id", user.id)
    .maybeSingle();
  const balance = Number(profile?.balance);
  if (profileError || !profile || !Number.isFinite(balance) || balance < 0 || !Number.isSafeInteger(Math.round(balance * 100))) {
    return NextResponse.json({ error: "Unable to verify your wallet balance. Please retry before paying." }, { status: 503 });
  }
  const walletBalancePaise = Math.round(balance * 100);

  if (walletBalancePaise >= quotedTotalPaise) {
    return NextResponse.json(
      { error: "Your wallet already covers this order.", code: "WALLET_SUFFICIENT" },
      { status: 409 },
    );
  }

  const returnUrl = new URL("/dashboard/direct-upi", request.nextUrl.origin);
  returnUrl.searchParams.set("intent", intent.id);

  return NextResponse.json(
    {
      data: {
        orderId: intent.id,
        paymentSessionId: `${DIRECT_UPI_PREFIX}${intent.id}`,
        returnUrl: returnUrl.toString(),
        amountPaise: quotedTotalPaise,
        environment: "production",
        method: "upi",
        duplicate: false,
      },
    },
    { status: 201, headers: { "Cache-Control": "no-store" } },
  );
}
