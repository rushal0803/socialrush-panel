import assert from "node:assert/strict";
import test from "node:test";
import { buildQuantityPlanning, formatQuantityPlanningInr } from "../../lib/seo/search-demand.ts";

test("public quantity examples preserve the live rate's paise", () => {
  const rows = buildQuantityPlanning(999.9);
  assert.deepEqual(rows.map(row => formatQuantityPlanningInr(row.total)), ["₹999.90", "₹4,999.50", "₹9,999.00"]);
});

test("quantity planning handles fractional rates and Indian digit grouping", () => {
  assert.equal(formatQuantityPlanningInr(buildQuantityPlanning(12.34, [5000])[0].total), "₹61.70");
  assert.equal(formatQuantityPlanningInr(100000), "₹1,00,000.00");
  for (const rate of [null, 0, -1, NaN, Infinity]) assert.deepEqual(buildQuantityPlanning(rate), []);
});
