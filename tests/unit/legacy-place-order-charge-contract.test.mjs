import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const review = readFileSync(new URL("../../docs/audits/legacy-place-order-charge-fix-review.md", import.meta.url), "utf8");

test("legacy order charge fix review documents required v_charge INSERT", () => {
  assert.match(review, /quantity, charge\)/);
  assert.match(review, /p_quantity, v_charge\)/);
  assert.match(review, /NOT NULL/);
});

test("legacy order fix requires isolated tests and explicit production approval", () => {
  assert.match(review, /isolated PostgreSQL/i);
  assert.match(review, /insufficient balance/i);
  assert.match(review, /idempotency and concurrency/i);
  assert.match(review, /explicit production migration approval/i);
});
