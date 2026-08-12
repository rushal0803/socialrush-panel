import { expect, test } from "@playwright/test";
import { classifyCashfreeDirectVerification } from "../../lib/payments/cashfree-direct-status";

test("failed Cashfree direct payment is terminal and does not look pending", () => {
  expect(classifyCashfreeDirectVerification("ACTIVE", [{ payment_status: "FAILED" }])).toBe("failed");
  expect(classifyCashfreeDirectVerification("ACTIVE", [{ payment_status: "USER_DROPPED" }])).toBe("cancelled");
});

test("a processable newest Cashfree attempt stays pending with an older failed attempt", () => {
  expect(classifyCashfreeDirectVerification("ACTIVE", [
    { payment_status: "FAILED", payment_completion_time: "2026-08-12T10:00:00.000Z" },
    { payment_status: "PENDING", payment_time: "2026-08-12T10:01:00.000Z" },
  ])).toBe("pending");
});

test("a newer terminal Cashfree attempt overrides stale pending attempts", () => {
  expect(classifyCashfreeDirectVerification("ACTIVE", [
    { payment_status: "NOT_ATTEMPTED", payment_time: "2026-08-12T10:00:00.000Z" },
    { payment_status: "FAILED", payment_completion_time: "2026-08-12T10:02:00.000Z" },
  ])).toBe("failed");
  expect(classifyCashfreeDirectVerification("ACTIVE", [
    { payment_status: "PENDING", payment_time: "2026-08-12T10:00:00.000Z" },
    { payment_status: "USER_DROPPED", payment_completion_time: "2026-08-12T10:02:00.000Z" },
  ])).toBe("cancelled");
});

test("captured Cashfree success remains eligible for existing idempotent settlement", () => {
  expect(classifyCashfreeDirectVerification("PAID", [{ payment_status: "SUCCESS", is_captured: true }])).toBe("success");
});
