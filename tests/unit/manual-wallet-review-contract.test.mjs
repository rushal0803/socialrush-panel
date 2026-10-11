import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const sql = readFileSync("supabase/migrations/202610110001_admin_manual_wallet_atomic_review.sql", "utf8");
const actions = readFileSync("app/admin/actions.ts", "utf8");
const review = actions.slice(actions.indexOf("export async function reviewManualWalletPayment"), actions.indexOf("export async function updateTransactionStatus"));

test("manual deposit review supports all three methods", () => {
  for (const method of ["manual_upi", "manual_bank_transfer", "manual_usdt_trc20"]) {
    assert.ok(sql.includes(method), method);
  }
});
test("only service role can invoke atomic review RPC", () => {
  assert.ok(sql.includes("coalesce(auth.jwt()->>'role', '') <> 'service_role'"));
  assert.match(sql, /revoke all on function public\.admin_review_manual_wallet_payment\(uuid,text,text,text\) from anon, authenticated/);
  assert.match(sql, /grant execute on function public\.admin_review_manual_wallet_payment\(uuid,text,text,text\) to service_role/);
});
test("wallet balance update and transaction status share one locked transaction", () => {
  assert.match(sql, /for update/);
  assert.match(sql, /v_payment\.status\s*<>\s*'pending'/);
  assert.match(sql, /balance\s*=\s*balance\s*\+\s*v_payment\.amount/);
  assert.match(sql, /status=case when p_decision='approve' then 'completed' else 'failed' end/);
  assert.match(sql, /if not found then raise exception 'Wallet profile missing'/);
});
test("approval rejects non-positive deposit amounts", () => {
  assert.match(sql, /v_payment\.amount is null or v_payment\.amount <= 0/);
  assert.match(sql, /raise exception 'Invalid deposit amount'/);
});
test("transaction ID and review evidence are required", () => {
  assert.match(sql, /upper\(trim\(p_verified_transaction_id\)\)\s*<>\s*upper\(coalesce\(v_payment\.provider_payment_id,''\)\)/);
  assert.match(sql, /admin_review_evidence/);
  assert.match(sql, /admin_reviewed_at/);
});
test("admin server action uses privileged atomic RPC after receipt confirmation", () => {
  assert.match(review, /await requireAdmin\(\)/);
  assert.match(review, /receiptVerified/);
  assert.match(review, /adminSupabase\.rpc\("admin_review_manual_wallet_payment"/);
  assert.doesNotMatch(review, /\.from\("transactions"\)\.update/);
});


test("legacy admin order form cannot bypass pending payment verification", () => {
  const actions = readFileSync("app/admin/actions.ts", "utf8");
  const legacy = actions.slice(actions.indexOf("export async function updateOrder("), actions.indexOf("export async function adjustBalance("));
  assert.match(legacy, /payment_status/);
  assert.match(legacy, /verification_pending/);
  assert.match(legacy, /\["pending", "cancelled", "failed"\]\.includes\(nextStatus\)/);
});


test("one-click order approval derives transaction reference from stored submission", () => {
  const route = readFileSync("app/api/admin/orders/[id]/status/route.ts", "utf8");
  const ui = readFileSync("components/admin/AdminPendingPaymentVerification.tsx", "utf8");
  assert.match(route, /auth\.user\.id/);
  assert.match(route, /currentOrder\.customer_note/);
  assert.match(route, /body\?\.receiptVerified !== true/);
  assert.match(route, /\.eq\("payment_status", currentOrder\.payment_status\)/);
  assert.doesNotMatch(ui, /setVerifiedTransactionId|setVerificationNote/);
  assert.match(ui, /disabled=\{busy \|\| !receiptVerified\}/);
});

test("one-click wallet approval records admin identity and preserves atomic RPC", () => {
  const ui = readFileSync("app/admin/transactions/page.tsx", "utf8");
  assert.doesNotMatch(ui, /name="verifiedTransactionId"|name="evidence"/);
  assert.match(ui, /name="receiptVerified"/);
  assert.match(review, /user\.id/);
  assert.match(review, /transaction\.provider_payment_id/);
  assert.match(review, /adminSupabase\.rpc\("admin_review_manual_wallet_payment"/);
});
