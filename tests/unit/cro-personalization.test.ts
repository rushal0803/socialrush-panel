import test from "node:test";
import assert from "node:assert/strict";
import { addRecentService, parseContinueOrder, parseRecentServices, serializeContinueOrder } from "../../lib/cro/personalization.ts";
import { buildQuantityMerchandising, quantityForMinimumSpend } from "../../lib/cro/quantity-merchandising.ts";
import { postOrderRecommendations } from "../../lib/cro/revenue-bundles.ts";
import { smmServiceCatalog } from "../../lib/smm-service-catalog.ts";
import { buildFrequentRepeatPatterns, buildRepeatOrderHref, resolveRepeatOrderService } from "../../lib/cro/repeat-order.ts";

const allowed = new Set(["instagram-followers", "youtube-subscribers", "linkedin-followers"]);
test("recent services are limited, de-duplicated and catalog filtered", () => {
  const raw = JSON.stringify([{ code: "instagram-followers", viewedAt: 10 }, { code: "invalid", viewedAt: 11 }, { code: "instagram-followers", viewedAt: 12 }, { code: "youtube-subscribers", viewedAt: 9 }]);
  assert.deepEqual(parseRecentServices(raw, allowed, 20).map((item) => item.code), ["instagram-followers", "youtube-subscribers"]);
  assert.deepEqual(addRecentService([{ code: "youtube-subscribers", viewedAt: 1 }], "instagram-followers", 2).map((item) => item.code), ["instagram-followers", "youtube-subscribers"]);
});
test("continue order expires and contains no destination or price", () => {
  const current = { serviceCode: "instagram-followers", quantity: 1000, updatedAt: 10_000 };
  assert.deepEqual(parseContinueOrder(serializeContinueOrder(current), allowed, 10_001), current);
  assert.equal(parseContinueOrder(serializeContinueOrder(current), allowed, 10_000 + 8 * 24 * 60 * 60 * 1000), null);
  assert.equal(serializeContinueOrder(current).includes("link"), false);
  assert.equal(serializeContinueOrder(current).includes("price"), false);
});


const merchandisingService = {
  platform: "instagram",
  code: "instagram-followers",
  name: "Instagram Followers",
  description: "Test service",
  pricePer1000: 799,
  minQuantity: 100,
  maxQuantity: 10000,
  quantityStep: 1,
  deliveryTime: "Test",
  refillPolicy: "Test",
  qualityType: "Test",
  importantInstruction: "Test",
  isActive: true,
} as const;

test("quantity merchandising uses descriptive tiers without popularity claims", () => {
  const options = buildQuantityMerchandising(merchandisingService);
  assert.equal(options[0]?.label, "Starter");
  assert.equal(options.some((option) => option.label === "Balanced"), true);
  assert.equal(options.map((option) => String(option.label)).includes("Popular"), false);
  assert.equal(options.at(-1)?.label, "Scale");
});

test("minimum-spend quantity reaches the threshold without changing the service rate", () => {
  const quantity = quantityForMinimumSpend(merchandisingService, 1000);
  assert.equal(quantity, 1252);
  assert.ok(quantity !== null && Math.round((quantity * merchandisingService.pricePer1000 * 100) / 1000) / 100 >= 1000);
  assert.equal(quantityForMinimumSpend(merchandisingService, 100000), null);
});


test("post-order recommendations stay complementary and avoid protected live-price services", () => {
  const recommendations = postOrderRecommendations("instagram-followers", smmServiceCatalog, 2);
  assert.equal(recommendations.length, 2);
  assert.equal(recommendations.some((item) => item.service.code === "instagram-followers"), false);
  assert.equal(recommendations.every((item) => item.service.platform === "instagram"), true);
  assert.equal(recommendations.every((item) => !item.service.requiresLiveCatalogFacts && item.total > 0), true);
});

test("post-order recommendations require an existing stack containing the completed service", () => {
  assert.deepEqual(postOrderRecommendations("facebook-followers", smmServiceCatalog, 2), []);
  assert.deepEqual(postOrderRecommendations("not-a-service", smmServiceCatalog, 2), []);
});


test("repeat-order builder preserves service, quantity and exact target", () => {
  const href = buildRepeatOrderHref({
    serviceName: "Instagram Followers",
    platform: "instagram",
    quantity: 2500,
    link: "https://instagram.com/example",
  }, smmServiceCatalog);
  assert.ok(href);
  const url = new URL(href!, "https://example.test");
  assert.equal(url.searchParams.get("service"), "instagram-followers");
  assert.equal(url.searchParams.get("quantity"), "2500");
  assert.equal(url.searchParams.get("link"), "https://instagram.com/example");
  assert.equal(url.searchParams.get("resume"), "1");
});

test("repeat-order builder resolves Twitter platform aliases and rejects incomplete input", () => {
  const service = resolveRepeatOrderService({ serviceName: "Twitter / X Followers", platform: "twitter" }, smmServiceCatalog);
  assert.equal(service?.platform, "x");
  assert.equal(buildRepeatOrderHref({ serviceName: "Unknown", platform: "instagram", quantity: 1000, link: "https://instagram.com/example" }, smmServiceCatalog), null);
  assert.equal(buildRepeatOrderHref({ serviceName: "Instagram Followers", platform: "instagram", quantity: 0, link: "https://instagram.com/example" }, smmServiceCatalog), null);
  assert.equal(buildRepeatOrderHref({ serviceName: "Instagram Followers", platform: "instagram", quantity: 1000, link: "" }, smmServiceCatalog), null);
});


test("frequent repeat patterns require at least two matching completed-order shapes", () => {
  const patterns = buildFrequentRepeatPatterns([
    { serviceName: "Instagram Followers", platform: "instagram", quantity: 1000, link: "https://instagram.com/example", createdAt: "2026-09-01T00:00:00Z" },
    { serviceName: "Instagram Followers", platform: "instagram", quantity: 1000, link: "https://instagram.com/example", createdAt: "2026-09-10T00:00:00Z" },
    { serviceName: "Instagram Likes", platform: "instagram", quantity: 1000, link: "https://instagram.com/p/abc", createdAt: "2026-09-12T00:00:00Z" },
  ], smmServiceCatalog);
  assert.equal(patterns.length, 1);
  assert.equal(patterns[0]?.serviceName, "Instagram Followers");
  assert.equal(patterns[0]?.count, 2);
  assert.equal(patterns[0]?.latestAt, "2026-09-10T00:00:00Z");
});

test("frequent repeat patterns keep different targets and quantities separate", () => {
  const patterns = buildFrequentRepeatPatterns([
    { serviceName: "Instagram Followers", platform: "instagram", quantity: 1000, link: "https://instagram.com/a", createdAt: "2026-09-01T00:00:00Z" },
    { serviceName: "Instagram Followers", platform: "instagram", quantity: 2000, link: "https://instagram.com/a", createdAt: "2026-09-02T00:00:00Z" },
    { serviceName: "Instagram Followers", platform: "instagram", quantity: 1000, link: "https://instagram.com/b", createdAt: "2026-09-03T00:00:00Z" },
  ], smmServiceCatalog);
  assert.deepEqual(patterns, []);
});
