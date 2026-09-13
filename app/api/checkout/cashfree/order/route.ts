import { NextResponse, type NextRequest } from "next/server";
import { calculateServiceTotalPaise, validateQuantity, type ServiceCode } from "@/lib/service-pricing";
import { getServiceById } from "@/lib/smm-service-catalog";
import { requireJson, requireSameOrigin, isUuid, rateLimit } from "@/lib/security/request";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const liveCatalogServiceCodes = new Set<ServiceCode>([
  "instagram-followers",
  "instagram-saves",
  "instagram-shares",
  "youtube-comments",
  "youtube-watch-hours",
  "facebook-group-members",
  "linkedin-followers",
  "linkedin-usa-connections",
  "linkedin-usa-post-likes",
  "linkedin-usa-endorsements",
  "linkedin-usa-followers",
  "linkedin-usa-group-members",
  "linkedin-usa-custom-comments",
  "linkedin-usa-reposts",
  "x-followers",
  "twitter-likes",
  "twitter-views",
  "twitter-retweets",
  "telegram-post-views",
  "telegram-post-reactions",
  "telegram-poll-votes",
  "tiktok-followers",
  "tiktok-likes",
  "tiktok-views",
  "tiktok-custom-comments",
  "tiktok-story-views",
  "tiktok-saves",
]);

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

  const service = getServiceById(intent.service_code);
  const isLiveCatalogService = Boolean(service && liveCatalogServiceCodes.has(service.code));
  if (!service || (!service.isActive && !isLiveCatalogService)) {
    return NextResponse.json({ error: "The saved checkout details are no longer valid. Please review your order." }, { status: 409 });
  }

  const { data: databaseService } = await admin
    .from("services")
    .select("id,rate,min,max,accepts_new_orders,health_status,status")
    .eq("id", intent.service_id)
    .maybeSingle();

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

  const { data: profile } = await admin
    .from("profiles")
    .select("balance")
    .eq("id", user.id)
    .maybeSingle();
  const walletBalancePaise = Math.max(Math.round(Number(profile?.balance || 0) * 100), 0);

  if (walletBalancePaise >= recalculatedTotalPaise) {
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
        amountPaise: recalculatedTotalPaise,
        environment: "production",
        method: "upi",
        duplicate: false,
      },
    },
    { status: 201, headers: { "Cache-Control": "no-store" } },
  );
}
