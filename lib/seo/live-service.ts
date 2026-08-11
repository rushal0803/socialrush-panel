import "server-only";
import { createClient } from "@/lib/supabase/server";
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
  const catalogService = activeSmmServices.find((item) =>
    item.platform === normalizedPlatform &&
    (item.code === normalizedName || item.name.toLowerCase() === serviceName.trim().toLowerCase()),
  );
  if (catalogService) {
    return {
      id: 0,
      rate: catalogService.pricePer1000,
      min: catalogService.minQuantity,
      max: catalogService.maxQuantity,
      deliveryTime: catalogService.deliveryTime,
      refillPolicy: catalogService.refillPolicy,
      available: catalogService.isActive,
      healthStatus: "catalog",
    };
  }
  try {
    const db = await createClient();
    const keyword = serviceName.split(" ").at(-1) || serviceName;
    const { data } = await db.from("services").select("id,rate,min,max,delivery_time,refill_policy,is_active,status,health_status,accepts_new_orders").ilike("platform", normalizedPlatform === "twitter" ? "%twitter%" : normalizedPlatform).ilike("name", `%${keyword}%`).order("is_active", { ascending: false }).limit(1).maybeSingle();
    if (!data) return null;
    return { id:data.id, rate:Number(data.rate), min:Number(data.min), max:Number(data.max), deliveryTime:data.delivery_time || "Estimate shown before checkout", refillPolicy:data.refill_policy || "Check current service terms", available:Boolean(data.is_active && data.status !== "inactive" && data.accepts_new_orders !== false && data.health_status !== "paused"), healthStatus:data.health_status || "stable" };
  } catch { return null; }
}
