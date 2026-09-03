import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { activeSmmServices } from "@/lib/smm-service-catalog";

export type LiveServiceFacts = {
  id: number;
  rate: number;
  min: number;
  max: number;
  deliveryTime: string;
  refillPolicy: string;
  qualityType: string;
  available: boolean;
  healthStatus: string;
  importantInstruction: string;
};

export async function getLiveServiceFacts(platform: string, serviceName: string, serviceCode?: string): Promise<LiveServiceFacts | null> {
  const normalizedPlatform = platform.trim().toLowerCase();
  const normalizedName = serviceName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  try {
    const db = createAdminClient();
    let query = db.from("services").select("id,rate,min,max,delivery_time,refill_policy,quality_type,is_active,status,health_status,accepts_new_orders,important_instruction")
      .ilike("platform", normalizedPlatform === "twitter" || normalizedPlatform === "x" ? "%twitter%" : normalizedPlatform)
      .eq("status", "active")
      .eq("is_active", true)
      .eq("accepts_new_orders", true);
    query = serviceCode ? query.eq("code", serviceCode) : query.ilike("name", serviceName.trim());
    const { data } = await query.order("id", { ascending: true }).limit(1).maybeSingle();
    if (data) return { id:data.id, rate:Number(data.rate), min:Number(data.min), max:Number(data.max), deliveryTime:data.delivery_time || "Estimate shown before checkout", refillPolicy:data.refill_policy || "Check current service terms", qualityType:data.quality_type || "Premium", available:data.health_status !== "paused", healthStatus:data.health_status || "stable", importantInstruction:data.important_instruction || "Use the exact public YouTube video URL and keep the video public while processing." };
  } catch { /* A catalog fallback keeps public pages useful during a transient DB failure. */ }
  const catalogService = activeSmmServices.find((item) =>
    item.platform === normalizedPlatform &&
    (item.code === serviceCode || item.code === normalizedName || item.name.toLowerCase() === serviceName.trim().toLowerCase()),
  );
  if (!catalogService) return null;
  // Live-only services never receive a public static fallback. Their active
  // Supabase row is the sole source for card facts and availability.
  if (catalogService.requiresLiveCatalogFacts) return null;
  return {
    id: 0, rate: catalogService.pricePer1000, min: catalogService.minQuantity, max: catalogService.maxQuantity,
    deliveryTime: catalogService.deliveryTime, refillPolicy: catalogService.refillPolicy, qualityType: catalogService.qualityType, available: catalogService.isActive, healthStatus: "catalog", importantInstruction: catalogService.importantInstruction,
  };
}
