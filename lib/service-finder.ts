import type { SmmPlatformId, SmmService } from "./smm-service-catalog.ts";

export type ServiceFinderGoal = "audience" | "engagement" | "reach" | "authority";
export type ServiceFinderBudget = "under-500" | "500-1500" | "1500-5000" | "flexible";
export type ServiceFinderPlatform = SmmPlatformId | "any";

export type ServiceFinderInput = Readonly<{
  platform: ServiceFinderPlatform;
  goal: ServiceFinderGoal;
  budget: ServiceFinderBudget;
}>;

export type ServiceFinderRecommendation = Readonly<{
  service: SmmService;
  score: number;
  reasons: readonly string[];
  estimatedMinimumTotal: number | null;
  budgetStatus: "within" | "above" | "live";
}>;

const budgetCaps: Record<Exclude<ServiceFinderBudget, "flexible">, number> = {
  "under-500": 500,
  "500-1500": 1500,
  "1500-5000": 5000,
};

const goalTerms: Record<ServiceFinderGoal, readonly string[]> = {
  audience: ["followers", "subscribers", "members", "connections"],
  engagement: ["likes", "comments", "reactions", "votes", "saves", "shares", "reposts", "endorsements"],
  reach: ["views", "watch-hours", "story-views"],
  authority: ["followers", "subscribers", "connections", "endorsements", "members"],
};

const goalLabels: Record<ServiceFinderGoal, string> = {
  audience: "audience growth",
  engagement: "visible engagement",
  reach: "content reach",
  authority: "profile or community authority",
};

function normalizedCode(service: SmmService) {
  return service.code.toLowerCase();
}

function matchesGoal(service: SmmService, goal: ServiceFinderGoal) {
  const code = normalizedCode(service);
  return goalTerms[goal].some((term) => code.includes(term));
}

function minimumKnownTotal(service: SmmService) {
  if (service.requiresLiveCatalogFacts || service.pricePer1000 <= 0 || service.minQuantity <= 0) return null;
  return Math.round(((service.pricePer1000 * service.minQuantity) / 1000) * 100) / 100;
}

export function recommendServices(
  catalog: readonly SmmService[],
  input: ServiceFinderInput,
  limit = 3,
): ServiceFinderRecommendation[] {
  const budgetCap = input.budget === "flexible" ? null : budgetCaps[input.budget];

  return catalog
    .filter((service) => service.isActive)
    .map((service) => {
      let score = 0;
      const reasons: string[] = [];

      if (input.platform === "any") {
        score += 8;
      } else if (service.platform === input.platform) {
        score += 55;
        reasons.push("Matches your selected platform");
      } else {
        score -= 80;
      }

      if (matchesGoal(service, input.goal)) {
        score += 45;
        reasons.push(`Fits your ${goalLabels[input.goal]} goal`);
      } else {
        score -= 25;
      }

      const estimatedMinimumTotal = minimumKnownTotal(service);
      let budgetStatus: ServiceFinderRecommendation["budgetStatus"] = "live";

      if (estimatedMinimumTotal === null) {
        score += 4;
        reasons.push("Final price is checked from the live catalog before ordering");
      } else if (budgetCap === null || estimatedMinimumTotal <= budgetCap) {
        budgetStatus = "within";
        score += budgetCap === null ? 8 : 18;
        reasons.push(
          budgetCap === null
            ? "Uses a confirmed catalog rate"
            : "Known minimum order fits your selected budget range",
        );
      } else {
        budgetStatus = "above";
        score -= 30;
        reasons.push("Known minimum order is above your selected budget range");
      }

      if (service.refillSupported) {
        score += 3;
      }

      return { service, score, reasons, estimatedMinimumTotal, budgetStatus } as const;
    })
    .filter((item) => item.score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      const leftCost = left.estimatedMinimumTotal ?? Number.POSITIVE_INFINITY;
      const rightCost = right.estimatedMinimumTotal ?? Number.POSITIVE_INFINITY;
      return leftCost - rightCost;
    })
    .slice(0, Math.max(1, limit));
}

export const serviceFinderGoalOptions = [
  { value: "audience", label: "Grow audience", helper: "Followers, subscribers and members" },
  { value: "engagement", label: "Boost engagement", helper: "Likes, comments, shares and reactions" },
  { value: "reach", label: "Increase reach", helper: "Views and watch-focused services" },
  { value: "authority", label: "Build authority", helper: "Profile, professional or community credibility" },
] as const;

export const serviceFinderBudgetOptions = [
  { value: "under-500", label: "Up to ₹500" },
  { value: "500-1500", label: "Up to ₹1,500" },
  { value: "1500-5000", label: "Up to ₹5,000" },
  { value: "flexible", label: "Flexible" },
] as const;
