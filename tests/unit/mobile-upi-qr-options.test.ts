import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync("components/wallet/DesktopUpiQrCheckout.tsx", "utf8");

test("UPI request embeds exact amount and INR currency", () => {
  assert.match(source, /am: amount\.toFixed\(2\)/);
  assert.match(source, /cu: "INR"/);
});

test("mobile offers direct UPI and QR choices", () => {
  assert.match(source, /with UPI App/);
  assert.match(source, /Show QR Code/);
  assert.match(source, /another phone or UPI-enabled device/);
});

test("payment confirmation requires UTR", () => {
  assert.match(source, /UTR \/ Transaction ID/);
  assert.match(source, /Submit payment for verification/);
});
