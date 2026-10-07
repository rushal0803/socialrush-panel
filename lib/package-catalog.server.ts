import "server-only";
import { createAdminClient } from "./supabase/admin";
import { smmServiceCatalog, platformMeta } from "./smm-service-catalog";
import { buildPackageTiers, type PackageServiceGroup } from "./package-engine";
import { getPackageUiGroups } from "./package-ui-adapter";

/** Publish only customer catalogue identities supported by checkout. Never expose
 * provider identifiers or private cost fields to the browser. */
export async function getLivePackageGroups() {
  try {
    const { data, error } = await createAdminClient().from("services")
      .select("id,code,name,platform,rate,min,max,refill_policy,is_active,accepts_new_orders,health_status")
      .eq("status", "active").eq("is_active", true).eq("accepts_new_orders", true)
      .order("id", { ascending: true });
    if (error) throw error;
    return smmServiceCatalog.flatMap((definition) => {
      const row = data?.find((r) => (r.code === definition.code || (!r.code && r.name === definition.name))
        && r.platform === (definition.platform === "x" ? "twitter" : definition.platform));
      if (!row || row.health_status === "paused") return [];
      const rate = Number(row.rate), min = Number(row.min), max = Number(row.max);
      if (!Number.isFinite(rate) || rate <= 0 || !Number.isSafeInteger(min) || min <= 0 || !Number.isSafeInteger(max) || max < min) return [];
      const service = { ...definition, isActive: true, requiresLiveCatalogFacts: false, pricePer1000: rate, minQuantity: min, maxQuantity: max, refillPolicy: row.refill_policy || "Check service terms" };
      const group: PackageServiceGroup = { platform: service.platform, platformLabel: platformMeta[service.platform].label, service, tiers: buildPackageTiers(service, true), pricingStatus: "catalog" };
      return getPackageUiGroups([group]).map((ui) => ({ ...ui, databaseServiceId: Number(row.id) }));
    });
  } catch {
    // A failed catalogue read must not advertise stale availability or rates.
    return [];
  }
}
