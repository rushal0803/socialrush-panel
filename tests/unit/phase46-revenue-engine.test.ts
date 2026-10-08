import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  MONTHLY_REVENUE_TARGET,
  TARGET_AOV,
  TARGET_REVENUE_PER_VISITOR_AT_100K,
  buildMonthlyRevenueGoal,
  indiaMonthKey,
} from "../../lib/analytics/revenue-goal-engine.ts";

const read = (path: string) =>
  readFileSync(new URL("../../" + path, import.meta.url), "utf8");

test("Phase 46 computes the ₹5L monthly target from verified revenue inputs", () => {
  const dashboard = buildMonthlyRevenueGoal({
    now: new Date("2026-10-08T10:00:00Z"),
    grossRevenue: 120_000,
    refunds: 10_000,
    netRevenue: 110_000,
    paidOrders: 100,
    aov: 1_200,
    repeatRevenueShare: 18,
    multiOrderCustomerRate: 22,
    topPlatform: { platform: "instagram", revenue: 55_000, orders: 40, sharePct: 45.8 },
  });

  assert.equal(MONTHLY_REVENUE_TARGET, 500_000);
  assert.equal(TARGET_AOV, 1_500);
  assert.equal(TARGET_REVENUE_PER_VISITOR_AT_100K, 5);
  assert.equal(dashboard.targetGap, 390_000);
  assert.equal(dashboard.progressPct, 22);
  assert.equal(dashboard.daysInMonth, 31);
  assert.equal(dashboard.elapsedDays, 8);
  assert.equal(dashboard.remainingDays, 23);
  assert.equal(dashboard.ordersAtCurrentAov, 417);
  assert.equal(dashboard.remainingOrdersAtCurrentAov, 325);
  assert.equal(dashboard.ordersAtTargetAov, 334);
  assert.ok(dashboard.requiredDailyRevenue > dashboard.targetDailyRevenue);
  assert.match(dashboard.note, /roadmap target, not a forecast/i);
  assert.match(dashboard.note, /target arithmetic only/i);
});

test("Phase 46 uses India calendar months for revenue attribution", () => {
  assert.equal(indiaMonthKey("2026-09-30T19:00:00Z"), "2026-10");
  assert.equal(indiaMonthKey("2026-10-31T18:29:59Z"), "2026-10");
  assert.equal(indiaMonthKey("2026-10-31T18:30:00Z"), "2026-11");
});

test("Phase 46 prioritizes pace, AOV and repeat revenue when they are weak", () => {
  const dashboard = buildMonthlyRevenueGoal({
    now: new Date("2026-10-08T10:00:00Z"),
    grossRevenue: 50_000,
    refunds: 5_000,
    netRevenue: 45_000,
    paidOrders: 50,
    aov: 1_000,
    repeatRevenueShare: 10,
    multiOrderCustomerRate: 12,
    topPlatform: null,
  });

  assert.ok(dashboard.signals.some((signal) => signal.title.includes("behind the ₹5L target pace")));
  assert.ok(dashboard.signals.some((signal) => signal.title.includes("Average order value is below")));
  assert.ok(dashboard.signals.some((signal) => signal.title.includes("Repeat-order revenue has room")));
  assert.ok(dashboard.signals.some((signal) => signal.href === "/admin/growth/traffic"));
  assert.ok(dashboard.signals.some((signal) => signal.href === "/dashboard/reseller"));
});

test("Phase 46 reads verified paid orders and completed refunds without changing commerce logic", () => {
  const page = read("app/admin/growth/revenue/page.tsx");
  assert.match(page, /\["paid", "completed"\]\.includes\(order\.payment_status/);
  assert.match(page, /transaction\.type === "refund"/);
  assert.match(page, /transaction\.status === "completed"/);
  assert.match(page, /buildVerifiedRevenueDashboard/);
  assert.match(page, /does not alter prices, wallet balances, payment amounts, fulfillment rules or order submission behavior/);
});

test("Phase 46 exposes the revenue control center in admin", () => {
  const sidebar = read("components/admin/AdminSidebar.tsx");
  const page = read("app/admin/growth/revenue/page.tsx");
  assert.match(sidebar, /₹5L Revenue/);
  assert.match(sidebar, /\/admin\/growth\/revenue/);
  assert.match(page, /Phase 46 · ₹5L Monthly Revenue Engine/);
  assert.match(page, /Verified monthly revenue control center/);
});
