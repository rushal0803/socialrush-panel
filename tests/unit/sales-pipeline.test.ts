import assert from "node:assert/strict";
import test from "node:test";
import { activeLeadCount, buildLeadStageCounts, customerRevenueSummary, sortSalesOpportunities } from "@/lib/crm/sales-pipeline";

test("lead stage counts preserve the full sales pipeline", () => {
  const rows = buildLeadStageCounts([
    { status: "new" },
    { status: "contacted" },
    { status: "replied" },
    { status: "replied" },
    { status: "won" },
    { status: "lost" },
  ] as any);
  assert.equal(rows.find(row => row.status === "replied")?.count, 2);
  assert.equal(rows.find(row => row.status === "won")?.count, 1);
  assert.equal(rows.find(row => row.status === "qualified")?.count, 0);
});

test("active lead count excludes won lost and do-not-contact", () => {
  assert.equal(activeLeadCount([
    { status: "new" },
    { status: "ready" },
    { status: "qualified" },
    { status: "won" },
    { status: "lost" },
    { status: "do_not_contact" },
  ] as any), 3);
});

test("sales opportunities prioritize replies before score", () => {
  const rows = sortSalesOpportunities([
    { status: "ready", score: 95, updated_at: "2026-09-28T10:00:00Z" },
    { status: "replied", score: 40, updated_at: "2026-09-27T10:00:00Z" },
    { status: "qualified", score: 80, updated_at: "2026-09-29T10:00:00Z" },
  ] as any);
  assert.equal(rows[0].status, "replied");
  assert.equal(rows[1].status, "qualified");
});

test("customer revenue summary separates first order repeat and reactivation", () => {
  const now = Date.parse("2026-09-29T00:00:00Z");
  const rows = [
    { metrics: { validOrders: 1 } as any, lastCompletedAt: "2026-09-25T00:00:00Z" },
    { metrics: { validOrders: 3 } as any, lastCompletedAt: "2026-09-01T00:00:00Z" },
    { metrics: { validOrders: 0 } as any, lastCompletedAt: null },
  ];
  const summary = customerRevenueSummary(rows, now);
  assert.equal(summary.completedCustomers, 2);
  assert.equal(summary.firstOrderCustomers, 1);
  assert.equal(summary.repeatCustomers, 1);
  assert.equal(summary.active30, 2);
  assert.equal(summary.reactivation, 1);
});
