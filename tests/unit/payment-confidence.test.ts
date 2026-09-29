import test from "node:test";
import assert from "node:assert/strict";
import { buildPaymentRecovery, paymentConfidenceSummary, paymentState } from "../../lib/payments/confidence.ts";

test("payment confidence classifies common payment states", () => {
  assert.equal(paymentState("completed"), "completed");
  assert.equal(paymentState("processing"), "pending");
  assert.equal(paymentState("failed"), "failed");
  assert.equal(paymentState("refunded"), "refunded");
  assert.equal(paymentState("mystery"), "other");
});

test("old pending payments tell the customer not to pay again and route to support", () => {
  const recovery = buildPaymentRecovery({
    id: "txn-1",
    type: "credit",
    status: "pending",
    payment_method: "bank_transfer",
    amount: 1000,
    created_at: "2026-09-28T00:00:00Z",
  }, new Date("2026-09-30T00:00:00Z").getTime());
  assert.equal(recovery?.actionHref, "/dashboard/support");
  assert.match(recovery?.detail || "", /Do not pay again/i);
});

test("recent pending payments route to the owned billing receipt", () => {
  const recovery = buildPaymentRecovery({
    id: "txn-abc",
    type: "credit",
    status: "processing",
    payment_method: "upi",
    amount: 500,
    created_at: "2026-09-30T00:00:00Z",
  }, new Date("2026-09-30T06:00:00Z").getTime());
  assert.equal(recovery?.actionHref, "/dashboard/billing/transactions/txn-abc");
  assert.match(recovery?.detail || "", /Do not submit the same payment again/i);
});

test("failed payments provide a safe retry path without implying a completed credit", () => {
  const recovery = buildPaymentRecovery({
    id: "txn-failed",
    type: "credit",
    status: "failed",
    payment_method: "upi",
    amount: 250,
    created_at: "2026-09-30T00:00:00Z",
  });
  assert.equal(recovery?.actionHref, "/dashboard/add-funds");
  assert.match(recovery?.detail || "", /No completed wallet credit/i);
});

test("payment confidence summary keeps refunded separate from failed", () => {
  assert.deepEqual(paymentConfidenceSummary([
    { id:"1",type:"credit",status:"completed",payment_method:"upi",amount:100,created_at:"2026-09-30T00:00:00Z" },
    { id:"2",type:"credit",status:"pending",payment_method:"upi",amount:100,created_at:"2026-09-30T00:00:00Z" },
    { id:"3",type:"credit",status:"failed",payment_method:"upi",amount:100,created_at:"2026-09-30T00:00:00Z" },
    { id:"4",type:"refund",status:"refunded",payment_method:"upi",amount:100,created_at:"2026-09-30T00:00:00Z" },
  ]), { completed:1,pending:1,failed:1,refunded:1,other:0 });
});
