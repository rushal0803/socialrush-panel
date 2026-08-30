import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const supportedServices = {
  "youtube-comments": {
    name: "YouTube Comments",
    platform: "youtube",
    description: "Build visible conversation and engagement around your YouTube videos with comment activity.",
    fallbackInstruction: "Submit the correct public YouTube video URL and keep the video public while the order is processing.",
  },
  "youtube-watch-hours": {
    name: "YouTube Watch Hours",
    platform: "youtube",
    description: "Build extended viewing activity around your public YouTube content with transparent watch-hour packages and dashboard tracking.",
    fallbackInstruction: "Submit the correct public YouTube video URL and keep the video public while the order is processing.",
  },
  "facebook-group-members": {
    name: "Facebook Group Members",
    platform: "facebook",
    description: "Grow your Facebook community with group member packages, transparent pricing, and dashboard order tracking.",
    fallbackInstruction: "Facebook Group must be public or accessible as required by the service. Enter the correct Facebook Group URL and do not change privacy settings while the order is processing.",
  },
} as const;

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const code = request.nextUrl.searchParams.get("code") || "";
  const definition = supportedServices[code as keyof typeof supportedServices];
  if (!definition) return NextResponse.json({ error: "Unknown live catalog service." }, { status: 400 });

  const { data } = await createAdminClient()
    .from("services")
    .select("id,rate,min,max,delivery_time,refill_policy,quality_type,important_instruction,health_status")
    .eq("name", definition.name)
    .eq("platform", definition.platform)
    .eq("status", "active")
    .eq("is_active", true)
    .eq("accepts_new_orders", true)
    .order("id", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!data || data.health_status === "paused") return NextResponse.json({ data: null }, { headers: { "Cache-Control": "no-store" } });
  const rate = Number(data.rate);
  const min = Number(data.min);
  const max = Number(data.max);
  if (!Number.isFinite(rate) || rate <= 0 || !Number.isSafeInteger(min) || min <= 0 || !Number.isSafeInteger(max) || max < min) {
    return NextResponse.json({ data: null }, { headers: { "Cache-Control": "no-store" } });
  }

  return NextResponse.json({ data: {
    code, platform: definition.platform, name: definition.name, description: definition.description,
    rate, min, max, deliveryTime: data.delivery_time || "Estimate shown before checkout",
    refillPolicy: data.refill_policy || "Check current service terms",
    qualityType: data.quality_type || "Premium",
    importantInstruction: data.important_instruction || definition.fallbackInstruction,
  } }, { headers: { "Cache-Control": "no-store" } });
}
