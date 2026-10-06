import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildRetentionDecision } from "../../lib/retention/engine.ts";

const read = (path: string) => readFileSync(new URL("../../" + path, import.meta.url), "utf8");
const now = new Date("2026-10-06T10:00:00Z");

const base = {
  completedOrders: 3,
  activeOrders: 0,
  pendingOrders: 0,
  paymentChecks: 0,
  openTickets: 0,
  activeRefills: 0,
  hasCheckoutRecovery: false,
  hasDraft: false,
  latestCompletedAt: "2026-09-28T10:00:00Z",
  repeatHref: "/dashboard/new-order?repeat=1",
  repeatServiceName: "Instagram Followers",
  repeatQuantity: 1000,
  repeatCount: 1,
  signalsReliable: true,
};

test("Phase 36 puts unresolved customer care ahead of repeat-order promotion", () => {
  assert.equal(buildRetentionDecision({ ...base, paymentChecks: 1 }, now)?.kind, "payment");
  assert.equal(buildRetentionDecision({ ...base, openTickets: 1 }, now)?.kind, "support");
  assert.equal(buildRetentionDecision({ ...base, activeRefills: 1 }, now)?.kind, "refill");
  assert.equal(buildRetentionDecision({ ...base, activeOrders: 1 }, now)?.kind, "active_order");

  for (const decision of [
    buildRetentionDecision({ ...base, paymentChecks: 1 }, now),
    buildRetentionDecision({ ...base, openTickets: 1 }, now),
    buildRetentionDecision({ ...base, activeRefills: 1 }, now),
    buildRetentionDecision({ ...base, activeOrders: 1 }, now),
  ]) {
    assert.equal(decision?.promotional, false);
  }
});

test("Phase 36 fails closed when retention signals are incomplete", () => {
  assert.equal(buildRetentionDecision({ ...base, signalsReliable: false }, now), null);
});

test("Phase 36 does not compete with checkout or saved-draft recovery", () => {
  assert.equal(buildRetentionDecision({ ...base, hasCheckoutRecovery: true }, now), null);
  assert.equal(buildRetentionDecision({ ...base, hasDraft: true }, now), null);
});

test("Phase 36 gives recent completions a review-first action instead of an immediate reorder", () => {
  const decision = buildRetentionDecision({ ...base, latestCompletedAt: "2026-10-05T10:00:00Z" }, now);
  assert.equal(decision?.kind, "post_completion");
  assert.equal(decision?.promotional, false);
  assert.equal(decision?.href, "/dashboard/orders");
});

test("Phase 36 safely reuses a frequent completed campaign without automatic submission", () => {
  const decision = buildRetentionDecision({ ...base, repeatCount: 3 }, now);
  assert.equal(decision?.kind, "repeat");
  assert.equal(decision?.promotional, true);
  assert.equal(decision?.repeatCount, 3);
  assert.match(decision?.description || "", /Nothing is submitted automatically/);
  assert.match(decision?.description || "", /current price/i);
});

test("Phase 36 dashboard replaces overlapping repeat panels with one retention decision surface", () => {
  const page = read("app/dashboard/page.tsx");
  assert.match(page, /RetentionNextActionCard/);
  assert.match(page, /buildRetentionDecision/);
  assert.match(page, /order_refill_requests/);
  assert.match(page, /buildFrequentRepeatPatterns/);
  assert.doesNotMatch(page, /ReactivationRecoveryPanel/);
  assert.doesNotMatch(page, /RepeatScaleModule/);
});

test("Phase 36 tracks retention views and clicks without affecting the customer action", () => {
  const events = read("lib/analytics/events.ts");
  const card = read("components/dashboard/RetentionNextActionCard.tsx");
  assert.match(events, /retention_next_action_view/);
  assert.match(events, /retention_next_action_click/);
  assert.match(card, /optional planning shortcut, not an automatic reorder/i);
});
