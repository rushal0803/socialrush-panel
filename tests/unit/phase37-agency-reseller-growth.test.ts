import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildAgencyGrowthDecision } from "../../lib/reseller/growth-engine.ts";

const read = (path: string) => readFileSync(new URL("../../" + path, import.meta.url), "utf8");

const base = {
  activeClients: 2,
  completedOrders: 5,
  unassignedOrders: 0,
  repeatClients: 1,
  savedMonthlyPlans: 2,
  renewalsDueNow: 0,
  activeCampaigns: 1,
  plannedMonthlyValue: 12000,
  signalsReliable: true,
};

test("Phase 37 fails closed when reseller account signals are incomplete", () => {
  assert.equal(buildAgencyGrowthDecision({ ...base, signalsReliable: false }), null);
});

test("Phase 37 starts with client setup before promoting scale", () => {
  const decision = buildAgencyGrowthDecision({ ...base, activeClients: 0 });
  assert.equal(decision?.kind, "first_client");
  assert.equal(decision?.stageNumber, 1);
  assert.equal(decision?.promotional, false);
  assert.equal(decision?.href, "/dashboard/clients");
});

test("Phase 37 prioritizes attribution cleanup before recurring planning", () => {
  const decision = buildAgencyGrowthDecision({ ...base, unassignedOrders: 3 });
  assert.equal(decision?.kind, "attribution");
  assert.equal(decision?.stageNumber, 2);
  assert.match(decision?.title || "", /3 orders are not linked/i);
});

test("Phase 37 guides an organized reseller into the first monthly plan", () => {
  const decision = buildAgencyGrowthDecision({ ...base, savedMonthlyPlans: 0 });
  assert.equal(decision?.kind, "first_plan");
  assert.equal(decision?.stageNumber, 3);
  assert.equal(decision?.href, "/dashboard/reseller/monthly-planner");
  assert.match(decision?.description || "", /Nothing is ordered or charged automatically/i);
});

test("Phase 37 puts due renewals ahead of expansion", () => {
  const decision = buildAgencyGrowthDecision({ ...base, renewalsDueNow: 2 });
  assert.equal(decision?.kind, "renewal");
  assert.equal(decision?.stageNumber, 4);
  assert.equal(decision?.promotional, false);
  assert.equal(decision?.href, "/dashboard/reseller/portfolio");
});

test("Phase 37 surfaces retainer conversion when completed work has not repeated yet", () => {
  const decision = buildAgencyGrowthDecision({ ...base, repeatClients: 0 });
  assert.equal(decision?.kind, "retainer");
  assert.equal(decision?.href, "/dashboard/retainers");
});

test("Phase 37 uses campaign organization before the final bulk-scale state", () => {
  const decision = buildAgencyGrowthDecision({ ...base, activeCampaigns: 0 });
  assert.equal(decision?.kind, "campaign");
  assert.equal(decision?.stageNumber, 5);
  assert.equal(decision?.href, "/dashboard/campaigns");
});

test("Phase 37 scale state uses saved quote value without claiming guaranteed revenue", () => {
  const decision = buildAgencyGrowthDecision(base);
  assert.equal(decision?.kind, "scale");
  assert.equal(decision?.href, "/dashboard/reseller/bulk-planner");
  assert.match(decision?.description || "", /₹12,000/);
  assert.doesNotMatch(decision?.description || "", /guaranteed|earn|profit/i);
});

test("Phase 37 reseller hub uses one measured next-action surface", () => {
  const page = read("app/dashboard/reseller/page.tsx");
  const card = read("components/dashboard/AgencyGrowthNextActionCard.tsx");
  const events = read("lib/analytics/events.ts");

  assert.match(page, /buildAgencyGrowthDecision/);
  assert.match(page, /AgencyGrowthNextActionCard/);
  assert.match(page, /signalsReliable: !clientsError && !campaignsError && !ordersError && !plansError/);
  assert.match(events, /agency_growth_next_action_view/);
  assert.match(events, /agency_growth_next_action_click/);
  assert.match(card, /planning recommendation only/i);
});
