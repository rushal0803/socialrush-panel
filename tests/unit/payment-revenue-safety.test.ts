import test from "node:test";
import assert from "node:assert/strict";
import { validateWalletCapture } from "../../lib/payments/wallet-validation.ts";
import { buildVerifiedRevenueDashboard } from "../../lib/analytics/revenue-dashboard.ts";
import { indiaMonthStart, indiaReportingStart } from "../../lib/analytics/financial-report.ts";
import { walletBalanceEffect, walletAmountPrefix } from "../../lib/payments/wallet-ledger.ts";

test.skip("N/A retired provider: wallet captures require exact price, identity, currency, capture and funding type", () => {
  const expected = { providerOrderId: "order_1", amount: "40.00", paymentMethod: "upi", type: "credit", status: "pending" };
  const payment = { id: "pay_1", order_id: "order_1", amount: 4000, currency: "INR", status: "captured" };
  assert.equal(validateWalletCapture(payment, expected), true);
  for (const patch of [{ amount: 3999 }, { amount: 4001 }, { currency: "USD" }, { order_id: "other" }, { status: "authorized" }, { id: "" }]) {
    assert.equal(validateWalletCapture({ ...payment, ...patch }, expected), false);
  }
  for (const patch of [{ amount: 0 }, { amount: "NaN" }, { type: "debit" }, { status: "cancelled" }, { paymentMethod: "cashfree" }]) {
    assert.equal(validateWalletCapture(payment, { ...expected, ...patch }), false);
  }
});

test("reporting uses IST calendar boundaries and preserves negative net without duplicate IDs", () => {
  assert.equal(indiaReportingStart(1, new Date("2026-10-20T01:00:00Z")), "2026-10-19T18:30:00.000Z");
  assert.equal(indiaReportingStart(7, new Date("2026-10-20T01:00:00Z")), "2026-10-13T18:30:00.000Z");
  assert.equal(indiaMonthStart(new Date("2026-10-01T00:00:00Z")), "2026-09-30T18:30:00.000Z");
  const order = { id: "o1", user_id: "u1", charge: 10, platform: "facebook", service_name: "Followers", created_at: "2026-10-20T00:00:00Z" };
  const refund = { id: "r1", amount: 30, created_at: "2026-10-20T00:00:00Z" };
  const d = buildVerifiedRevenueDashboard({ paidOrders: [order, order], refunds: [refund, refund] });
  assert.equal(d.daily[0].gross, 10); assert.equal(d.daily[0].refunds, 30); assert.equal(d.daily[0].net, -20);
  assert.equal(d.daily[0].orders, 1);
});

test("wallet statements reconcile reserved gateway refunds without a fictitious credit", () => {
  const deposit = { amount: 40, type: "credit", status: "completed" };
  const reservation = { amount: 40, type: "debit", status: "completed" };
  const externalRefund = { amount: 40, type: "refund", status: "completed", metadata: { refund_kind: "wallet_deposit" } };
  assert.equal([deposit, reservation, externalRefund].reduce((sum, row) => sum + walletBalanceEffect(row), 0), 0);
  assert.equal(walletAmountPrefix(externalRefund), "Returned ");
  assert.equal(walletBalanceEffect({ ...externalRefund, metadata: { refund_kind: "order_cancelled" } }), 40);
  assert.equal(walletBalanceEffect({ ...deposit, status: "pending" }), 0);
  assert.equal(walletBalanceEffect({ amount: 40, type: "refund", status: "completed", description: "Payment refunded to original method" }), -40);
  assert.equal([deposit, reservation, deposit].reduce((sum, row) => sum + walletBalanceEffect(row), 0), 40);
});
