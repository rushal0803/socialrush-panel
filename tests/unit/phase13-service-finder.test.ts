import test from "node:test";
import assert from "node:assert/strict";
import { recommendServices } from "../../lib/service-finder.ts";
import type { SmmService } from "../../lib/smm-service-catalog.ts";

const catalog: SmmService[] = [
  {
    platform: "instagram",
    code: "instagram-followers",
    name: "Instagram Followers",
    description: "Follower growth",
    pricePer1000: 799,
    minQuantity: 100,
    maxQuantity: 100000,
    deliveryTime: "1-7 days",
    refillPolicy: "30 days refill",
    qualityType: "Premium",
    importantInstruction: "Public profile",
    isActive: true,
    refillSupported: true,
    refillDays: 30,
    quantityStep: 1,
  },
  {
    platform: "instagram",
    code: "instagram-views",
    name: "Instagram Views",
    description: "Reel views",
    pricePer1000: 30,
    minQuantity: 100,
    maxQuantity: 100000,
    deliveryTime: "0-12 hours",
    refillPolicy: "No refill",
    qualityType: "Standard",
    importantInstruction: "Public reel",
    isActive: true,
    refillSupported: false,
    refillDays: null,
    quantityStep: 1,
  },
  {
    platform: "youtube",
    code: "youtube-comments",
    name: "YouTube Comments",
    description: "Comment activity",
    pricePer1000: 0,
    minQuantity: 0,
    maxQuantity: 0,
    deliveryTime: "Live",
    refillPolicy: "Live",
    qualityType: "Live",
    importantInstruction: "Public video",
    isActive: true,
    requiresLiveCatalogFacts: true,
    refillSupported: false,
    refillDays: null,
    quantityStep: 1,
  },
];

test("Phase 13 prioritizes platform and goal fit", () => {
  const results = recommendServices(catalog, {
    platform: "instagram",
    goal: "reach",
    budget: "flexible",
  });

  assert.equal(results[0]?.service.code, "instagram-views");
  assert.ok(results[0]?.reasons.includes("Matches your selected platform"));
  assert.ok(results[0]?.reasons.some((reason) => reason.includes("content reach")));
});

test("Phase 13 uses known minimum totals for budget matching", () => {
  const results = recommendServices(catalog, {
    platform: "instagram",
    goal: "audience",
    budget: "under-500",
  });

  const followerResult = results.find((item) => item.service.code === "instagram-followers");
  assert.equal(followerResult?.estimatedMinimumTotal, 79.9);
  assert.equal(followerResult?.budgetStatus, "within");
});

test("Phase 13 never treats protected live pricing as a confirmed static budget", () => {
  const results = recommendServices(catalog, {
    platform: "youtube",
    goal: "engagement",
    budget: "under-500",
  });

  const liveResult = results.find((item) => item.service.code === "youtube-comments");
  assert.equal(liveResult?.estimatedMinimumTotal, null);
  assert.equal(liveResult?.budgetStatus, "live");
  assert.ok(liveResult?.reasons.some((reason) => reason.includes("live catalog")));
});

test("Phase 13 excludes inactive services from recommendations", () => {
  const inactive: SmmService = { ...catalog[0], code: "instagram-likes", name: "Inactive Likes", isActive: false };
  const results = recommendServices([...catalog, inactive], {
    platform: "instagram",
    goal: "engagement",
    budget: "flexible",
  });

  assert.equal(results.some((item) => item.service.code === "instagram-likes"), false);
});
