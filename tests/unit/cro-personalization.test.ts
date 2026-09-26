import test from "node:test";
import assert from "node:assert/strict";
import { addRecentService, parseContinueOrder, parseRecentServices, serializeContinueOrder } from "../../lib/cro/personalization.ts";
import { buildQuantityMerchandising, quantityForMinimumSpend } from "../../lib/cro/quantity-merchandising.ts";
import { postOrderRecommendations } from "../../lib/cro/revenue-bundles.ts";
import { smmServiceCatalog } from "../../lib/smm-service-catalog.ts";
import { buildFrequentRepeatPatterns, buildRepeatOrderHref, resolveRepeatOrderService } from "../../lib/cro/repeat-order.ts";
import { buildClientProposalText, calculateAgencyQuote, normalizeMarkupPercent } from "../../lib/reseller/monthly-plan.ts";
import { compareSavedMonthlyPlan, planSnapshotItems } from "../../lib/reseller/saved-monthly-plan.ts";

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


test("agency monthly quote keeps fulfillment cost separate from client markup", () => {
  const quote = calculateAgencyQuote(10000, 40);
  assert.equal(quote.fulfillmentCost, 10000);
  assert.equal(quote.clientQuote, 14000);
  assert.equal(quote.grossMargin, 4000);
  assert.equal(quote.grossMarginPercent, 28.6);
  assert.equal(quote.markupPercent, 40);
});

test("agency markup is bounded and proposal text avoids internal cost disclosure", () => {
  assert.equal(normalizeMarkupPercent(-10), 0);
  assert.equal(normalizeMarkupPercent(500), 200);
  const proposal = buildClientProposalText({
    clientName: "Acme",
    planName: "Instagram Growth Stack",
    platformLabel: "Instagram",
    items: [{ name: "Instagram Followers", quantity: 5000 }],
    clientQuote: 12500,
  });
  assert.match(proposal, /Monthly Growth Plan — Acme/);
  assert.match(proposal, /Monthly service fee: ₹12,500/);
  assert.equal(proposal.includes("fulfillment cost"), false);
  assert.equal(proposal.includes("margin"), false);
  assert.match(proposal, /does not create an automatic renewal/i);
});


test("saved monthly plan comparison shows current cost and margin deltas without changing the saved baseline", () => {
  const result = compareSavedMonthlyPlan({
    baselineFulfillmentCost: 10000,
    baselineClientQuote: 14000,
    baselineGrossMargin: 4000,
    markupPercent: 40,
  }, 12000);
  assert.equal(result.costDelta, 2000);
  assert.equal(result.costDeltaPercent, 20);
  assert.equal(result.current.clientQuote, 16800);
  assert.equal(result.current.grossMargin, 4800);
  assert.equal(result.quoteDelta, 2800);
  assert.equal(result.marginDelta, 800);
});

test("saved plan snapshots keep only service identity, quantity and rounded planning totals", () => {
  const snapshot = planSnapshotItems([{
    service: { code: "instagram-followers", name: "Instagram Followers" },
    quantity: 5000,
    total: 3995.126,
  }]);
  assert.deepEqual(snapshot, [{
    service_code: "instagram-followers",
    name: "Instagram Followers",
    quantity: 5000,
    total: 3995.13,
  }]);
});
