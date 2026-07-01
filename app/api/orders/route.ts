import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { SERVICE_PRICES, type ServiceCode } from "@/lib/service-pricing";
import { detectPublicCount } from "@/lib/orders/count-detector";

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
    .select("id, service_name, platform, unit_price, link, quantity, package_name, charge, status, provider_order_id, created_at, services(name)")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null) as {
    serviceId?: number;
    serviceCode?: string;
    link?: string;
    quantity?: number;
    requestId?: string;
    notes?: string | null;
    fallbackPrice?: number;
    fallbackName?: string;
    fallbackPlatform?: string;
    fallbackMin?: number;
    fallbackMax?: number;
  } | null;

  if (!body?.serviceCode || !body.link || !Number.isInteger(body.quantity) || !body.requestId) {
    return NextResponse.json({ error: "Complete service, link, quantity, and checkout request details are required" }, { status: 422 });
  }

  const serviceLookup = {
    "instagram-followers": "ig-followers",
    "instagram-likes": "ig-likes",
    "instagram-views": "ig-views",
    "youtube-subscribers": "yt-subscribers",
    "youtube-likes": "yt-likes",
    "youtube-views": "yt-views",
    "facebook-followers": "fb-followers",
    "facebook-likes": "fb-likes",
    "facebook-views": "fb-views",
    "facebook-shares": "fb-shares",
    "linkedin-followers": "li-followers",
    "linkedin-likes": "li-likes",
    "telegram-members": "tg-members",
    "tiktok-followers": "tt-followers",
    "tiktok-likes": "tt-likes",
    "tiktok-views": "tt-views",
    "x-followers": "x-followers",
  } as const;

  const normalizedCode = (serviceLookup as Record<string, string>)[body.serviceCode] ?? body.serviceCode;

  let serviceId = body.serviceId || 0;
  if (!serviceId) {
    const { data: firstService } = await supabase
      .from("services")
      .select("id")
      .eq("status", "active")
      .order("id", { ascending: true })
      .limit(1)
      .maybeSingle();
    serviceId = Number(firstService?.id ?? 0);
  }

  if (!serviceId) {
    return NextResponse.json({ error: "No active service is available for ordering right now." }, { status: 400 });
  }

  const { data, error } = await supabase.rpc("checkout_campaign_with_wallet", {
    p_service_id: serviceId,
    p_service_code: normalizedCode,
    p_link: body.link,
    p_quantity: body.quantity,
    p_request_id: body.requestId,
  });

  if (error) {
    if (
      (error.message || "").toLowerCase().includes("unknown campaign service") &&
      (body.serviceCode in SERVICE_PRICES || body.fallbackPrice) &&
      body.fallbackName &&
      body.fallbackPlatform &&
      body.fallbackMin &&
      body.fallbackMax
    ) {
      if (body.quantity < body.fallbackMin || body.quantity > body.fallbackMax) {
        return NextResponse.json(
          {
            error: `Quantity must be between ${Number(body.fallbackMin).toLocaleString("en-IN")} and ${Number(body.fallbackMax).toLocaleString("en-IN")}.`,
          },
          { status: 400 },
        );
      }

      const canonicalRate =
        body.serviceCode in SERVICE_PRICES
          ? SERVICE_PRICES[body.serviceCode as ServiceCode]
          : Number(body.fallbackPrice);
      const total = Math.round(((body.quantity / 1000) * canonicalRate) * 100) / 100;
      const { data: profile } = await supabase.from("profiles").select("balance").eq("id", user.id).single();
      const currentBalance = Number(profile?.balance ?? 0);
      if (currentBalance + 0.0001 < total) {
        return NextResponse.json({ error: "Insufficient campaign budget" }, { status: 400 });
      }

      const { data: inserted, error: insertError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          service_id: serviceId,
          service_name: body.fallbackName,
          platform: body.fallbackPlatform,
          link: body.link,
          quantity: body.quantity,
          unit_price: canonicalRate,
          charge: total,
          status: "pending",
          package_name: "Custom",
        })
        .select("id, charge")
        .single();

      if (insertError || !inserted) {
        return NextResponse.json({ error: insertError?.message || "Unable to create campaign." }, { status: 400 });
      }

      const { error: debitError } = await supabase
        .from("transactions")
        .insert({
          user_id: user.id,
          amount: total,
          type: "debit",
          status: "completed",
          description: `Campaign checkout: ${body.fallbackName}`,
          payment_method: "wallet",
          metadata: { order_id: inserted.id, source: "fallback-checkout", notes: body.notes || null },
        });

      if (debitError) {
        return NextResponse.json({ error: debitError.message }, { status: 400 });
      }

      const { data: updatedProfile, error: balanceError } = await supabase
        .from("profiles")
        .update({ balance: currentBalance - total })
        .eq("id", user.id)
        .select("balance")
        .single();

      if (balanceError) {
        return NextResponse.json({ error: balanceError.message }, { status: 400 });
      }

      await saveInitialCount(supabase, {
        orderId: inserted.id,
        link: body.link,
        platform: body.fallbackPlatform,
        serviceName: body.fallbackName,
        serviceCode: body.serviceCode,
        customerNote: body.notes,
      });

      revalidatePath("/dashboard");
      revalidatePath("/dashboard/orders");
      revalidatePath("/dashboard/order-history");
      revalidatePath("/dashboard/wallet");
      return NextResponse.json(
        {
          data: {
            id: inserted.id,
            charge: Number(inserted.charge),
            balance: Number(updatedProfile?.balance ?? currentBalance - total),
            duplicate: false,
          },
        },
        { status: 201, headers: { "Cache-Control": "no-store" } },
      );
    }

    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const checkout = data as { id?: string; duplicate?: boolean } | null;
  if (checkout?.id && !checkout.duplicate) {
    await saveInitialCount(supabase, {
      orderId: checkout.id,
      link: body.link,
      platform: body.fallbackPlatform,
      serviceName: body.fallbackName,
      serviceCode: body.serviceCode,
      customerNote: body.notes,
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/orders");
  revalidatePath("/dashboard/order-history");
  revalidatePath("/dashboard/wallet");
  return NextResponse.json({ data }, { status: 201, headers: { "Cache-Control": "no-store" } });
}
