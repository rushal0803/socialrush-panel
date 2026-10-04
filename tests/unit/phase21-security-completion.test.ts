import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path: string) => readFileSync(new URL("../../" + path, import.meta.url), "utf8");

test("Phase 21 completion keeps privileged admin RPCs on the server-only service-role client", () => {
  const adminActions = read("app/admin/actions.ts");
  const crmActions = read("app/admin/crm/actions.ts");
  const refundRoute = read("app/api/payments/razorpay/refund/route.ts");
  const orderRoute = read("app/api/orders/route.ts");

  assert.match(adminActions, /import \{ createAdminClient \} from "@\/lib\/supabase\/admin"/);
  assert.match(adminActions, /adminSupabase: createAdminClient\(\)/);
  assert.match(adminActions, /adminSupabase\.rpc\("admin_credit_reward"/);
  assert.match(adminActions, /adminSupabase\.rpc\("admin_adjust_balance"/);
  assert.match(adminActions, /adminSupabase\.rpc\("admin_set_user_blocked"/);
  assert.match(adminActions, /adminSupabase\.rpc\("admin_review_payment"/);
  assert.match(adminActions, /refundOrderToWalletOnce\(adminSupabase,/);

  assert.match(crmActions, /import \{ createAdminClient \} from "@\/lib\/supabase\/admin"/);
  assert.match(crmActions, /adminSupabase:createAdminClient\(\)/);
  assert.match(crmActions, /adminSupabase\.rpc\("admin_run_crm_automation"/);
  assert.match(refundRoute, /import \{ createAdminClient \} from "@\/lib\/supabase\/admin"/);
  assert.match(refundRoute, /admin\.rpc\("admin_refund_wallet_payment"/);
  assert.match(orderRoute, /import \{ createAdminClient \} from "@\/lib\/supabase\/admin"/);
  assert.match(orderRoute, /saveInitialCount\(createAdminClient\(\),/);
});

test("Phase 21 completion does not move customer self-service RPCs to service role", () => {
  const adminActions = read("app/admin/actions.ts");
  const crmActions = read("app/admin/crm/actions.ts");
  const orderRoute = read("app/api/orders/route.ts");

  for (const source of [adminActions, crmActions, orderRoute]) {
    assert.doesNotMatch(source, /adminSupabase\.rpc\("(?:place_order|create_support_ticket|create_wallet_payment|submit_verified_review|update_my_account)"/);
  }
});

test("Phase 21 completion preserves authenticated admin verification before service-role mutation", () => {
  const adminActions = read("app/admin/actions.ts");
  const crmActions = read("app/admin/crm/actions.ts");

  assert.match(adminActions, /supabase\.auth\.getUser\(\)/);
  assert.match(adminActions, /profile\?\.role !== "admin"/);
  assert.match(crmActions, /supabase\.auth\.getUser\(\)/);
  assert.match(crmActions, /p\?\.role!=="admin"/);
});
