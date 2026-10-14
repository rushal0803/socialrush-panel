import test from "node:test";
import assert from "node:assert/strict";
import { dashboardLinks, groupDashboardLinks } from "../../lib/dashboard/navigation.ts";

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

import { isDashboardLinkActive, isWorkspaceRoute } from "../../lib/dashboard/navigation.ts";
import { readFileSync } from "node:fs";
const source = (path: string) => readFileSync(new URL("../../" + path, import.meta.url), "utf8");

test("dashboard highlights exact or nested pages, not lookalikes and query-specific shortcuts", () => {
  assert.equal(isDashboardLinkActive("/dashboard", "/dashboard"), true);
  assert.equal(isDashboardLinkActive("/dashboard/new-order", "/dashboard"), false);
  assert.equal(isDashboardLinkActive("/dashboard/orders/abc", "/dashboard/orders"), true);
  assert.equal(isDashboardLinkActive("/dashboard/orders-other", "/dashboard/orders"), false);
  assert.equal(isDashboardLinkActive("/dashboard/new-order", "/dashboard/new-order?tab=favourites"), false);
  assert.equal(isDashboardLinkActive("/dashboard/new-order", "/dashboard/new-order"), true);
});

test("workspace menu stays discoverable and expands when visiting nested workspace pages", () => {
  assert.equal(isWorkspaceRoute("/dashboard/campaigns/123"), true);
  assert.equal(isWorkspaceRoute("/dashboard/reseller/portfolio"), true);
  assert.equal(isWorkspaceRoute("/dashboard/wallet"), false);
  assert.equal(isWorkspaceRoute("/dashboard/new-order"), false);
  const sidebar = source("components/Sidebar.tsx");
  assert.match(sidebar, /<details key=\{group\} open=\{isWorkspaceRoute\(pathname\)\}/);
  assert.doesNotMatch(sidebar, /\bdefaultOpen=/);
  assert.match(sidebar, /<summary/);
  assert.doesNotMatch(sidebar, /from "framer-motion"/);
});

test("mobile drawer provides quick actions, close and accessible fixed navigation", () => {
  const drawer = source("components/dashboard/DashboardMobileMenu.tsx");
  const bottom = source("components/dashboard/MobileBottomNav.tsx");
  assert.match(drawer, /aria-label="Close menu"/);
  assert.match(drawer, /href="\/dashboard\/new-order"/);
  assert.match(drawer, /href="\/dashboard\/add-funds"/);
  assert.match(drawer, /href="\/dashboard\/orders"/);
  assert.match(drawer, /<MobileMenuLayer/);
  assert.match(bottom, /data-dashboard-bottom-nav/);
  assert.match(bottom, /direct-upi/);
  assert.match(bottom, /safe-area-inset-bottom/);
});
