import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { activeSmmServices } from "@/lib/smm-service-catalog";
import { findLiveServiceRow, mapLiveServiceRow } from "./live-service-row";

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
  try {
    const db = createAdminClient();
    let query = db.from("services").select("id,rate,min,max,delivery_time,refill_policy,quality_type,is_active,status,health_status,accepts_new_orders,important_instruction")
      .ilike("platform", normalizedPlatform === "twitter" || normalizedPlatform === "x" ? "%twitter%" : normalizedPlatform)
      .eq("status", "active")
      .eq("is_active", true)
      .eq("accepts_new_orders", true);
    query = serviceCode ? query.eq("code", serviceCode) : query.ilike("name", serviceName.trim());
    const { data } = await query.order("id", { ascending: true }).limit(1).maybeSingle();
    if (data) return mapLiveServiceRow(data);
  } catch { /* A catalog fallback keeps public pages useful during a transient DB failure. */ }
  return getCatalogServiceFacts(normalizedPlatform, serviceName, serviceCode);
}

function getCatalogServiceFacts(normalizedPlatform: string, serviceName: string, serviceCode?: string): LiveServiceFacts | null {
  const normalizedName = serviceName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
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

/** One fresh public catalog read per request, with the same availability and
 * fallback rules as individual lookups. No shared price or customer cache. */
export async function getLiveServiceFactsBatch(services: readonly { platform: string; name: string; code: string }[]): Promise<Map<string, LiveServiceFacts | null>> {
  const facts = new Map<string, LiveServiceFacts | null>();
  if (!services.length) return facts;
  try {
    const { data, error } = await createAdminClient().from("services")
      .select("id,code,platform,rate,min,max,delivery_time,refill_policy,quality_type,is_active,status,health_status,accepts_new_orders,important_instruction")
      .in("code", services.map(service => service.code))
      .eq("status", "active").eq("is_active", true).eq("accepts_new_orders", true)
      .order("id", { ascending: true });
    if (error) throw error;
    for (const service of services) {
      const row = findLiveServiceRow(data ?? [], service.platform, service.code);
      facts.set(service.code, row ? mapLiveServiceRow(row) : getCatalogServiceFacts(service.platform.trim().toLowerCase(), service.name, service.code));
    }
  } catch {
    for (const service of services) facts.set(service.code, getCatalogServiceFacts(service.platform.trim().toLowerCase(), service.name, service.code));
  }
  return facts;
}
