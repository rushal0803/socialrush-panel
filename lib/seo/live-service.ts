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
  available: boolean;
  healthStatus: string;
};

export async function getLiveServiceFacts(platform: string, serviceName: string): Promise<LiveServiceFacts | null> {
  const normalizedPlatform = platform.trim().toLowerCase();
  const normalizedName = serviceName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  try {
    const db = createAdminClient();
    const { data } = await db.from("services").select("id,rate,min,max,delivery_time,refill_policy,is_active,status,health_status,accepts_new_orders")
      .ilike("platform", normalizedPlatform === "twitter" ? "%twitter%" : normalizedPlatform)
      .ilike("name", serviceName.trim())
      .eq("status", "active")
      .eq("is_active", true)
      .eq("accepts_new_orders", true)
      .order("id", { ascending: true }).limit(1).maybeSingle();
    if (data) return { id:data.id, rate:Number(data.rate), min:Number(data.min), max:Number(data.max), deliveryTime:data.delivery_time || "Estimate shown before checkout", refillPolicy:data.refill_policy || "Check current service terms", available:data.health_status !== "paused", healthStatus:data.health_status || "stable" };
  } catch { /* A catalog fallback keeps public pages useful during a transient DB failure. */ }
  // Shares deliberately has no public fallback: its row is the source of
  // truth, and a missing row must not look orderable or priced.
  if (normalizedName === "instagram-shares" || normalizedName === "youtube-watch-hours") return null;
  const catalogService = activeSmmServices.find((item) =>
    item.platform === normalizedPlatform &&
    (item.code === normalizedName || item.name.toLowerCase() === serviceName.trim().toLowerCase()),
  );
  if (!catalogService) return null;
  return {
    id: 0, rate: catalogService.pricePer1000, min: catalogService.minQuantity, max: catalogService.maxQuantity,
    deliveryTime: catalogService.deliveryTime, refillPolicy: catalogService.refillPolicy, available: catalogService.isActive, healthStatus: "catalog",
  };
}
