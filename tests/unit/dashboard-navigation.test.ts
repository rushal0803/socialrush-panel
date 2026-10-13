import test from "node:test";
import assert from "node:assert/strict";
import { dashboardLinks, groupDashboardLinks, isDashboardNavItemActive } from "../../lib/dashboard/navigation.ts";

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


test("navigation selects only one active destination and preserves money/checkout aliases", () => {
  assert.equal(isDashboardNavItemActive("/dashboard", "/dashboard"), true);
  assert.equal(isDashboardNavItemActive("/dashboard/orders", "/dashboard"), false);
  assert.equal(isDashboardNavItemActive("/dashboard/orders/abc", "/dashboard/orders"), true);
  assert.equal(isDashboardNavItemActive("/dashboard/orders-extra", "/dashboard/orders"), false);
  assert.equal(isDashboardNavItemActive("/dashboard/add-funds", "/dashboard/wallet"), true);
  assert.equal(isDashboardNavItemActive("/dashboard/order-history", "/dashboard/orders"), true);
  assert.equal(isDashboardNavItemActive("/dashboard/direct-upi", "/dashboard/new-order"), true);
  assert.equal(isDashboardNavItemActive("/dashboard/new-order", "/dashboard/new-order?tab=favourites", "tab=favourites"), true);
  assert.equal(isDashboardNavItemActive("/dashboard/new-order", "/dashboard/new-order", "tab=favourites"), false);
  assert.equal(isDashboardNavItemActive("/dashboard/new-order", "/dashboard/new-order?tab=favourites", ""), false);
});

test("money actions and dashboard routes remain available after mobile navigation grouping", () => {
  const sidebar = readFileSync(new URL("../../components/Sidebar.tsx", import.meta.url), "utf8");
  const drawer = readFileSync(new URL("../../components/dashboard/DashboardMobileMenu.tsx", import.meta.url), "utf8");
  const bottom = readFileSync(new URL("../../components/dashboard/MobileBottomNav.tsx", import.meta.url), "utf8");
  assert.match(sidebar, /\["Main", "Money", "Workspace", "Account", "Help"\]/);
  assert.match(sidebar, /<details/);
  assert.match(drawer, /<NavLinks mobile/);
  assert.match(drawer, /href="\/dashboard\/wallet"/);
  assert.match(drawer, /href="\/dashboard\/support"/);
  assert.match(bottom, /isDashboardNavItemActive\(pathname, href\)/);
});
