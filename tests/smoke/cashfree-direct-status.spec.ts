import { expect, test } from "@playwright/test";
import { classifyCashfreeDirectVerification } from "../../lib/payments/cashfree-direct-status";

test("failed Cashfree direct payment is terminal and does not look pending", () => {
  expect(classifyCashfreeDirectVerification("ACTIVE", [{ payment_status: "FAILED" }])).toBe("failed");
  expect(classifyCashfreeDirectVerification("ACTIVE", [{ payment_status: "USER_DROPPED" }])).toBe("cancelled");
});

test("a processable Cashfree attempt stays pending even with an older failed attempt", () => {
  expect(classifyCashfreeDirectVerification("ACTIVE", [
    { payment_status: "FAILED" },
    { payment_status: "PENDING" },
  ])).toBe("pending");
});

test("captured Cashfree success remains eligible for existing idempotent settlement", () => {
  expect(classifyCashfreeDirectVerification("PAID", [{ payment_status: "SUCCESS", is_captured: true }])).toBe("success");
});
