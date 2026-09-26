import test from "node:test";
import assert from "node:assert/strict";
import { addRecentService, parseContinueOrder, parseRecentServices, serializeContinueOrder } from "../../lib/cro/personalization.ts";
import { buildQuantityMerchandising, quantityForMinimumSpend } from "../../lib/cro/quantity-merchandising.ts";

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
  assert.equal(options.some((option) => option.label === "Popular"), false);
  assert.equal(options.at(-1)?.label, "Scale");
});

test("minimum-spend quantity reaches the threshold without changing the service rate", () => {
  const quantity = quantityForMinimumSpend(merchandisingService, 1000);
  assert.equal(quantity, 1252);
  assert.ok(quantity !== null && Math.round((quantity * merchandisingService.pricePer1000 * 100) / 1000) / 100 >= 1000);
  assert.equal(quantityForMinimumSpend(merchandisingService, 100000), null);
});
