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
  assert.doesNotMatch(walletPage, /#add-funds\{display:none!important\}/);
  const wallet = source("components/wallet/WalletDashboard.tsx");
  assert.doesNotMatch(wallet, /<section id="add-funds"/);
  assert.match(wallet, /href="\/dashboard\/add-funds"/);
});

test("narrow desktop header preserves action space and uses the shared route helper correctly", () => {
  assert.match(source("components/dashboard/DashboardHeaderBar.tsx"), /isDashboardLinkActive\(pathname, item.href, query\)/);
  assert.match(source("components/dashboard/PremiumWorkspace.module.css"), /@media \(min-width: 1440px\) \{ \.workspaceLabel \{ display: block; \} \}/);
});

test("money-page checkout contrast and route-scoped UPI overlay", () => {
  const read = (path: string) => readFileSync(new URL("../../" + path, import.meta.url), "utf8");
  const shell = read("app/dashboard/layout.tsx");
  const reviewLayout = read("app/dashboard/order-summary/layout.tsx");
  const review = read("app/dashboard/order-summary/page.tsx");
  const recovery = read("components/dashboard/AbandonedCheckoutRecovery.tsx");
  assert.doesNotMatch(shell, /<ProfessionalUpiCheckout\s*\/>/);
  assert.match(reviewLayout, /<ProfessionalUpiCheckout\s*\/>/);
  assert.match(reviewLayout, /\{children\}/);
  assert.match(read("components/dashboard/ProfessionalUpiCheckout.tsx"), /pathname !== "\/dashboard\/order-summary"/);
  assert.match(review, /bg-\[#141820\]/);
  assert.match(review, /bg-\[#0B1018\]/);
  assert.doesNotMatch(review, /bg-white p-5 shadow-sm/);
  assert.doesNotMatch(recovery, /border-orange-200 bg-orange-50/);
  assert.match(recovery, /bg-\[#151922\]/);
  assert.match(read("components/dashboard/PremiumWorkspace.module.css"), /font-size: max\(1rem, 1em\)/);
  assert.match(review, /placeWalletOrder\(\)/);
  assert.match(review, /\/api\/orders/);
  assert.match(review, /\/api\/checkout\/intent/);
});


test("billing details remain above mobile navigation and support keyboard focus", () => {
  const read = (path: string) => readFileSync(new URL("../../" + path, import.meta.url), "utf8");
  const billing = read("components/dashboard/BillingDashboardContent.tsx");
  assert.match(billing, /useBodyScrollLock\(true\)/);
  assert.match(billing, /role="dialog" aria-modal="true"/);
  assert.match(billing, /z-\[100\]/);
  assert.match(billing, /closeButtonRef\.current\?\.focus\(\)/);
  assert.match(billing, /previousFocus\.focus\(\)/);
  assert.match(billing, /event\.key === "Escape"/);
  assert.match(billing, /event\.key !== "Tab"/);
  assert.match(billing, /onKeyDown=\{onDialogKeyDown\}/);
  assert.match(billing, /onReset=\{resetFilters\}/);
  assert.match(billing, />Clear filters<\/button>/);
});
