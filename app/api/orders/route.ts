import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { detectPublicCount } from "@/lib/orders/count-detector";
import { recordTrustedEvent } from "@/lib/analytics/server";
import { requireJson, requireSameOrigin, rateLimit } from "@/lib/security/request";

async function saveInitialCount(
  supabase: Awaited<ReturnType<typeof createClient>>,
  input: {
    orderId: string;
    link: string;
    platform?: string | null;
    serviceName?: string | null;
    serviceCode?: string | null;
    customerNote?: string | null;
  },
) {
  const detection = await detectPublicCount({
    url: input.link,
    platform: input.platform,
    serviceName: input.serviceName,
    serviceCode: input.serviceCode,
  }).catch(() => ({
    success: false,
    count: null,
    platform: input.platform || "unknown",
    type: "unknown",
    message: "Starting count could not be detected. Please enter it manually.",
  }));

  await supabase.rpc("set_initial_order_count", {
    p_order_id: input.orderId,
    p_starting_count: detection.count,
    p_status: detection.success ? "detected" : "failed",
    p_source: detection.success ? "auto" : "auto",
    p_message: detection.success
      ? detection.message
      : `Starting count could not be detected. Please enter manually. ${detection.message}`,
    p_customer_note: input.customerNote || null,
  });
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const limit = Math.min(Number(request.nextUrl.searchParams.get("limit")) || 50, 100);
  const { data, error } = await supabase
    .from("orders")
    .select("id, public_order_id, service_name, platform, unit_price, link, quantity, package_name, charge, status, provider_order_id, created_at, services(name)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const originError = requireSameOrigin(request); if (originError) return originError;
  const jsonError = requireJson(request); if (jsonError) return jsonError;
  const limited = rateLimit(request, "wallet-checkout", 12, 60_000, user.id); if (limited) return limited;

  const body = await request.json().catch(() => null) as {
    intentId?: string;
    serviceCode?: string;
    link?: string;
    quantity?: number;
    clientRequestId?: string;
  } | null;

  if (!body?.intentId || !body.serviceCode || !body.link || !Number.isInteger(body.quantity) || !body.clientRequestId) {
    return NextResponse.json({ error: "Complete checkout intent details are required." }, { status: 422 });
  }

  const { data, error } = await supabase.rpc("checkout_custom_intent_with_wallet", {
    p_intent_id: body.intentId,
    p_client_request_id: body.clientRequestId,
    p_service_code: body.serviceCode,
    p_link: body.link,
    p_quantity: body.quantity,
  });

  if (error) {
    const message = error.message || "Unable to complete checkout.";
    const normalized = message.toLowerCase();
    const status = normalized.includes("not found") ? 404
      : normalized.includes("expired") ? 410
        : normalized.includes("cancelled") || normalized.includes("mismatch") || normalized.includes("conflict") || normalized.includes("already belongs") ? 409
          : normalized.includes("authentication") ? 401
            : 400;
    return NextResponse.json({ error: status === 404 ? "Checkout intent not found." : status === 410 ? "Checkout intent has expired." : status === 409 ? "Checkout request conflicts with its current state." : "Unable to complete checkout." }, { status });
  }

  const checkout = data as { id?: string; duplicate?: boolean } | null;
  if (checkout?.id && !checkout.duplicate) {
    await recordTrustedEvent({eventName:"wallet_order_completed",customerId:user.id,pagePath:"/dashboard/new-order",eventId:`wallet_order:${checkout.id}`,metadata:{order_id:checkout.id}});
    await recordTrustedEvent({eventName:"order_created",customerId:user.id,pagePath:"/dashboard/new-order",eventId:`order:${checkout.id}`,metadata:{order_id:checkout.id,method:"wallet"}});
    await saveInitialCount(supabase, {
      orderId: checkout.id,
      link: body.link,
      serviceCode: body.serviceCode,
    });
    await supabase.from("order_drafts").delete().eq("user_id", user.id);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/orders");
  revalidatePath("/dashboard/order-history");
  revalidatePath("/dashboard/wallet");
  return NextResponse.json({ data }, { status: 201, headers: { "Cache-Control": "no-store" } });
}
