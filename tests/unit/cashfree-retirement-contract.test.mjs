import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const retired = readFileSync(new URL("../../app/api/payments/cashfree/order/route.ts", import.meta.url), "utf8");
const webhook = readFileSync(new URL("../../app/api/payments/cashfree/webhook/route.ts", import.meta.url), "utf8");

test("retired Cashfree order endpoint returns 410 without creating provider orders", () => {
  assert.match(retired, /export async function POST\(\)/);
  assert.match(retired, /status:\s*410/);
  assert.doesNotMatch(retired, /cashfreeRequest\s*\(|create_wallet_payment|createAdminClient/);
});

test("historical Cashfree webhook retains signature and settlement checks", () => {
  assert.match(webhook, /verifyCashfreeWebhook\(/);
  assert.match(webhook, /settle_cashfree_checkout_intent_payment_system/);
  assert.match(webhook, /payment_status/);
});
