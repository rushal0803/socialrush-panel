import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { calculateServiceTotalPaise, validateQuantity, type ServiceCode } from "@/lib/service-pricing";
import { getServiceById } from "@/lib/smm-service-catalog";
import { linkRules, validateCampaignLink } from "@/lib/order-service-experience";
import { requireJson, requireSameOrigin, rateLimit } from "@/lib/security/request";

type IntentRow = {
  id: string;
  service_code: string;
  quantity: number;
  destination_link: string;
  package_name: string | null;
  notes: string | null;
  total_paise: number;
  currency: string;
  status: string;
  created_at: string;
};

function intentResponse(intent: IntentRow, duplicate: boolean, status: number) {
  return NextResponse.json(
    {
      data: {
        id: intent.id,
        serviceCode: intent.service_code,
        service_code: intent.service_code,
        quantity: Number(intent.quantity),
        destinationLink: intent.destination_link,
        destination_link: intent.destination_link,
        total: Number(intent.total_paise) / 100,
        total_paise: Number(intent.total_paise),
        currency: intent.currency,
        status: intent.status,
        created_at: intent.created_at,
        duplicate,
      },
    },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

const INTENT_COLUMNS = "id, service_code, quantity, destination_link, package_name, notes, total_paise, currency, status, created_at";

const databaseServiceNames: Partial<Record<ServiceCode, string>> = {
  "instagram-followers": "Instagram Real Followers",
  "linkedin-followers": "LinkedIn Profile Followers",
  "telegram-members": "Telegram Premium Members",
  "x-followers": "X Followers",
};

const liveCatalogServiceCodes = new Set<ServiceCode>(["instagram-followers", "instagram-saves", "instagram-shares", "youtube-comments", "youtube-watch-hours", "facebook-group-members", "linkedin-followers", "x-followers"]);
const cryptoServiceCodes = new Set<ServiceCode>(["twitter-crypto-followers", "twitter-crypto-likes", "twitter-crypto-retweets", "twitter-crypto-custom-comments"]);

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const originError = requireSameOrigin(request); if (originError) return originError;
  const jsonError = requireJson(request); if (jsonError) return jsonError;
  const limited = rateLimit(request, "checkout-intent", 20, 60_000, user.id); if (limited) return limited;

  const body = await request.json().catch(() => null) as {
    serviceCode?: string;
    quantity?: number;
    link?: string;
    clientRequestId?: string;
    packageName?: string | null;
    notes?: string | null;
  } | null;

  const serviceCode = typeof body?.serviceCode === "string" ? body.serviceCode.trim() : "";
  const link = typeof body?.link === "string" ? body.link.trim() : "";
  const clientRequestId = typeof body?.clientRequestId === "string" ? body.clientRequestId.trim() : "";
  const notes = typeof body?.notes === "string" && body.notes.trim() ? body.notes.trim() : null;
  const quantity = body?.quantity;

  if (!serviceCode || !link || !clientRequestId || !Number.isInteger(quantity)) {
    return NextResponse.json(
      { error: "Service code, link, integer quantity, and clientRequestId are required." },
      { status: 422 },
    );
  }
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(clientRequestId)) {
    return NextResponse.json({ error: "clientRequestId must be a valid random UUID." }, { status: 422 });
  }

  const service = getServiceById(serviceCode);
  if (!service) {
    return NextResponse.json({ error: "Unknown service code." }, { status: 400 });
  }
  if (!service.isActive && !liveCatalogServiceCodes.has(service.code)) {
    return NextResponse.json({ error: "This service is not currently available." }, { status: 400 });
  }
  if (service.code === "twitter-crypto-custom-comments") {
    if (!notes || notes.split(/\r?\n/).some((line) => !line.trim()) || notes.length > 10000) {
      return NextResponse.json({ error: "Enter custom comments one per line (without blank lines)." }, { status: 422 });
    }
  } else if (notes) {
    return NextResponse.json({ error: "Comments are only accepted for the custom-comments service." }, { status: 422 });
  }
  const linkError = linkRules[service.code] ? validateCampaignLink(link, linkRules[service.code]) : null;
  if (linkError) return NextResponse.json({ error: linkError }, { status: 400 });

  const requestedQuantity = quantity as number;
  // Live-catalog services use their active Supabase rows for limits and rate.
  const quantityError = liveCatalogServiceCodes.has(service.code) ? null : validateQuantity(requestedQuantity, service);
  if (quantityError) return NextResponse.json({ error: quantityError }, { status: 400 });

  let parsedLink: URL;
  try {
    parsedLink = new URL(link);
  } catch {
    return NextResponse.json({ error: "A valid destination link is required." }, { status: 400 });
  }
  if (parsedLink.protocol !== "http:" && parsedLink.protocol !== "https:") {
    return NextResponse.json({ error: "A valid destination link is required." }, { status: 400 });
  }

  let matchedServiceQuery = supabase
    .from("services")
    .select("id, rate, min, max, accepts_new_orders, health_status")
    .eq("status", "active")
    .eq("name", databaseServiceNames[service.code as ServiceCode] ?? service.name)
    .order("id", { ascending: true })
    .limit(1);
  if (liveCatalogServiceCodes.has(service.code) || cryptoServiceCodes.has(service.code)) matchedServiceQuery = matchedServiceQuery.eq("platform", service.platform).eq("is_active", true).eq("accepts_new_orders", true);
  const { data: matchedService } = await matchedServiceQuery.maybeSingle();
  const serviceId = matchedService?.id ? Number(matchedService.id) : null;
  if (matchedService && (!matchedService.accepts_new_orders || matchedService.health_status === "paused")) {
    return NextResponse.json({ error: "This service is temporarily unavailable. Please choose another service." }, { status: 409 });
  }

  let totalPaise = calculateServiceTotalPaise(service.code, requestedQuantity);
  if (liveCatalogServiceCodes.has(service.code) || cryptoServiceCodes.has(service.code)) {
    if (!matchedService) return NextResponse.json({ error: `${service.name} is not currently available.` }, { status: 409 });
    const liveQuantityError = validateQuantity(requestedQuantity, {
      minQuantity: Number(matchedService.min),
      maxQuantity: Number(matchedService.max),
    });
    if (liveQuantityError) return NextResponse.json({ error: liveQuantityError }, { status: 400 });
    totalPaise = Math.round((requestedQuantity * Number(matchedService.rate) * 100) / 1000);
  }
  if (!Number.isSafeInteger(totalPaise) || totalPaise <= 0) {
    return NextResponse.json({ error: "Calculated total is invalid for this quantity." }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: existing, error: existingError } = await admin
    .from("checkout_intents")
    .select(INTENT_COLUMNS)
    .eq("user_id", user.id)
    .eq("client_request_id", clientRequestId)
    .maybeSingle<IntentRow>();

  if (existingError) {
    return NextResponse.json({ error: "Unable to check checkout request." }, { status: 503 });
  }

  if (existing) {
    const matches =
      existing.service_code === service.code &&
      Number(existing.quantity) === requestedQuantity &&
      existing.destination_link === link &&
      existing.package_name === "Custom" &&
      existing.notes === notes;
    if (!matches) {
      return NextResponse.json(
        { error: "This request ID was already used with different order details." },
        { status: 409 },
      );
    }
    if (existing.status === "cancelled") {
      return NextResponse.json({ error: "This checkout intent was cancelled." }, { status: 409 });
    }
    if (existing.status === "expired") {
      return NextResponse.json({ error: "This checkout intent has expired." }, { status: 410 });
    }
    return intentResponse(existing, true, 200);
  }

  const { data: inserted, error: insertError } = await admin
    .from("checkout_intents")
    .insert({
      user_id: user.id,
      client_request_id: clientRequestId,
      service_id: serviceId,
      service_code: service.code,
      quantity: requestedQuantity,
      destination_link: link,
      package_name: "Custom",
      notes,
      total_paise: totalPaise,
      currency: "INR",
      status: "created",
    })
    .select(INTENT_COLUMNS)
    .single<IntentRow>();

  if (insertError || !inserted) {
    if (insertError?.code === "23505") {
      const { data: raced } = await admin
        .from("checkout_intents")
        .select(INTENT_COLUMNS)
        .eq("user_id", user.id)
        .eq("client_request_id", clientRequestId)
        .maybeSingle<IntentRow>();
      if (raced) {
        const matches =
          raced.service_code === service.code &&
          Number(raced.quantity) === requestedQuantity &&
          raced.destination_link === link &&
          raced.package_name === "Custom" &&
          raced.notes === notes;
        if (!matches) {
          return NextResponse.json(
            { error: "This request ID was already used with different order details." },
            { status: 409 },
          );
        }
        if (raced.status === "cancelled") {
          return NextResponse.json({ error: "This checkout intent was cancelled." }, { status: 409 });
        }
        if (raced.status === "expired") {
          return NextResponse.json({ error: "This checkout intent has expired." }, { status: 410 });
        }
        return intentResponse(raced, true, 200);
      }
    }
    return NextResponse.json({ error: "Unable to create checkout intent." }, { status: 503 });
  }

  return intentResponse(inserted, false, 201);
}
