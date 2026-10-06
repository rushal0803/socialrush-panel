import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildFirstOrderContext, isQualifyingFirstOrderState, resolveFirstOrderConversionMode } from "../../lib/cro/first-order-conversion.ts";

const read = (path: string) => readFileSync(new URL("../../" + path, import.meta.url), "utf8");

test("Phase 34 gives unfinished checkout the highest first-order conversion priority", () => {
  assert.equal(resolveFirstOrderConversionMode({ firstOrder: true, hasDraft: true, hasCheckoutRecovery: true }), "checkout_recovery");
  assert.equal(resolveFirstOrderConversionMode({ firstOrder: true, hasDraft: true, hasCheckoutRecovery: false }), "draft");
  assert.equal(resolveFirstOrderConversionMode({ firstOrder: true, hasDraft: false, hasCheckoutRecovery: false }), "first_order");
  assert.equal(resolveFirstOrderConversionMode({ firstOrder: false, hasDraft: false, hasCheckoutRecovery: false }), null);
});

test("Phase 34 removes duplicate first-order bonus banners from dashboard and order builder", () => {
  const dashboard = read("components/dashboard/DashboardOverviewContent.tsx");
  const builder = read("app/dashboard/new-order/page.tsx");
  assert.doesNotMatch(dashboard, /FirstOrderBonusBanner/);
  assert.doesNotMatch(builder, /FirstOrderBonusBanner/);
  assert.match(builder, /\/api\/rewards\/first-order-offer/);
  assert.match(builder, /first_order_bonus_view/);
  assert.match(builder, /quantityForMinimumSpend/);
});

test("Phase 34 first-order card explains the path before asking for payment", () => {
  const cards = read("components/dashboard/OrderConversionCards.tsx");
  assert.match(cards, /Your first order in three clear steps/);
  assert.match(cards, /Choose a service/);
  assert.match(cards, /Add a public link/);
  assert.match(cards, /No password required/);
  assert.match(cards, /Review exact total/);
  assert.match(cards, /Nothing is placed until you confirm the final step/);
});

test("Phase 34 uses neutral starter merchandising rather than unsupported popularity claims", () => {
  const cards = read("components/dashboard/OrderConversionCards.tsx");
  const builder = read("app/dashboard/new-order/page.tsx");
  assert.match(cards, /Starter choices/);
  assert.match(builder, /Quick start/);
  assert.match(builder, /Starter option/);
  assert.doesNotMatch(cards, /Popular starter choices|Most selected|Popular choice/i);
  assert.doesNotMatch(builder, /Most selected|Popular choice/i);
});

test("Phase 34 does not change first-order reward amounts or payment calculations", () => {
  const cards = read("components/dashboard/OrderConversionCards.tsx");
  const builder = read("app/dashboard/new-order/page.tsx");
  assert.match(cards, /firstOrderOffer\.reward/);
  assert.match(cards, /firstOrderOffer\.minimum/);
  assert.match(builder, /firstOrderOffer\.minimum/);
  assert.match(builder, /walletApplied/);
  assert.match(builder, /remainingToPay/);
});


test("Phase 34 keeps failed, cancelled and refunded attempts inside the first-order journey", () => {
  assert.equal(isQualifyingFirstOrderState({ status: "failed", payment_status: "failed" }), false);
  assert.equal(isQualifyingFirstOrderState({ status: "cancelled", payment_status: "paid" }), false);
  assert.equal(isQualifyingFirstOrderState({ status: "refunded", payment_status: "refunded" }), false);
  assert.equal(isQualifyingFirstOrderState({ status: "pending", payment_status: null }), true);

  const context = buildFirstOrderContext(
    { enabled: true, manual_approval: false, minimum_order_amount: 500, new_customer_reward: 100 },
    [{ status: "failed", payment_status: "failed" }],
  );
  assert.deepEqual(context, { firstOrder: true, eligible: true, reward: 100, minimum: 500 });
});

test("Phase 34 exposes first-order context even when no reward is active", () => {
  const context = buildFirstOrderContext(
    { enabled: false, manual_approval: false, minimum_order_amount: 500, new_customer_reward: 100 },
    [],
  );
  assert.deepEqual(context, { firstOrder: true, eligible: false });

  const api = read("app/api/rewards/first-order-offer/route.ts");
  assert.match(api, /buildFirstOrderContext/);
  assert.match(api, /firstOrder: false, eligible: false/);
});

test("Phase 34 keeps dashboard and builder on the same first-order path", () => {
  const dashboard = read("app/dashboard/page.tsx");
  const overview = read("components/dashboard/DashboardOverviewContent.tsx");
  const cards = read("components/dashboard/OrderConversionCards.tsx");
  const builder = read("app/dashboard/new-order/page.tsx");

  assert.match(dashboard, /FIRST_ORDER_NON_QUALIFYING_STATES/);
  assert.match(dashboard, /const qualifyingOrders = count\(18\)/);
  assert.match(dashboard, /const firstOrder = !failed\(18\) && qualifyingOrders === 0/);
  assert.match(overview, /source=first_order_dashboard/);
  assert.match(cards, /source=first_order_dashboard/);
  assert.match(builder, /const \[firstOrder, setFirstOrder\]/);
  assert.match(builder, /firstOrder && currentStep === 1/);
  assert.match(builder, /Start with a clear four-step order review/);
  assert.match(builder, /step: "first_order_entry"/);
});
