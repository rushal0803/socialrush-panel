import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { MANUAL_UPI_ID, MANUAL_UPI_PAYEE_NAME } from "../../lib/payments/manual-upi-config.ts";

const source = (path: string) => readFileSync(path, "utf8");

test("manual UPI recipient matches the selected PhonePe handle", () => {
  assert.equal(MANUAL_UPI_ID, "8860330771@ybl");
  assert.equal(MANUAL_UPI_PAYEE_NAME, "Rushal");
  assert.match(MANUAL_UPI_ID, /^[0-9]+@[a-z0-9]+$/);
});

test("wallet and order checkout use one payee for UPI app deep links and QR codes", () => {
  for (const path of [
    "components/wallet/DesktopUpiQrCheckout.tsx",
    "components/wallet/ManualUpiAddFunds.tsx",
    "app/dashboard/direct-upi/page.tsx",
  ]) {
    assert.match(source(path), /payments\/manual-upi-config/, path);
    assert.doesNotMatch(source(path), /8860330771@pthdfc/, path);
  }
  const wallet = source("components/wallet/DesktopUpiQrCheckout.tsx");
  assert.match(wallet, /pa: UPI_ID, pn: PAYEE/);
  assert.match(wallet, /data=\$\{encodeURIComponent\(upiHref\)\}/);
  const order = source("components/dashboard/DirectUpiPaymentClient.tsx");
  assert.match(order, /pa: upiId, pn: payeeName/);
  assert.match(order, /data=\$\{encodeURIComponent\(upiHref\)\}/);
});

test("legacy checkout uses new recipient without enabling disabled UPI payments", () => {
  for (const path of [
    "components/dashboard/ProfessionalUpiCheckout.tsx",
    "components/dashboard/TemporaryWhatsAppCheckout.tsx",
  ]) {
    const content = source(path);
    assert.match(content, /payments\/manual-upi-config/);
    assert.match(content, /NEXT_PUBLIC_UPI_ID\?\.trim\(\) \? MANUAL_UPI_ID : ""/);
  }
});
