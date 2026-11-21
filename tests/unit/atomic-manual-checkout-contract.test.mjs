import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const sql = readFileSync("supabase/migrations/202611210001_secure_legacy_checkout_and_atomic_manual_submission.sql", "utf8");
const route = readFileSync("app/api/orders/manual-upi/route.ts", "utf8");
const config = JSON.parse(readFileSync("vercel.json", "utf8"));

test("legacy mismatched service-code and malformed order RPCs are no longer public", () => {
  for (const signature of [
    "checkout_campaign_with_wallet(bigint,text,text,integer,uuid)",
    "place_order(bigint,text,integer)",
    "place_campaign(bigint,text,text)",
    "apply_wallet_to_manual_checkout(uuid,uuid,numeric)",
  ]) {
    assert.ok(sql.includes("REVOKE EXECUTE ON FUNCTION public." + signature), signature);
  }
});

test("atomic manual RPC has strict service-role grants", () => {
  assert.match(sql, /coalesce\(auth\.jwt\(\)->>'role',''\) <> 'service_role'/);
  assert.match(sql, /REVOKE ALL ON FUNCTION public\.submit_manual_payment_order_atomic[\s\S]*FROM PUBLIC, anon, authenticated/);
  assert.match(sql, /GRANT EXECUTE ON FUNCTION public\.submit_manual_payment_order_atomic[\s\S]*TO service_role/);
  assert.match(sql, /p_user_id uuid/);
  assert.match(sql, /id=p_intent_id AND user_id=p_user_id/);
  assert.match(sql, /pg_advisory_xact_lock/);
  assert.match(sql, /user_id=p_user_id AND client_request_id=p_client_request_id/);
});

test("manual checkout debits wallet and saves verification order in the same RPC", () => {
  assert.match(sql, /FOR UPDATE/);
  assert.match(sql, /v_intent\.total_paise::numeric\/100/);
  assert.match(sql, /round\(v_applied,2\) <> p_expected_wallet/);
  assert.match(sql, /v_remaining <= 0/);
  assert.match(sql, /UPDATE public\.profiles SET balance=balance-v_applied/);
  assert.match(sql, /INSERT INTO public\.transactions/);
  assert.match(sql, /INSERT INTO public\.orders/);
  assert.match(sql, /payment_status/);
  assert.match(sql, /'verification_pending'/);
  assert.match(sql, /UPDATE public\.checkout_intents[\s\S]*status='completed'/);
  assert.match(sql, /Existing wallet split requires manual reconciliation/);
  assert.match(sql, /payment reference already submitted/i);
});

test("manual order server route uses atomic RPC; never debits before an insert", () => {
  assert.match(route, /admin\.rpc\("submit_manual_payment_order_atomic"/);
  assert.doesNotMatch(route, /supabase\.rpc\("apply_wallet_to_manual_checkout"/);
  assert.doesNotMatch(route, /\.from\("orders"\)\.insert/);
  assert.doesNotMatch(route, /\.from\("checkout_intents"\)\.update/);
  assert.match(route, /requireSameOrigin\(request\)/);
  assert.match(route, /rateLimit\(request, "manual-payment-order"/);
  assert.match(route, /recordTrustedEvent/);
});

test("isolated security branch cannot trigger original project Git deployment", () => {
  assert.equal(config.git.deploymentEnabled["security/atomic-manual-checkout-review-20261121"], false);
  assert.equal(config.git.deploymentEnabled["release/socialrush-phase4-main-integration-20261121"], false);
});
