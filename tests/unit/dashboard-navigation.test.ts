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
  assert.match(sidebar, /<details key=\{group\} open=\{isWorkspaceRoute\(pathname, query\)\}/);
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

test("query shortcuts and money continuations retain one correct active destination", () => {
  assert.equal(isDashboardLinkActive("/dashboard/new-order", "/dashboard/new-order?tab=favourites", "tab=favourites"), true);
  assert.equal(isDashboardLinkActive("/dashboard/new-order", "/dashboard/new-order", "tab=favourites"), false);
  assert.equal(isDashboardLinkActive("/dashboard/add-funds", "/dashboard/wallet"), true);
  assert.equal(isDashboardLinkActive("/dashboard/order-history", "/dashboard/orders"), true);
  assert.equal(dashboardLinks.length, 22);
});

test("wallet balance and money actions precede lengthy payment-confidence explanations", () => {
  const walletPage = source("app/dashboard/wallet/page.tsx");
  const walletLayout = source("app/dashboard/wallet/layout.tsx");
  const summaryPosition = walletPage.indexOf("<WalletDashboard initial={initial} />");
  const confidencePosition = walletPage.indexOf("<PaymentConfidencePanel transactions={transactions}");
  assert.ok(summaryPosition >= 0 && confidencePosition > summaryPosition, "show wallet balance and money actions before the supplementary confidence dashboard");
  assert.match(walletPage, /<WalletAddFundsRedirect \/>/);
  assert.ok(walletLayout.indexOf("{children}") < walletLayout.indexOf('<PaymentConfidenceExperience mode="wallet" />'));
  assert.match(walletPage, /#add-funds\{display:none!important\}/);
});

test("narrow desktop header preserves action space and uses the shared route helper correctly", () => {
  assert.match(source("components/dashboard/DashboardHeaderBar.tsx"), /isDashboardLinkActive\(pathname, item.href, query\)/);
  assert.match(source("components/dashboard/PremiumWorkspace.module.css"), /@media \(min-width: 1440px\) \{ \.workspaceLabel \{ display: block; \} \}/);
});
