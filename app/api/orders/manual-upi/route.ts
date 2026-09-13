import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isUuid, requireJson, requireSameOrigin, rateLimit } from "@/lib/security/request";
import { recordTrustedEvent } from "@/lib/analytics/server";

const UTR_PATTERN = /^[A-Za-z0-9-]{8,40}$/;
const PAYMENT_REF_PATTERN = /^SR-[A-Z0-9-]{8,40}$/;

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const originError = requireSameOrigin(request); if (originError) return originError;
  const jsonError = requireJson(request); if (jsonError) return jsonError;
  const limited = rateLimit(request, "manual-upi-order", 8, 60_000, user.id); if (limited) return limited;

  const body = await request.json().catch(() => null) as {
    intentId?: string;
    clientRequestId?: string;
    paymentReference?: string;
    utr?: string;
  } | null;

  const intentId = String(body?.intentId || "").trim();
  const clientRequestId = String(body?.clientRequestId || "").trim();
  const paymentReference = String(body?.paymentReference || "").trim().toUpperCase();
  const utr = String(body?.utr || "").trim().replace(/\s+/g, "");

  if (!isUuid(intentId) || !isUuid(clientRequestId)) {
    return NextResponse.json({ error: "Your checkout session is invalid. Please review the order and try again." }, { status: 422 });
  }
  if (!PAYMENT_REF_PATTERN.test(paymentReference)) {
    return NextResponse.json({ error: "Payment reference is invalid." }, { status: 422 });
  }
  if (!UTR_PATTERN.test(utr)) {
    return NextResponse.json({ error: "Enter a valid UTR / transaction ID from your successful UPI payment." }, { status: 422 });
  }

  const admin = createAdminClient();
  const { data: intent, error: intentError } = await admin
    .from("checkout_intents")
    .select("id,user_id,client_request_id,service_id,service_code,quantity,destination_link,package_name,notes,total_paise,currency,status,order_id,expires_at")
    .eq("id", intentId)
    .maybeSingle();

  if (intentError) return NextResponse.json({ error: "Unable to load checkout details." }, { status: 503 });
  if (!intent || intent.user_id !== user.id || intent.client_request_id !== clientRequestId) {
    return NextResponse.json({ error: "Checkout details do not match this account." }, { status: 404 });
  }

  if (intent.status === "completed" && intent.order_id) {
    const { data: existingOrder } = await admin
      .from("orders")
      .select("id,public_order_id,status,payment_status")
      .eq("id", intent.order_id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (existingOrder) return NextResponse.json({ data: existingOrder, duplicate: true });
  }

  if (intent.status !== "created" || new Date(intent.expires_at).getTime() <= Date.now()) {
    return NextResponse.json({ error: "This checkout session has expired. Please review the order again." }, { status: 409 });
  }
  if (intent.currency !== "INR" || Number(intent.total_paise) <= 0) {
    return NextResponse.json({ error: "Checkout amount is invalid." }, { status: 409 });
  }

  const { data: service } = await admin
    .from("services")
    .select("id,name,platform,rate,min,max,status,is_active,accepts_new_orders,health_status")
    .eq("id", intent.service_id)
    .maybeSingle();
  if (!service || service.status !== "active" || service.accepts_new_orders === false || service.health_status === "paused") {
    return NextResponse.json({ error: "This service is temporarily unavailable. Please contact support before paying again." }, { status: 409 });
  }

  const quantity = Number(intent.quantity);
  const charge = Number(intent.total_paise) / 100;
  const unitPrice = Math.round((charge * 1000 / quantity) * 10000) / 10000;
  const customerNote = `UPI payment submitted for verification. Payment Ref: ${paymentReference}. UTR: ${utr}.`;

  const { data: existingByRequest } = await admin
    .from("orders")
    .select("id,public_order_id,status,payment_status")
    .eq("user_id", user.id)
    .eq("client_request_id", clientRequestId)
    .maybeSingle();
  if (existingByRequest) return NextResponse.json({ data: existingByRequest, duplicate: true });

  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({
      user_id: user.id,
      service_id: service.id,
      service_name: service.name,
      platform: service.platform,
      link: intent.destination_link,
      quantity,
      unit_price: unitPrice,
      charge,
      status: "pending",
      payment_status: "verification_pending",
      package_name: intent.package_name || "Custom",
      client_request_id: clientRequestId,
      notes: intent.notes,
      customer_note: customerNote,
    })
    .select("id,public_order_id,status,payment_status")
    .single();

  if (orderError || !order) {
    if (orderError?.code === "23505") {
      const { data: raced } = await admin
        .from("orders")
        .select("id,public_order_id,status,payment_status")
        .eq("user_id", user.id)
        .eq("client_request_id", clientRequestId)
        .maybeSingle();
      if (raced) return NextResponse.json({ data: raced, duplicate: true });
    }
    return NextResponse.json({ error: "Unable to save your payment verification request." }, { status: 503 });
  }

  const { error: completeError } = await admin
    .from("checkout_intents")
    .update({ status: "completed", order_id: order.id, completed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", intent.id)
    .eq("status", "created");

  if (completeError) {
    console.error("[MANUAL_UPI_INTENT_COMPLETE_ERROR]", completeError);
  }

  revalidatePath("/dashboard/orders");
  revalidatePath(`/dashboard/orders/${order.id}`);
  revalidatePath("/admin/orders");

  await recordTrustedEvent({
    eventName: "order_created",
    customerId: user.id,
    pagePath: "/dashboard/order-summary",
    eventId: `manual-upi-order:${order.id}`,
    metadata: {
      method: "upi",
      currency: "INR",
      service_code: intent.service_code,
      platform: service.platform,
      value: charge,
      payment_status: "verification_pending",
    },
  });

  return NextResponse.json({ data: order, duplicate: false }, { status: 201, headers: { "Cache-Control": "no-store" } });
}
