import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  checkoutAmountPrefill,
  checkoutFundingMessage,
  checkoutQuantityOptions,
  checkoutShortfall,
  clampCheckoutQuantity,
  safeCheckoutReturnPath,
} from "../../lib/cro/checkout-optimization.ts";

const read = (path: string) => readFileSync(new URL("../../" + path, import.meta.url), "utf8");

test("Phase 35 keeps public checkout quantities inside the service range", () => {
  assert.deepEqual(checkoutQuantityOptions(100, 7500), [100, 1000, 5000]);
  assert.deepEqual(checkoutQuantityOptions(12000, 15000), [12000, 15000]);
  assert.equal(clampCheckoutQuantity(50, 100, 5000), 100);
  assert.equal(clampCheckoutQuantity(9999, 100, 5000), 5000);
  assert.equal(clampCheckoutQuantity(1550.9, 100, 5000), 1550);

  const source = read("app/order-summary/content.tsx");
  assert.match(source, /min={service\.minQuantity}/);
  assert.match(source, /max={service\.maxQuantity}/);
  assert.match(source, /Allowed range:/);
  assert.match(source, /text-base text-white[^"]*sm:text-sm/);
});

test("Phase 35 describes the wallet split as a pre-payment expectation", () => {
  const split = checkoutFundingMessage({ walletApplied: 2000, payableNow: 17995 });
  assert.equal(split.eyebrow, "Wallet + payment split");
  assert.match(split.detail, /expects to apply/i);
  assert.match(split.detail, /Pay only the remaining amount/i);

  const direct = read("components/dashboard/DirectUpiPaymentClient.tsx");
  const builder = read("app/dashboard/new-order/page.tsx");
  assert.match(direct, /Wallet to apply/);
  assert.match(builder, /Wallet to apply/);
  assert.match(builder, /Projected wallet after order/);
  assert.match(builder, /next screen confirms the wallet\/payment split again/i);
});

test("Phase 35 makes bank and USDT payment details easier to copy", () => {
  const direct = read("components/dashboard/DirectUpiPaymentClient.tsx");
  assert.match(direct, /Copy USDT TRC20 address/);
  assert.match(direct, /"Account number","IFSC"/);
  assert.match(direct, /UPI is recommended for the fastest INR handoff/);
  assert.match(direct, /Do not start a second transfer while verification is pending/);
});

test("Phase 35 recovers package checkout with the exact Add Funds shortfall", () => {
  assert.equal(checkoutShortfall(5000, 1800), 3200);
  assert.equal(checkoutShortfall(5000, 6000), 0);
  assert.equal(checkoutShortfall(5000, null), 5000);

  const packages = read("components/marketing/packages/PackageCheckoutContent.tsx");
  assert.match(packages, /\/dashboard\/add-funds\?amount=/);
  assert.match(packages, /wallet is short by/i);
  assert.match(packages, /addFundsHref/);
});

test("Phase 35 only accepts safe internal checkout return paths and valid funding prefills", () => {
  assert.equal(safeCheckoutReturnPath("/packages/checkout?packageId=abc"), "/packages/checkout?packageId=abc");
  assert.equal(safeCheckoutReturnPath("//evil.example"), null);
  assert.equal(safeCheckoutReturnPath("https://evil.example"), null);
  assert.equal(safeCheckoutReturnPath("/foo\\bar"), null);
  assert.equal(checkoutAmountPrefill("3200.125"), 3200.13);
  assert.equal(checkoutAmountPrefill("99"), null);
  assert.equal(checkoutAmountPrefill("500001"), null);

  const addFunds = read("components/wallet/DesktopUpiQrCheckout.tsx");
  assert.match(addFunds, /checkoutAmountPrefill/);
  assert.match(addFunds, /safeCheckoutReturnPath/);
  assert.match(addFunds, /Return to Checkout/);
});
