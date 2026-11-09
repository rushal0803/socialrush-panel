import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { scanRepository } from "../../scripts/audit-legacy-rpc-callers.mjs";

const analytics = readFileSync(new URL("../../app/api/analytics/route.ts", import.meta.url), "utf8");
const retiredCashfree = readFileSync(new URL("../../app/api/payments/cashfree/order/route.ts", import.meta.url), "utf8");

test("analytics route rejects cross-origin browser beacons before database RPC", () => {
  assert.match(analytics, /request\.headers\.get\("origin"\)/);
  assert.match(analytics, /Invalid request origin/);
  assert.ok(analytics.indexOf('request.headers.get("origin")') < analytics.indexOf('db.rpc("record_analytics_event"'));
});

test("retired Cashfree endpoint cannot create wallet payments", () => {
  assert.match(retiredCashfree, /status:\s*410/);
  assert.doesNotMatch(retiredCashfree, /\.rpc\(|cashfreeRequest\(/);
});

test("legacy order RPC references are inventoried for manual authorization review", () => {
  const matches = scanRepository();
  assert.ok(Array.isArray(matches.runtimeCandidates));
  assert.ok(Array.isArray(matches.nonRuntimeReferences));
  const names = new Set(matches.runtimeCandidates.flatMap(item => item.functions));
  assert.equal(names.has("place_order"), false, "Legacy place_order has an application caller: review before changing grants");
  assert.equal(names.has("place_campaign"), false, "Legacy place_campaign has an application caller: review before changing grants");
});
