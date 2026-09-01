import { activeSmmServices, type SmmPlatformId, type SmmService } from "@/lib/smm-service-catalog";

export type PlannerGoal = "followers" | "views" | "engagement";
export type PlanItem = { service: SmmService; quantity: number; cost: number };

const goalTerms: Record<PlannerGoal, string[]> = {
  followers: ["followers", "subscribers", "members"],
  views: ["views", "watch-hours"],
  engagement: ["likes", "comments", "shares", "saves"],
};

function cleanServices(platform: SmmPlatformId, goal: PlannerGoal) {
  return activeSmmServices.filter((service) =>
    service.platform === platform && !service.requiresLiveCatalogFacts && service.pricePer1000 > 0 && service.minQuantity > 0 && service.maxQuantity >= service.minQuantity &&
    goalTerms[goal].some((term) => service.code.endsWith(term)),
  );
}

function affordableQuantity(service: SmmService, budget: number, desired: number) {
  const raw = Math.min(service.maxQuantity, desired || service.maxQuantity, Math.floor((budget * 1000) / service.pricePer1000));
  const step = service.quantityStep || 1;
  const quantity = Math.floor(raw / step) * step;
  return quantity >= service.minQuantity ? quantity : 0;
}

/** Builds an informational, single-service recommendation from the same catalog used by ordering. */
export function buildGrowthPlan({ platform, goal, budget, desired }: { platform: SmmPlatformId; goal: PlannerGoal; budget: number; desired: number }) {
  const services = cleanServices(platform, goal).sort((a, b) => a.pricePer1000 - b.pricePer1000);
  const service = services[0];
  if (!service) return { items: [] as PlanItem[], remaining: budget, reason: "No active compatible service is currently available for this goal." };
  const quantity = affordableQuantity(service, budget, desired);
  if (!quantity) return { items: [] as PlanItem[], remaining: budget, reason: `This service starts at ${service.minQuantity.toLocaleString("en-IN")} units, which is above this budget.` };
  const cost = Math.round((quantity * service.pricePer1000) / 1000 * 100) / 100;
  return { items: [{ service, quantity, cost }], remaining: Math.max(0, Math.round((budget - cost) * 100) / 100), reason: "" };
}
