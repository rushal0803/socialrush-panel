import assert from "node:assert/strict";
import test from "node:test";
import { calculateServiceCost, serviceCostOptions } from "../../lib/tools/service-cost-calculator.ts";

test("service cost calculator computes quantity totals from a per-1K rate", () => {
  assert.deepEqual(calculateServiceCost(799, 5000), { total: 3995, perUnit: 0.799 });
  assert.deepEqual(calculateServiceCost(3999, 1000), { total: 3999, perUnit: 3.999 });
  assert.equal(calculateServiceCost(0, 1000), null);
  assert.equal(calculateServiceCost(799, 0), null);
});

test("only confirmed public services auto-fill a price", () => {
  const confirmed = serviceCostOptions.filter((option) => option.pricingMode === "confirmed");
  const live = serviceCostOptions.filter((option) => option.pricingMode === "live");

  assert.deepEqual(confirmed.map((option) => option.id), [
    "instagram-followers",
    "linkedin-followers",
    "x-followers",
  ]);
  assert.equal(confirmed.every((option) => typeof option.pricePer1000 === "number" && option.pricePer1000 > 0), true);
  assert.equal(live.every((option) => option.pricePer1000 === null), true);
});

test("every calculator service points to one canonical public money page", () => {
  assert.equal(new Set(serviceCostOptions.map((option) => option.id)).size, serviceCostOptions.length);
  for (const option of serviceCostOptions) {
    assert.equal(option.href.startsWith("/"), true);
    assert.equal(option.href.includes("?"), false);
  }
});
