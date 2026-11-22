import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

// Offline release regression only: never authenticate, call a hosted endpoint,
// invoke payment services or mutate either QA or production.
const read = path => readFileSync(path, "utf8");
const paymentFlags = read("lib/payments/methods.ts");
const paymentGuard = read("app/api/payments/cashfree/order/route.ts");
const availability = read("lib/payments/cashfree-availability.ts");
const providerRoute = read("app/api/provider/place-order/route.ts");
const providerClient = read("lib/provider/client.ts");
const manualOrderRoute = read("app/api/orders/manual-upi/route.ts");
const atomicMigration = read("supabase/migrations/202611210001_secure_legacy_checkout_and_atomic_manual_submission.sql");

test("all externally routed Cashfree payment methods remain disabled", () => {
  for (const method of ["upi", "card", "netbanking", "international_card"]) {
    assert.match(paymentFlags, new RegExp("^\\s*" + method + ": false,", "m"), method);
  }
  assert.match(availability, /isPaymentMethodEnabled\(method\)/);
  assert.match(paymentGuard, /if \(!cashfreeNewPaymentsEnabled\(\)\) return NextResponse\.json/);
  const disabled = paymentGuard.indexOf("if (!cashfreeNewPaymentsEnabled())");
  const auth = paymentGuard.indexOf("supabase.auth.getUser()");
  assert.ok(disabled >= 0 && auth > disabled, "gateway disabled before auth/provider work");
});

test("provider endpoint remains preparation only with no outbound submission", () => {
  assert.match(providerRoute, /mode: "preparation-only", sent: false/);
  assert.match(providerRoute, /providerClient\.preparePlaceOrder/);
  assert.doesNotMatch(providerRoute, /\bfetch\s*\(|axios\.|providerClient\.placeOrder\s*\(/);
  assert.doesNotMatch(providerClient, /\bfetch\s*\(|axios\./);
  assert.match(providerClient, /preparePlaceOrder\(/);
});

test("manual UPI route remains authenticated and uses one atomic service-only RPC", () => {
  assert.match(manualOrderRoute, /supabase\.auth\.getUser\(\)/);
  assert.match(manualOrderRoute, /requireActiveAccountApi\(supabase, user\.id\)/);
  assert.match(manualOrderRoute, /requireSameOrigin\(request\)/);
  assert.match(manualOrderRoute, /admin\.rpc\("submit_manual_payment_order_atomic"/);
  assert.doesNotMatch(manualOrderRoute, /\.from\("orders"\)\.insert\(/);
  assert.match(atomicMigration, /REVOKE ALL ON FUNCTION public\.submit_manual_payment_order_atomic[\s\S]*FROM PUBLIC, anon, authenticated/);
  assert.match(atomicMigration, /GRANT EXECUTE ON FUNCTION public\.submit_manual_payment_order_atomic[\s\S]*TO service_role/);
  assert.match(atomicMigration, /'verification_pending'/);
});

// This file intentionally does NOT certify deployed runtime config,
// backend isolation, approved admin-role journey, or hosted transaction safety.
