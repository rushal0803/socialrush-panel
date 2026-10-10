import assert from "node:assert/strict";
import test from "node:test";
import { findLiveServiceRow, mapLiveServiceRow, type LiveServiceRow } from "../../lib/seo/live-service-row.ts";

const row: LiveServiceRow = { id: 4, code: "instagram-followers", platform: "Instagram", rate: "799", min: "100", max: "1000000", delivery_time: "1-7 days", refill_policy: "30 days", quality_type: "Real", health_status: "stable", important_instruction: "Public profile only" };
test("batched facts preserve numeric prices, limits, instructions and availability", () => {
  const facts = mapLiveServiceRow(row);
  assert.equal(facts.rate, 799);
  assert.equal(facts.min, 100);
  assert.equal(facts.max, 1000000);
  assert.equal(facts.importantInstruction, row.important_instruction);
  assert.equal(facts.available, true);
  assert.equal(mapLiveServiceRow({ ...row, health_status: "paused" }).available, false);
  assert.equal(mapLiveServiceRow({ ...row, health_status: "maintenance" }).healthStatus, "maintenance");
});
test("batch lookup preserves case-insensitive platform, X aliases and lowest-id selection", () => {
  assert.equal(findLiveServiceRow([row, { ...row, id: 9 }], " instagram ", row.code!), row);
  assert.equal(findLiveServiceRow([row], "youtube", row.code!), undefined);
  assert.equal(findLiveServiceRow([row], "instagram", "missing"), undefined);
  const x = { ...row, platform: "Twitter / X", code: "x-followers" };
  assert.equal(findLiveServiceRow([x], "x", "x-followers"), x);
  assert.equal(findLiveServiceRow([x], "twitter", "x-followers"), x);
});
test("missing public details retain the existing individual-query defaults", () => {
  const facts = mapLiveServiceRow({ ...row, delivery_time: null, refill_policy: null, quality_type: null, health_status: null, important_instruction: null });
  assert.equal(facts.deliveryTime, "Estimate shown before checkout");
  assert.equal(facts.refillPolicy, "Check current service terms");
  assert.equal(facts.qualityType, "Premium");
  assert.equal(facts.healthStatus, "stable");
});
