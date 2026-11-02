import { test } from "node:test";
import assert from "node:assert/strict";
import { scanLegacyRpcReferences, scanRepository } from "../../scripts/audit-legacy-rpc-callers.mjs";

test("legacy checkout scanner identifies actual RPC calls", () => {
  assert.deepEqual(scanLegacyRpcReferences('await db.rpc("place_order", { p_service_id: 1 })'), ["place_order"]);
  assert.deepEqual(scanLegacyRpcReferences("select public.place_campaign(1, 'url', 'starter')"), ["place_campaign"]);
  assert.deepEqual(scanLegacyRpcReferences("supabase.rpc('create_wallet_payment', args)"), ["create_wallet_payment"]);
});
test("scanner does not confuse unrelated words with checkout calls", () => {
  assert.deepEqual(scanLegacyRpcReferences("const place_order = true;"), []);
});

test("report repository-wide legacy RPC references without changing checkout", () => {
  const matches = scanRepository();
  console.log("Legacy RPC caller audit:", JSON.stringify(matches));
  assert.ok(Array.isArray(matches.runtimeCandidates));
  assert.ok(Array.isArray(matches.nonRuntimeReferences));
});
