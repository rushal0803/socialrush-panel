import assert from "node:assert/strict";
import test from "node:test";
import { customerGuidance, customerGuidanceLinks } from "../../lib/trust/customer-guidance.ts";

test("shared trust guidance avoids unsupported guarantees and directs customers to live details", () => {
  const copy = Object.values(customerGuidance).join(" ").toLowerCase();
  assert.match(copy, /public destination link/);
  assert.match(copy, /never share/);
  assert.match(copy, /active service|selected service/);
  assert.doesNotMatch(copy, /guaranteed|lifetime|24\/7|verified purchase/);
});

test("shared trust links only target public trust routes", () => {
  for (const [, href] of customerGuidanceLinks) assert.match(href, /^\/(?!dashboard|admin|api)/);
});
