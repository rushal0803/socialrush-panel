import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL("../../" + path, import.meta.url), "utf8");

test("wallet checkout queues only new orders after success and behind feature flag", () => {
  const source = read("app/api/orders/route.ts");
  assert.match(source, /checkout\?\.id && !checkout\.duplicate/);
  assert.match(source, /ORDER_NOTIFICATIONS_ENABLED/);
  assert.match(source, /enqueueOrderNotice\(checkout\.id, "order_placed"/);
});

test("cron endpoint requires a configured bearer secret", () => {
  const source = read("app/api/cron/order-notifications/route.ts");
  assert.match(source, /!process\.env\.CRON_SECRET/);
  assert.match(source, /authorization/);
});

test("notification worker stays disabled by default and uses idempotency", () => {
  const source = read("lib/orders/notification-delivery.ts");
  assert.match(source, /ORDER_NOTIFICATIONS_ENABLED !== "true"/);
  assert.match(source, /idempotencyKey: notice\.event_key/);
});

test("notification cron is scheduled once per day", () => {
  const config = JSON.parse(read("vercel.json"));
  const cron = config.crons.find((item) => item.path === "/api/cron/order-notifications");
  assert.equal(cron?.schedule, "20 3 * * *");
});
