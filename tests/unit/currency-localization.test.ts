import test from "node:test";
import assert from "node:assert/strict";
import { convertDisplayAmount, formatCurrency, getDisplayCurrencyForCountry } from "../../lib/currency.ts";

const rates = { INR: 1, USD: 0.012, GBP: 0.0095, EUR: 0.011, CAD: 0.016, AUD: 0.018, AED: 0.044, SGD: 0.016 } as const;

test("country mapping uses supported markets with a safe INR fallback", () => {
  assert.equal(getDisplayCurrencyForCountry("IN"), "INR");
  assert.equal(getDisplayCurrencyForCountry("US"), "USD");
  assert.equal(getDisplayCurrencyForCountry("GB"), "GBP");
  assert.equal(getDisplayCurrencyForCountry("DE"), "EUR");
  assert.equal(getDisplayCurrencyForCountry("XX"), "INR");
});

test("conversion derives display values from INR paise and never invents a missing rate", () => {
  assert.equal(convertDisplayAmount(79900, "USD", rates), 9.59);
  assert.equal(convertDisplayAmount(79900, "AED", rates), 35.16);
  assert.equal(convertDisplayAmount(79900, "USD", { INR: 1 }), null);
  assert.match(formatCurrency(799, "USD", rates), /9\.59/);
  assert.match(formatCurrency(799, "USD", { INR: 1 }), /799/);
});
