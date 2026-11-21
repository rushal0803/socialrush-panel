import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

test("customer checkout APIs fail closed for blocked or unreadable accounts", () => {
  const helper = read("lib/security/active-account-api.ts");
  assert.match(helper, /\.select\("is_blocked"\)/);
  assert.match(helper, /if \(error\)[\s\S]*status: 503/);
  assert.match(helper, /!profile \|\| profile\.is_blocked/);
  assert.match(helper, /status: 403/);
  for (const path of [
    "app/api/orders/route.ts",
    "app/api/checkout/intent/route.ts",
    "app/api/orders/manual-upi/route.ts",
    "app/api/wallet/manual-upi/route.ts",
  ]) {
    const source = read(path);
    assert.match(source, /requireActiveAccountApi\(supabase, user\.id\)/, path);
    assert.match(source, /if \(denied\) return denied/, path);
  }
  const orderRoute=read("app/api/orders/route.ts");
  assert.equal((orderRoute.match(/requireActiveAccountApi\(supabase, user\.id\)/g)||[]).length,2,
    "Both order read and write must guard blocked users");
});

test("admin API and server actions reject blocked admins", () => {
  const helper=read("lib/admin/require-admin-api.ts");
  assert.match(helper, /\.select\("role,is_blocked"\)/);
  assert.match(helper, /profile\.is_blocked/);
  const actions=read("app/admin/actions.ts");
  assert.match(actions, /\.select\("role,is_blocked"\)/);
  assert.match(actions, /profile\.is_blocked/);
  const provider=read("app/api/provider/place-order/route.ts");
  assert.match(provider, /requireAdminApi\(\)/);
  assert.doesNotMatch(provider, /select\("role"\)/);
});

test("login-only bypass header is stripped from arbitrary incoming admin requests", () => {
  const middleware=read("lib/supabase/middleware.ts");
  assert.match(middleware, /requestHeaders\.delete\("x-socialrush-admin-login"\)/);
  assert.match(middleware, /pathname === "\/admin\/login"/);
  assert.match(middleware, /requestHeaders\.set\("x-socialrush-admin-login", "1"\)/);
  assert.match(middleware, /accessProfile\.role !== "admin"/);
});
