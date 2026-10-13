import test from "node:test";
import assert from "node:assert/strict";
import { dashboardLinks, groupDashboardLinks, isDashboardLinkActive } from "../../lib/dashboard/navigation.ts";

test("customer dashboard navigation groups live routes without duplicates", () => {
  const groups = groupDashboardLinks();
  assert.deepEqual(Object.keys(groups), ["Main", "Workspace", "Money", "Account", "Help"]);
  assert.equal(groups.Main[0].href, "/dashboard");
  assert.ok(groups.Main.some((item) => item.href === "/dashboard/new-order"));
  assert.ok(groups.Main.some((item) => item.href === "/dashboard/packages"));
  assert.ok(groups.Money.some((item) => item.href === "/dashboard/billing"));
  assert.ok(groups.Account.some((item) => item.href === "/dashboard/notifications"));
  assert.equal(new Set(dashboardLinks.map((item) => item.href)).size, dashboardLinks.length);
});

test("navigation distinguishes favourites and exact route boundaries", () => {
  assert.equal(isDashboardLinkActive("/dashboard/new-order?tab=favourites", "/dashboard/new-order", "tab=favourites"), true);
  assert.equal(isDashboardLinkActive("/dashboard/new-order", "/dashboard/new-order", "tab=favourites"), false);
  assert.equal(isDashboardLinkActive("/dashboard/new-order?tab=favourites", "/dashboard/new-order", ""), false);
  assert.equal(isDashboardLinkActive("/dashboard/orders", "/dashboard/orders/fixture"), true);
  assert.equal(isDashboardLinkActive("/dashboard/orders", "/dashboard/orders-other"), false);
  assert.equal(isDashboardLinkActive("/dashboard/orders", "/dashboard/order-history"), true);
  assert.equal(isDashboardLinkActive("/dashboard/wallet", "/dashboard/add-funds"), true);
  assert.equal(isDashboardLinkActive("/dashboard", "/dashboard/new-order"), false);
});

test("primary destinations and previously hidden workspace features remain available", () => {
  const groups = groupDashboardLinks();
  for (const href of ["/dashboard/new-order", "/dashboard/orders", "/dashboard/wallet", "/dashboard/packages"]) assert.ok(groups.Main.some(item => item.href === href));
  for (const href of ["/dashboard/settings", "/dashboard/rewards", "/dashboard/reviews", "/dashboard/repeat-campaigns", "/dashboard/api-docs"]) assert.ok(dashboardLinks.some(item => item.href === href));
});
