import assert from "node:assert/strict";
import test from "node:test";
import { isSameManualPayment } from "../../lib/payments/manual-payment-replay.ts";

const order = {
  payment_status: "verification_pending",
  customer_note: "UPI payment submitted for verification. Payment Ref: SR-TEST123456. UTR: TESTUTR12345. Wallet applied: INR 0.00. External amount: INR 50.00.",
};

test("exact UTR, reference, method and pending payment are safe to replay", () => {
  assert.equal(isSameManualPayment(order, "SR-TEST123456", "TESTUTR12345", "upi"), true);
});

test("different UTR cannot claim existing order as successful duplicate", () => {
  assert.equal(isSameManualPayment(order, "SR-TEST123456", "NEWUTR123456", "upi"), false);
});
test("different payment reference cannot claim existing order", () => {
  assert.equal(isSameManualPayment(order, "SR-DIFFERENT123", "TESTUTR12345", "upi"), false);
});
test("different method cannot claim existing order", () => {
  assert.equal(isSameManualPayment(order, "SR-TEST123456", "TESTUTR12345", "bank_transfer"), false);
});
test("non-pending, missing or incomplete payment note cannot claim replay", () => {
  assert.equal(isSameManualPayment({ ...order, payment_status: "paid" }, "SR-TEST123456", "TESTUTR12345", "upi"), false);
  assert.equal(isSameManualPayment({ ...order, customer_note: null }, "SR-TEST123456", "TESTUTR12345", "upi"), false);
  assert.equal(isSameManualPayment({ ...order, customer_note: "UPI payment submitted for verification. Payment Ref: SR-TEST123456. UTR: TESTUTR123456." }, "SR-TEST123456", "TESTUTR12345", "upi"), false);
});
test("bank transfer and USDT exact replays retain method specificity", () => {
  for (const [method,label] of [["bank_transfer","Bank transfer (IMPS/NEFT)"],["usdt_trc20","USDT (TRC20)"]]) {
    const matching = { ...order, customer_note: `${label} payment submitted for verification. Payment Ref: SR-TEST123456. UTR: TESTUTR12345. Wallet applied: INR 0.00.` };
    assert.equal(isSameManualPayment(matching, "SR-TEST123456", "TESTUTR12345", method), true);
  }
});
