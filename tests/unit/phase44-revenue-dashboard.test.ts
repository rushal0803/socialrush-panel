import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildVerifiedRevenueDashboard } from "../../lib/analytics/revenue-dashboard.ts";

const read = (path: string) => readFileSync(new URL("../../" + path, import.meta.url), "utf8");

test("Phase 44 builds verified daily, platform and multi-order revenue metrics", () => {
  const dashboard = buildVerifiedRevenueDashboard({
    paidOrders: [
      { id: "o1", user_id: "u1", platform: "instagram", service_name: "Followers", charge: 100, created_at: "2026-10-01T10:00:00Z" },
      { id: "o2", user_id: "u1", platform: "youtube", service_name: "Subscribers", charge: "200", created_at: "2026-10-02T10:00:00Z" },
      { id: "o3", user_id: "u2", platform: "instagram", service_name: "Likes", charge: 300, created_at: "2026-10-02T12:00:00Z" },
      { id: "o4", user_id: null, platform: null, service_name: "Unknown", charge: 0, created_at: "2026-10-02T13:00:00Z" },
    ],
    refunds: [{ amount: 50, created_at: "2026-10-02T15:00:00Z" }],
  });

  assert.equal(dashboard.daily.length, 2);
  assert.deepEqual(dashboard.daily[0], { date: "2026-10-01", gross: 100, refunds: 0, net: 100, orders: 1 });
  assert.deepEqual(dashboard.daily[1], { date: "2026-10-02", gross: 500, refunds: 50, net: 450, orders: 3 });
  assert.equal(dashboard.bestDay?.date, "2026-10-02");
  assert.equal(dashboard.maxDailyNet, 450);

  assert.equal(dashboard.platforms[0].platform, "instagram");
  assert.equal(dashboard.platforms[0].revenue, 400);
  assert.equal(dashboard.platforms[0].orders, 2);
  assert.equal(dashboard.platforms[0].aov, 200);
  assert.ok(Math.abs(dashboard.platforms[0].sharePct - 66.6666667) < 0.001);

  assert.equal(dashboard.customerContribution.identifiedCustomers, 2);
  assert.equal(dashboard.customerContribution.multiOrderCustomers, 1);
  assert.equal(dashboard.customerContribution.multiOrderCustomerRate, 50);
  assert.equal(dashboard.customerContribution.subsequentOrderRevenue, 200);
  assert.ok(Math.abs(dashboard.customerContribution.subsequentOrderRevenueShare - 33.3333333) < 0.001);

  assert.equal(dashboard.quality.invalidChargeOrders, 1);
  assert.equal(dashboard.quality.missingPlatformOrders, 1);
  assert.equal(dashboard.quality.missingCustomerOrders, 1);
});

test("Phase 44 keeps the existing analytics page as the single revenue command center", () => {
  const page = read("app/admin/analytics/page.tsx");
  const panel = read("components/admin/RevenueIntelligencePanel.tsx");
  assert.match(page, /buildVerifiedRevenueDashboard/);
  assert.match(page, /RevenueIntelligencePanel dashboard=\{revenueDashboard\}/);
  assert.match(panel, /Phase 44 · Verified revenue intelligence/);
  assert.match(panel, /verified paid-order records and completed refund transactions/);
  assert.match(panel, /not presented as lifetime customer LTV/);
});

test("Phase 44 does not invent revenue when order charges are invalid", () => {
  const dashboard = buildVerifiedRevenueDashboard({
    paidOrders: [{ id: "bad", user_id: "u1", platform: "instagram", service_name: "Bad", charge: "not-a-number", created_at: "2026-10-03T00:00:00Z" }],
    refunds: [],
  });
  assert.equal(dashboard.daily[0].gross, 0);
  assert.equal(dashboard.daily[0].net, 0);
  assert.equal(dashboard.quality.invalidChargeOrders, 1);
});