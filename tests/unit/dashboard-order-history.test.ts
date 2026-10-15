import test from "node:test";
import assert from "node:assert/strict";
import { mapHistoryOrders, type HistoryRow } from "../../lib/orders/history.ts";

const row: HistoryRow = {
  id: "order-one", public_order_id: "SR-ABC123", service_name: "Custom comments", platform: "youtube",
  link: "https://www.youtube.com/watch?v=fixture", quantity: 12, charge: 51.25,
  status: "processing", payment_status: "verification_pending", created_at: "2026-10-01T00:00:00Z",
  package_name: null, delivered_count: null, remaining_count: 12, progress_percent: null,
  refill_eligible: true, refill_requested_at: null, services: { delivery_time: "Current estimate", refill_policy: "See terms" },
};
test("server-rendered history preserves payment checks, refill facts and unknown progress", () => {
  const [result] = mapHistoryOrders([row]);
  assert.equal(result.amount, 51.25);
  assert.equal(result.paymentStatus, "verification_pending");
  assert.equal(result.deliveredCount, null);
  assert.equal(result.progress, null);
  assert.equal(result.refillEligible, true);
  assert.equal(result.refillPolicy, "See terms");
  assert.equal(result.link, row.link);
});
test("history keeps zero delivery distinct from unknown delivery and uses stored references", () => {
  const [result] = mapHistoryOrders([{ ...row, public_order_id: null, delivered_count: 0, progress_percent: 0 }]);
  assert.equal(result.deliveredCount, 0);
  assert.equal(result.progress, 0);
  assert.equal(result.publicOrderId, "Order reference unavailable");
  assert.deepEqual(mapHistoryOrders([]), []);
});
