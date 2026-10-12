import assert from "node:assert/strict";
import test from "node:test";
import { orderNotificationEvents, orderNotificationKey } from "../../lib/orders/notification-policy.ts";
import { orderNoticeContent } from "../../lib/orders/notification-content.ts";

test("unverified payment never triggers confirmation or processing notifications", () => {
  assert.deepEqual(orderNotificationEvents({ status: "pending", paymentStatus: "verification_pending" }, { status: "processing", paymentStatus: "verification_pending" }), []);
});
test("verified payment and processing transitions produce distinct events", () => {
  assert.deepEqual(orderNotificationEvents({ status: "pending", paymentStatus: "verification_pending" }, { status: "processing", paymentStatus: "paid" }), ["payment_verified", "processing_started"]);
});
test("repeated status does not generate duplicate lifecycle events", () => {
  assert.deepEqual(orderNotificationEvents({ status: "completed", paymentStatus: "paid" }, { status: "completed", paymentStatus: "paid" }), []);
});
test("order completion copy does not invent delivery measurements", () => {
  assert.match(orderNoticeContent("order_completed", "SR-123").message, /when available/);
  assert.equal(orderNotificationKey("abc", "order_completed"), "order:abc:order_completed");
});
