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

test("database queue denies browser roles and uses atomic row claiming", () => {
  const migration = read("supabase/migrations/202610130001_order_notification_outbox.sql");
  assert.match(migration, /enable row level security/i);
  assert.match(migration, /revoke all on public\.order_notification_outbox from anon, authenticated/i);
  assert.match(migration, /auth\.role\(\) <> 'service_role'/);
  assert.match(migration, /for update skip locked/i);
  assert.match(migration, /grant execute on function public\.claim_order_notification_batch\(integer\) to service_role/i);
});

test("admin status notices are feature-gated and failure-isolated", () => {
  const source = read("app/api/admin/orders/[id]/status/route.ts");
  assert.match(source, /ORDER_NOTIFICATIONS_ENABLED === "true"/);
  assert.match(source, /orderNotificationEvents\(/);
  assert.match(source, /enqueueOrderNotice\(params\.id, kind/);
  assert.match(source, /\[order-notifications\] enqueue failed/);
});
