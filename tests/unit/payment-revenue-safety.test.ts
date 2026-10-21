import test from "node:test";
import assert from "node:assert/strict";
import { processGatewayRefund, type RefundDependencies, type RefundRequest, type GatewayRefund } from "../../lib/payments/gateway-refund.ts";
import { validateWalletCapture } from "../../lib/payments/wallet-validation.ts";
import { buildVerifiedRevenueDashboard } from "../../lib/analytics/revenue-dashboard.ts";
import { indiaMonthStart, indiaReportingStart } from "../../lib/analytics/financial-report.ts";
import { walletBalanceEffect, walletAmountPrefix } from "../../lib/payments/wallet-ledger.ts";

function refundFixture() {
  let current: RefundRequest = { id: "request-1", provider_payment_id: "pay_1", amount: "40.00", status: "reserved", provider_refund_id: null };
  const remote: GatewayRefund[] = [];
  let posts = 0;
  const deps: RefundDependencies = {
    claim: async () => {
      if (current.status !== "reserved") return false;
      current = { ...current, status: "submitting" }; return true;
    },
    record: async (_, status, providerId) => {
      if (["completed", "failed"].includes(current.status)) return { ...current };
      current = { ...current, status, provider_refund_id: providerId ?? current.provider_refund_id }; return { ...current };
    },
    payment: async () => ({ id: "pay_1", amount: 4000, currency: "INR", status: "captured", amount_refunded: 0 }),
    create: async (_, amount, requestId) => {
      posts++;
      const r = { id: "rfnd_1", payment_id: "pay_1", amount, currency: "INR", status: "processed", receipt: requestId };
      remote.push(r); return r;
    },
    fetchRefund: async id => remote.find(r => r.id === id)!,
    list: async () => [...remote],
  };
  return { deps, remote, current: () => ({ ...current }), posts: () => posts };
}

test("concurrent gateway workers make one external refund POST", async () => {
  const f = refundFixture();
  await Promise.all(Array.from({ length: 12 }, () => processGatewayRefund(f.current(), f.deps)));
  assert.equal(f.posts(), 1);
  assert.equal(f.current().status, "completed");
  await processGatewayRefund(f.current(), f.deps);
  assert.equal(f.posts(), 1);
});

test("lost provider response is reconciled by request receipt without another POST", async () => {
  const f = refundFixture(); const create = f.deps.create;
  f.deps.create = async (...args) => { await create(...args); throw new Error("network response lost"); };
  assert.equal((await processGatewayRefund(f.current(), f.deps)).status, "manual_review");
  assert.equal((await processGatewayRefund(f.current(), f.deps)).status, "completed");
  assert.equal(f.posts(), 1);
});

test("local settlement failure after provider success recovers from the provider reference", async () => {
  const f = refundFixture(); const record = f.deps.record; let fail = true;
  f.deps.record = async (...args) => {
    if (args[1] === "completed" && fail) { fail = false; throw new Error("DB unavailable"); }
    return record(...args);
  };
  await processGatewayRefund(f.current(), f.deps);
  await processGatewayRefund(f.current(), f.deps);
  assert.equal(f.current().status, "completed"); assert.equal(f.posts(), 1);
});

test("no reconciliation match, mismatch and multiple matches require review without reissue", async () => {
  for (const mode of ["none", "wrong_amount", "multiple"]) {
    const f = refundFixture(); const create = f.deps.create;
    f.deps.create = async (...args) => { await create(...args); throw new Error("uncertain"); };
    await processGatewayRefund(f.current(), f.deps);
    if (mode === "none") f.remote.length = 0;
    if (mode === "wrong_amount") f.remote[0].amount = 1;
    if (mode === "multiple") f.remote.push({ ...f.remote[0], id: "rfnd_2" });
    assert.equal((await processGatewayRefund(f.current(), f.deps)).status, "manual_review");
    assert.equal(f.posts(), 1);
  }
});

test("pending refund is not completed until the provider confirms processed", async () => {
  const f = refundFixture(); const create = f.deps.create;
  f.deps.create = async (...args) => { const r = await create(...args); r.status = "pending"; return r; };
  assert.equal((await processGatewayRefund(f.current(), f.deps)).status, "pending");
  f.remote[0].status = "processed";
  assert.equal((await processGatewayRefund(f.current(), f.deps)).status, "completed");
  assert.equal(f.posts(), 1);
});

test("partially refunded or noncaptured deposit fails preflight without a POST", async () => {
  const f = refundFixture();
  f.deps.payment = async () => ({ id: "pay_1", amount: 4000, currency: "INR", status: "captured", amount_refunded: 100 });
  assert.equal((await processGatewayRefund(f.current(), f.deps)).status, "manual_review");
  assert.equal(f.posts(), 0);
});

test("wallet captures require exact price, identity, currency, capture and funding type", () => {
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
