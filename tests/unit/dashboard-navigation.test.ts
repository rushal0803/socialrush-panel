import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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
  assert.equal(isDashboardLinkActive("/dashboard/new-order", "/dashboard/order-summary"), true);
  assert.equal(isDashboardLinkActive("/dashboard/new-order", "/dashboard/order-summary", "tab=favourites"), true);
  assert.equal(isDashboardLinkActive("/dashboard/wallet", "/dashboard/direct-upi"), true);
  assert.equal(isDashboardLinkActive("/dashboard/new-order", "/dashboard/order-summary-other"), false);
  assert.equal(isDashboardLinkActive("/dashboard", "/dashboard/new-order"), false);
});

test("primary destinations and previously hidden workspace features remain available", () => {
  const groups = groupDashboardLinks();
  for (const href of ["/dashboard/new-order", "/dashboard/orders", "/dashboard/wallet", "/dashboard/packages"]) assert.ok(groups.Main.some(item => item.href === href));
  for (const href of ["/dashboard/settings", "/dashboard/rewards", "/dashboard/reviews", "/dashboard/repeat-campaigns", "/dashboard/api-docs"]) assert.ok(dashboardLinks.some(item => item.href === href));
});

test("mobile drawer keeps funds and support in a visible footer, without duplicated primary links", () => {
  const menu = readFileSync(new URL("../../components/dashboard/DashboardMobileMenu.tsx", import.meta.url), "utf8");
  assert.match(menu, /min-h-0 flex-1 overflow-y-auto/);
  assert.match(menu, /role="group" aria-label="Quick dashboard actions" className="shrink-0/);
  assert.ok(menu.includes('href="/dashboard/wallet#add-funds"'));
  assert.ok(menu.includes('href="/dashboard/support"'));
  assert.match(menu, /<NavLinks mobile/);
  assert.ok(menu.includes("<AndroidAppDownload />"));
  assert.match(menu, /onClick={handleLogout}/);
  assert.equal(menu.includes("Start Order"), false);
  assert.equal(menu.includes("Profile"), false);
});


test("wallet balance and money actions precede lengthy payment-confidence explanations", () => {
  const walletPage = readFileSync(new URL("../../app/dashboard/wallet/page.tsx", import.meta.url), "utf8");
  const walletLayout = readFileSync(new URL("../../app/dashboard/wallet/layout.tsx", import.meta.url), "utf8");
  const summaryPosition = walletPage.indexOf("<WalletDashboard initial={initial} />");
  const confidencePosition = walletPage.indexOf("<PaymentConfidencePanel transactions={transactions}");
  assert.ok(summaryPosition >= 0 && confidencePosition > summaryPosition, "show wallet balance and money actions before the supplementary confidence dashboard");
  assert.match(walletPage, /<WalletAddFundsRedirect \/>/);
  assert.ok(walletLayout.indexOf("{children}") < walletLayout.indexOf('<PaymentConfidenceExperience mode="wallet" />'));
  assert.match(walletPage, /#add-funds\{display:none!important\}/);
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
