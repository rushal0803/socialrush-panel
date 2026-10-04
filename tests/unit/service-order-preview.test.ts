import assert from "node:assert/strict";
import { test } from "node:test";
import { previewOrderTotal, previewQuantities } from "../../lib/cro/service-order-preview.ts";

const rules = { minQuantity: 100, maxQuantity: 10000 };
test("uses supplied live rates with dashboard paise rounding", () => {
  assert.equal(previewOrderTotal(1234.56, 2500, rules), 3086.4);
  assert.equal(previewOrderTotal(799, 100, rules), 79.9);
  assert.equal(previewOrderTotal(12.34, 101, rules), 1.25);
});
test("never offers totals for invalid quantities or unavailable pricing", () => {
  for (const quantity of [0, 99, 10001, 100.5, NaN, Infinity]) assert.equal(previewOrderTotal(799, quantity, rules), null);
  for (const rate of [0, -1, NaN, Infinity]) assert.equal(previewOrderTotal(rate, 100, rules), null);
});
test("presets and totals respect nonzero step origins and narrow ranges", () => {
  const stepped = { minQuantity: 125, maxQuantity: 1025, quantityStep: 100 };
  assert.deepEqual(previewQuantities(stepped), [125]);
  assert.equal(previewOrderTotal(100, 500, stepped), null);
  assert.equal(previewOrderTotal(100, 525, stepped), 52.5);
  assert.deepEqual(previewQuantities({ minQuantity: 750, maxQuantity: 800 }), [750]);
});
